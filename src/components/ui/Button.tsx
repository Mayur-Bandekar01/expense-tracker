"use client";

import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { tx } from "../../lib/textStyles";

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
      "inline-flex items-center justify-center rounded-xl transition-all duration-500 ease-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-y-[1px] active:scale-[0.99] hover:scale-[1.01] active:hover:scale-[0.99]";

    const sizeStyles = {
      sm: "px-3 py-1.5 gap-1.5",
      md: "px-4 py-2 gap-2",
      lg: "px-5 py-2.5 gap-2.5",
    }[size];

    const textStyle = {
      sm: tx("buttonSm"),
      md: tx("buttonMd"),
      lg: tx("buttonLg"),
    }[size];

    const variantStyles = {
      primary:
        "bg-brand-600 hover:bg-brand-700 text-white border border-brand-700 shadow-[0_2px_0_0_#3730a3,0_4px_10px_-2px_rgba(79,70,229,0.35)] active:shadow-[0_1px_0_0_#3730a3] dark:bg-brand-600 dark:hover:bg-brand-700",
      secondary:
        "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-[0_2px_0_0_rgba(15,23,42,0.06)] dark:shadow-[0_2px_0_0_rgba(0,0,0,0.5)]",
      outline:
        "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-[0_2px_0_0_rgba(15,23,42,0.05)] dark:shadow-[0_2px_0_0_rgba(0,0,0,0.45)] hover:border-slate-300 dark:hover:border-slate-600",
      ghost:
        "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
      danger:
        "bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/90 dark:border-rose-800/70 shadow-[0_2px_0_0_rgba(225,29,72,0.12)]",
      success:
        "bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800/70 shadow-[0_2px_0_0_rgba(16,185,129,0.12)]",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles, textStyle, variantStyles, className)}
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
