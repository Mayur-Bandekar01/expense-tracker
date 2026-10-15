"use client";

import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-y-[1px] active:scale-[0.99]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
    }[size];

    const variantStyles = {
      primary:
        "bg-gradient-to-b from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white border border-brand-700/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_2px_0_0_#3730a3,0_4px_10px_-2px_rgba(79,70,229,0.35)] active:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_1px_0_0_#3730a3]",
      secondary:
        "bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-800/90 hover:from-slate-50 hover:to-slate-200/80 dark:hover:from-slate-700 dark:hover:to-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_2px_0_0_rgba(15,23,42,0.06)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_2px_0_0_rgba(0,0,0,0.5)]",
      outline:
        "bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_2px_0_0_rgba(15,23,42,0.05)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_2px_0_0_rgba(0,0,0,0.45)] hover:border-slate-300 dark:hover:border-slate-600",
      ghost:
        "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
      danger:
        "bg-gradient-to-b from-rose-50 to-rose-100/70 dark:from-rose-950/60 dark:to-rose-950/40 hover:from-rose-100 hover:to-rose-200/60 text-rose-700 dark:text-rose-300 border border-rose-200/90 dark:border-rose-800/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_2px_0_0_rgba(225,29,72,0.12)]",
      success:
        "bg-gradient-to-b from-emerald-50 to-emerald-100/70 dark:from-emerald-950/60 dark:to-emerald-950/40 hover:from-emerald-100 hover:to-emerald-200/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_2px_0_0_rgba(16,185,129,0.12)]",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles, variantStyles, className)}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
