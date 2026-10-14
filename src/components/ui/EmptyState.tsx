import React from "react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-10 rounded-2xl md:rounded-3xl border border-dashed border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/60 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-3 text-xl shadow-subtle">
        {icon || "🍡"}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action ? (
        action
      ) : actionLabel && onAction ? (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
