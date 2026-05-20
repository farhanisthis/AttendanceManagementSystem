import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  color = "indigo",
}) {
  const colorClasses = {
    indigo: {
      bg: "bg-indigo-50",
      icon: "text-indigo-600",
      trend: "text-indigo-600",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      trend: "text-green-600",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      trend: "text-blue-600",
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      trend: "text-orange-600",
    },
  };

  const styles = colorClasses[color] || colorClasses.indigo;
  const isPositive = trend > 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`${styles.bg} rounded-lg p-3`}>
          <Icon className={`w-6 h-6 ${styles.icon}`} />
        </div>
      </div>

      <div className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-tight">
        {label}
      </div>

      <div className="text-3xl font-bold text-slate-900 mb-3">{value}</div>

      {trend !== undefined && trendLabel && (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )}
          <span>
            {Math.abs(trend)}% {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}
