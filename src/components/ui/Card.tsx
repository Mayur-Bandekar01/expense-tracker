import React from "react";
import { cn } from "../../lib/utils";

export type CardVariant = "default" | "card" | "subtle" | "interactive";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "card-3d",
  card: "card-3d",
  subtle:
    "bg-surface-subtle dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shadow-inner",
  interactive: "card-3d cursor-pointer",
};

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const currentVariantStyle = variantStyles[variant] ?? variantStyles.default;

  return (
    <div
      className={cn("rounded-2xl md:rounded-3xl p-5 md:p-6", currentVariantStyle, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold text-text-primary dark:text-white tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-text-secondary dark:text-slate-400 mt-0.5", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
