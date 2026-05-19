import React from "react";

export default function Section({ title, children, icon, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden animate-slide-up ${className}`}
    >
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/80 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {icon && <div className="text-2xl">{icon}</div>}
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
