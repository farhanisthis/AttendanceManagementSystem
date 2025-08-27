import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <NavBar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-8 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600">
          <p>&copy; 2024 Smart College. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
