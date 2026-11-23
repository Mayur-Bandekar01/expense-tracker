"use client";

import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { tx, textWrap } from "../../lib/textStyles";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftAddon, rightAddon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={cn(tx("caption3"), textWrap.body, "text-slate-700 dark:text-slate-300 mb-1.5 block")}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {leftAddon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              tx("body5"),
              textWrap.body,
              "w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 transition-all duration-300 ease-base focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed",
              leftAddon && "pl-9",
              rightAddon && "pr-9",
              error && "border-rose-400 dark:border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {rightAddon}
            </div>
          )}
        </div>
        {error ? (
          <p className={cn(tx("caption4"), textWrap.body, "mt-1 text-rose-500 dark:text-rose-400")}>{error}</p>
        ) : helperText ? (
          <p className={cn(tx("caption4"), textWrap.body, "mt-1 text-slate-500 dark:text-slate-400")}>{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
