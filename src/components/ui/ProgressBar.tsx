import React from "react";
import { cn } from "../../lib/utils";

export interface ProgressBarProps {
  value: number; // 0 to 100
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
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }[size];

  // Dynamic: turns green below 75%, amber between 75-90%, rose above 90%
  const getDynamicColor = () => {
    if (percentage > 90) return "bg-rose-500";
    if (percentage > 75) return "bg-amber-500";
    return "bg-brand-500";
  };

  const colorClass = {
    brand: "bg-brand-500",
    income: "bg-emerald-500",
    expense: "bg-rose-500",
    dynamic: getDynamicColor(),
  }[variant];

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden", sizeClass)}>
        <div
          className={cn("h-full rounded-full transition-all duration-300 ease-out", colorClass)}
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
