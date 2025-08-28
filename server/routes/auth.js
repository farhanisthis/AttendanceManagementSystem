import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const router = express.Router();

// Email configuration
let transporter = null;

// Only create transporter if email credentials are configured
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log("✅ Email service configured");
} else {
  console.log(
    "⚠️ Email credentials not configured. OTPs will only be logged to console."
  );
}

// Function to send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    // If email service is not configured, just log the OTP
    if (!transporter) {
      console.log(`📧 OTP for ${email}: ${otp} (Email service not configured)`);
      return true; // Return true so the API doesn't fail
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - Attendance Management System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Attendance Management System</p>
          </div>
          
          <div style="padding: 30px 20px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Password Reset OTP</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px dashed #667eea;">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin-bottom: 10px;">
                ${otp}
              </div>
              <p style="color: #666; margin: 0;">Enter this 6-digit code to reset your password</p>
            </div>
            
            <div style="margin-top: 25px; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>⚠️ Important:</strong> This OTP will expire in 10 minutes. 
                If you didn't request this password reset, please ignore this email.
              </p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #666; font-size: 14px;">
                Need help? Contact your system administrator.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #e0e0e0;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    return false;
  }
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Use case-insensitive email search to match the password reset logic
  const u = await User.findOne({
    email: { $regex: new RegExp(`^${email}$`, "i") },
  });

  if (!u) {
    console.log(`❌ Login failed: User not found for email ${email}`);
    return res.status(400).json({ error: "Invalid credentials" });
  }

  console.log(`🔍 Login attempt for user: ${u.email} (ID: ${u._id})`);
  const ok = await bcrypt.compare(password, u.passwordHash);

  if (!ok) {
    console.log(`❌ Login failed: Invalid password for user ${u.email}`);
    return res.status(400).json({ error: "Invalid credentials" });
  }

  console.log(`✅ Login successful for user: ${u.email}`);
  const token = jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({
    token,
    user: {
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      classOrBatch: u.classOrBatch,
    },
  });
});

// Endpoint to validate token and return user info
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classOrBatch: user.classOrBatch,
      },
    });
  } catch (error) {
    console.error("Error in /me endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map();

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists (case-insensitive search)
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store OTP with expiry
    otpStore.set(email.toLowerCase(), {
      otp,
      expiry: otpExpiry,
      attempts: 0,
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res
        .status(500)
        .json({ error: "Failed to send OTP email. Please try again." });
    }

    res.json({
      message: "OTP sent successfully to your email",
      otp: process.env.NODE_ENV === "development" ? otp : undefined, // Only show OTP in development
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const storedData = otpStore.get(email.toLowerCase());

    if (!storedData) {
      return res.status(400).json({ error: "OTP expired or not found" });
    }

    if (Date.now() > storedData.expiry) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (storedData.attempts >= 3) {
      otpStore.delete(email.toLowerCase());
      return res
        .status(400)
        .json({ error: "Too many attempts. Please request a new OTP" });
    }

    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP is valid, mark it as verified
    storedData.verified = true;
    storedData.verifiedAt = Date.now();

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// Reset password with OTP
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const storedData = otpStore.get(email.toLowerCase());

    if (!storedData || !storedData.verified) {
      return res
        .status(400)
        .json({ error: "OTP not verified. Please verify OTP first" });
    }

    if (Date.now() > storedData.expiry) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Find user and update password (case-insensitive search)
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!user) {
      console.log(
        `❌ Password reset failed: User not found for email ${email}`
      );
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`🔍 Password reset for user: ${user.email} (ID: ${user._id})`);

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password
    user.passwordHash = newPasswordHash;
    await user.save();

    console.log(`✅ Password updated successfully for user: ${user.email}`);

    // Remove OTP from store
    otpStore.delete(email.toLowerCase());

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in reset-password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiry) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

export default router;
