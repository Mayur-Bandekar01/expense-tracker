import { Transaction } from "../types/hunter";
import { User } from "firebase/auth";
import { evaluateHunterRank } from "./utils";

export interface HunterVitals {
  rank: string;
  title: string;
  auraColor: string;
  level: number;
  currentExp: number;
  maxExp: number;
  vitalityRatio: number;
  dailyLoginStreak: number;
  netGold: number;
  totalInflow: number;
  totalOutflow: number;
  avatarUrl?: string;
  hunterName: string;
}

/** Single source of truth for vitals computation. Used by StatusLayout (sidebar) and StatusWindow (dashboard). */
export function computeVitals(transactions: Transaction[], user: User | null | undefined): HunterVitals {
  const totalInflow = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalOutflow = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netGold = totalInflow - totalOutflow;
  const rankInfo = evaluateHunterRank(netGold);

  const vitalityRatio =
    totalInflow > 0
      ? Math.max(0, Math.min(100, Math.round(((totalInflow - totalOutflow) / totalInflow) * 100)))
      : 0;

  const baseExp = transactions.length * 250 + Math.floor(Math.max(0, netGold) / 100);
  const level = Math.max(1, Math.floor(baseExp / 2500) + 1);
  const currentExp = baseExp % 2500;
  const maxExp = 2500;

  const userName = user?.displayName || (user?.email ? user.email.split("@")[0] : "User");
  const avatarUrl = user?.photoURL || undefined;

  return {
    rank: rankInfo.rank,
    title: rankInfo.title,
    auraColor: rankInfo.auraColor,
    level,
    currentExp,
    maxExp,
    vitalityRatio,
    dailyLoginStreak: Math.min(30, 7 + (transactions.length % 15)),
    netGold,
    totalInflow,
    totalOutflow,
    avatarUrl,
    hunterName: userName,
  };
}