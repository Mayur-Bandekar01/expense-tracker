import React from "react";
import { cn } from "../../lib/utils";
import { tx, textWrap } from "../../lib/textStyles";

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
    md: "h-3",
    lg: "h-4",
  }[size];

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
      <div
        className={cn(
          "w-full bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(15,23,42,0.12)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] p-[1px]",
          sizeClass
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-base",
            colorClass
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
      {showLabel && (
        <div className={cn(tx("caption3"), textWrap.body, "flex justify-between items-center text-text-secondary dark:text-slate-400 mt-1 font-mono")}>
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  );
}
