import React from "react";
import { cn } from "../../lib/utils";

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "brand" | "income" | "expense" | "dynamic";
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "dynamic",
  size = "md",
  className,
  showLabel = false,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / Math.max(1, max)) * 100)));

  const sizeClass = {
    sm: "h-2",
    md: "h-2.5",
    lg: "h-3.5",
  }[size];

  const getDynamicColor = () => {
    if (percentage > 90) return "bg-gradient-to-r from-rose-500 to-rose-600";
    if (percentage > 75) return "bg-gradient-to-r from-amber-500 to-amber-600";
    return "bg-gradient-to-r from-brand-500 to-indigo-500";
  };

  const colorClass = {
    brand: "bg-gradient-to-r from-brand-500 to-indigo-500",
    income: "bg-gradient-to-r from-emerald-500 to-teal-500",
    expense: "bg-gradient-to-r from-rose-500 to-rose-600",
    dynamic: getDynamicColor(),
  }[variant];

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(15,23,42,0.12)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] p-[1px]",
          sizeClass
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
            colorClass
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-text-secondary dark:text-slate-400 mt-1 font-mono">
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  );
}
