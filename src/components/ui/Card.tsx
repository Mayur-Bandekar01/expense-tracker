import React from "react";
import { cn } from "../../lib/utils";
import { tx, textWrap } from "../../lib/textStyles";

export type CardVariant = "default" | "card" | "subtle" | "interactive";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "card-3d",
  card: "card-3d",
  subtle:
    "bg-surface-subtle dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60",
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
        "flex items-center justify-between pb-3.5 mb-4",
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
        tx("title3"),
        textWrap.heading,
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
    <p className={cn(tx("caption2"), textWrap.body, className)} {...props}>
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
