import React from "react";
import { cn } from "../../lib/utils";
import { BreathingStyle } from "../../types/hunter";

interface StatusCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  element?: BreathingStyle | "bounty" | "system";
  badgeText?: string;
  cornerBrackets?: boolean;
  glow?: boolean;
  action?: React.ReactNode;
}

export function StatusCard({
  title,
  subtitle,
  element = "system",
  badgeText,
  cornerBrackets = false,
  glow = false,
  action,
  className,
  children,
  ...props
}: StatusCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl md:rounded-3xl p-5 md:p-6 transition-all duration-200 border border-slate-200/80 dark:border-slate-800 bg-surface-card dark:bg-slate-900 shadow-card",
        className
      )}
      {...props}
    >
      {/* Top Header Row if title is supplied */}
      {(title || badgeText || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 mb-4">
          <div className="flex flex-col">
            {title && (
              <h3 className="text-sm font-semibold tracking-tight text-text-primary dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-brand-500 rounded-full" />
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {badgeText && (
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
                {badgeText}
              </span>
            )}
            {action}
          </div>
        </div>
      )}

      {/* Card Content Body */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
