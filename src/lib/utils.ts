import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BreathingStyle, HunterRankTier } from "../types/hunter";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format Indian Rupees with clean fintech standard formatting
 */
export function formatINR(
  amount: number | string | null | undefined,
  fractionDigits: number = 0
): string {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  const valid = isNaN(num) ? 0 : num;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(valid);
}

/**
 * Compact Indian currency formatting (e.g. ₹1.5L, ₹45K)
 */
export function formatCompactINR(amount: number | string | null | undefined): string {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  const valid = isNaN(num) ? 0 : num;
  const abs = Math.abs(valid);
  const sign = valid < 0 ? "-" : "";

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}

/**
 * Backward compatibility alias for legacy code
 */
export const formatGoldINR = formatINR;


/**
 * Get Elemental Glow and Color Styles based on Breathing Form
 */
export function getBreathingStyles(element: BreathingStyle): {
  badge: string;
  glow: string;
  border: string;
  text: string;
  gradient: string;
} {
  switch (element) {
    case "water":
      return {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        glow: "shadow-card",
        border: "border-emerald-200/80",
        text: "text-emerald-600",
        gradient: "from-emerald-500 to-teal-600",
      };
    case "sun":
    case "flame":
      return {
        badge: "bg-rose-50 text-rose-700 border-rose-200/80",
        glow: "shadow-card",
        border: "border-rose-200/80",
        text: "text-rose-600",
        gradient: "from-rose-500 to-amber-500",
      };
    case "thunder":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200/80",
        glow: "shadow-card",
        border: "border-amber-200/80",
        text: "text-amber-600",
        gradient: "from-amber-400 to-yellow-500",
      };
    default:
      return {
        badge: "bg-brand-50 text-brand-700 border-brand-200/80",
        glow: "shadow-card",
        border: "border-brand-200/80",
        text: "text-brand-600",
        gradient: "from-brand-500 to-indigo-600",
      };
  }
}

/**
 * Compute Hunter Rank based on Financial Net Worth
 */
export function evaluateHunterRank(netBalance: number): {
  rank: HunterRankTier;
  title: string;
  auraColor: string;
} {
  if (netBalance >= 500000) {
    return { rank: "NATIONAL_LEVEL", title: "Wealth Guardian", auraColor: "text-purple-600" };
  }
  if (netBalance >= 150000) {
    return { rank: "S", title: "Master Saver", auraColor: "text-amber-600" };
  }
  if (netBalance >= 75000) {
    return { rank: "A", title: "Budget Sage", auraColor: "text-teal-600" };
  }
  if (netBalance >= 30000) {
    return { rank: "B", title: "Prosperous Scout", auraColor: "text-brand-600" };
  }
  if (netBalance >= 10000) {
    return { rank: "C", title: "Steady Builder", auraColor: "text-emerald-600" };
  }
  if (netBalance >= 0) {
    return { rank: "D", title: "Fledgling Saver", auraColor: "text-blue-600" };
  }
  return { rank: "E", title: "Budget Explorer", auraColor: "text-rose-600" };
}
