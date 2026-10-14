"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Transaction, Goal, CategoryBudgetRune } from "../../types/hunter";
import { formatINR, formatCompactINR, cn } from "../../lib/utils";
import { getTodayLocalDate, formatRelativeDate, formatDisplayDate } from "../../lib/dateUtils";
import { useHunterSystem } from "../../lib/hunterContext";
import { Button } from "../ui/Button";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import { EmptyState } from "../ui/EmptyState";

export interface StatusWindowProps {
  transactions: Transaction[];
  goals?: Goal[];
  runes?: CategoryBudgetRune[];
  initialPeriod?: "today" | "week" | "month";
  hunterName?: string;
  onNavigateToQuests?: () => void;
  onNavigateToBounties?: () => void;
  onNavigateToBudgets?: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onNewQuest?: () => void;
}

/**
 * Filter transactions based on selected period using local calendar
 */
function filterTxsByPeriod(txs: Transaction[], period: "today" | "week" | "month"): Transaction[] {
  const todayStr = getTodayLocalDate();

  if (period === "today") {
    return txs.filter((t) => t.date === todayStr);
  }

  if (period === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, "0")}-${String(weekAgo.getDate()).padStart(2, "0")}`;
    return txs.filter((t) => (t.date || "") >= weekAgoStr && (t.date || "") <= todayStr);
  }

  const currentYM = todayStr.slice(0, 7);
  return txs.filter((t) => (t.date || "").startsWith(currentYM));
}

function getCategoryIcon(category?: string, isIncome?: boolean) {
  const cat = (category || "").toLowerCase();
  if (isIncome) {
    return (
      <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  }
  if (cat.includes("food") || cat.includes("dining") || cat.includes("provision")) {
    return (
      <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  }
  if (cat.includes("transport")) {
    return (
      <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    );
  }
  if (cat.includes("grocer") || cat.includes("market")) {
    return (
      <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
  }
  if (cat.includes("shop") || cat.includes("gear")) {
    return (
      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export function StatusWindow({
  transactions,
  goals = [],
  runes = [],
  initialPeriod = "month",
  hunterName = "User",
  onNavigateToQuests,
  onNavigateToBounties,
  onNavigateToBudgets,
  onSelectTransaction,
  onDeleteTransaction,
  onNewQuest,
}: StatusWindowProps) {
  const router = useRouter();
  const { vitals, animeAccents, monthlyBudget } = useHunterSystem();
  const [period, setPeriod] = useState<"today" | "week" | "month">(initialPeriod);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Filtered transactions for active period
  const periodTxs = useMemo(() => {
    return filterTxsByPeriod(transactions, period);
  }, [transactions, period]);

  // All-time available balance (cumulative income minus cumulative expenses)
  const availableBalance = useMemo(() => {
    return (transactions || []).reduce((acc, t) => {
      const amt = Number(t.amount) || 0;
      return t.type === "income" ? acc + amt : acc - amt;
    }, 0);
  }, [transactions]);

  // Financial aggregates for active period
  const totals = useMemo(() => {
    const income = (periodTxs || [])
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const spent = (periodTxs || [])
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const net = income - spent;
    const savingsRate = income > 0 ? Math.max(0, Math.min(100, Math.round((net / income) * 100))) : 0;
    return { income, spent, net, savingsRate };
  }, [periodTxs]);

  // Helper for normalizing category names across presets, SMS, and custom tags
  const normalizeCat = (cat: string) => {
    const c = (cat || "").trim().toLowerCase();
    if (c.includes("food") || c.includes("dining") || c.includes("provision")) return "dining & food";
    if (c.includes("transport")) return "transportation";
    if (c.includes("utilit")) return "utilities & bills";
    if (c.includes("salary") || c.includes("income") || c.includes("bounty")) return "salary & income";
    if (c.includes("gear") || c.includes("shop")) return "shopping";
    if (c.includes("rent") || c.includes("housing")) return "rent & housing";
    return c;
  };

  // Enriched category budgets comparing spent vs limit
  const activeBudgets = useMemo(() => {
    const currentMonth = getTodayLocalDate().slice(0, 7);
    return (runes || []).map((rune) => {
      const runeCat = normalizeCat(rune?.category || "");
      const computedSpent = (transactions || [])
        .filter((tx) => {
          if (tx?.type !== "expense") return false;
          if (!tx?.date || !tx.date.startsWith(currentMonth)) return false;
          const txCat = normalizeCat(tx?.category || "");
          return (runeCat && txCat.includes(runeCat)) || (txCat && runeCat.includes(txCat)) || runeCat === txCat;
        })
        .reduce((sum, tx) => sum + (Number(tx?.amount) || 0), 0);

      const effectiveSpent = computedSpent;
      const limit = Number(rune?.limit) || 1;
      const percent = Math.min(100, Math.round((effectiveSpent / limit) * 100));

      return {
        ...rune,
        effectiveSpent,
        percent,
        remaining: Math.max(0, limit - effectiveSpent),
        isOverBudget: effectiveSpent > limit,
      };
    });
  }, [runes, transactions]);

  // Overall monthly budget summary based strictly on the current calendar month
  const monthlyBudgetSummary = useMemo(() => {
    const currentMonth = getTodayLocalDate().slice(0, 7);
    const currentMonthSpent = (transactions || [])
      .filter((t) => t.type === "expense" && (t.date || "").startsWith(currentMonth))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalRunesLimit = activeBudgets.reduce((sum, b) => sum + (Number(b.limit) || 0), 0);
    const totalLimit =
      typeof monthlyBudget === "number" && monthlyBudget > 0
        ? monthlyBudget
        : totalRunesLimit;
    const totalSpent = currentMonthSpent;
    const percent = totalLimit > 0 ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0;
    const remaining = Math.max(0, totalLimit - totalSpent);
    return { totalLimit, totalSpent, percent, remaining };
  }, [activeBudgets, monthlyBudget, transactions]);

  // 14-Day Expense History Bars
  const fourteenDayBars = useMemo(() => {
    const bars: { label: string; date: string; amount: number; isToday: boolean }[] = [];
    const now = new Date();
    const todayStr = getTodayLocalDate();

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayAmount = (transactions || [])
        .filter((t) => t.type === "expense" && t.date === ds)
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      bars.push({
        label: `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`,
        date: ds,
        amount: dayAmount,
        isToday: ds === todayStr,
      });
    }
    return bars;
  }, [transactions]);

  const maxExpenseDay = useMemo(() => {
    const amounts = fourteenDayBars.map((b) => b.amount);
    return amounts.length > 0 ? Math.max(...amounts, 0) : 0;
  }, [fourteenDayBars]);

  const total14DaysSpend = useMemo(() => {
    return fourteenDayBars.reduce((sum, b) => sum + b.amount, 0);
  }, [fourteenDayBars]);

  const averageDailyExpense = useMemo(() => {
    return Math.round(total14DaysSpend / 14);
  }, [total14DaysSpend]);

  // Recent 6 transactions
  const recentTransactions = useMemo(() => {
    return [...(transactions || [])]
      .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 6);
  }, [transactions]);

  // Top 3 active goals
  const highlightGoals = useMemo(() => {
    return (goals || []).slice(0, 3);
  }, [goals]);

  return (
    <div className="space-y-6">
      {/* ── 1. Page Header & Action Bar ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Overview
            </h1>
            {animeAccents && (
              <span
                suppressHydrationWarning
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/60"
              >
                Level {vitals.level} · Progress Milestone
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simplicity, clarity, and mindful wealth management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* iOS Segmented Period Selector */}
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl">
            {(["today", "week", "month"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 capitalize",
                  period === p
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-subtle dark:border dark:border-slate-700"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {p === "today" ? "Today" : p === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>

          {/* Prominent Add Transaction Button */}
          <Button
            size="md"
            variant="primary"
            onClick={onNewQuest}
            className="rounded-xl shadow-subtle px-4 py-2 text-xs font-semibold"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* ── 2. Available Balance & Mochi Companion Spotlight ─────────── */}
      <div className={cn("grid gap-4", animeAccents ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1")}>
        {/* Available Balance Hero Card */}
        <div className={cn(
          "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-3xl p-6 shadow-card flex flex-col justify-between",
          animeAccents ? "lg:col-span-2" : "w-full"
        )}>
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Available Balance
              </span>
            </div>
            <span
              suppressHydrationWarning
              className={cn(
                "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                totals.net >= 0
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60"
                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60"
              )}
            >
              {totals.net >= 0 ? `+${formatINR(totals.net)} net flow` : `${formatINR(totals.net)} net flow`}
            </span>
          </div>

          <div className="my-2">
            <div
              suppressHydrationWarning
              className={cn(
                "text-3xl md:text-4xl font-extrabold tracking-tight font-sans",
                availableBalance >= 0 ? "text-slate-900 dark:text-white" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatINR(availableBalance)}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Cumulative net balance (Total Inflow − Total Outflow)
            </p>
          </div>

          {availableBalance < 0 && totals.income === 0 && (
            <div className="my-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 shadow-subtle animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0">💡</span>
                <span>
                  Showing in minus because you logged <strong>{formatINR(totals.spent)}</strong> in expenses with <strong>₹0</strong> income. Add an income entry or starting balance to make your balance positive.
                </span>
              </div>
              <button
                type="button"
                onClick={onNewQuest}
                className="shrink-0 px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shadow-sm transition-all"
              >
                + Add Income
              </button>
            </div>
          )}

          {/* Quick Action Shortcuts */}
          <div className="my-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onNewQuest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold transition-all active:scale-[0.97]"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Income</span>
            </button>
            <button
              type="button"
              onClick={onNewQuest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all active:scale-[0.97]"
            >
              <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M20 12H4" />
              </svg>
              <span>− Expense</span>
            </button>
            {onNavigateToBudgets && (
              <button
                type="button"
                onClick={onNavigateToBudgets}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-all active:scale-[0.97]"
              >
                <span>📊 Budgets</span>
              </button>
            )}
            {onNavigateToBounties && (
              <button
                type="button"
                onClick={onNavigateToBounties}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-all active:scale-[0.97]"
              >
                <span>🎯 Goals</span>
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Inflow: <strong suppressHydrationWarning className="text-emerald-700 dark:text-emerald-400">{formatINR(totals.income)}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Outflow: <strong suppressHydrationWarning className="text-rose-700 dark:text-rose-400">{formatINR(totals.spent)}</strong>
              </span>
            </div>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Savings Rate: <strong suppressHydrationWarning className="text-slate-900 dark:text-white">{totals.savingsRate}%</strong>
            </span>
          </div>
        </div>

        {/* Subtle Anime Mascot: Mochi the Budget Companion */}
        {animeAccents && (
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl md:rounded-3xl p-5 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-lg shadow-subtle">
                  🍡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Mochi · Financial Companion
                  </h4>
                  <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono">
                    Daily insights
                  </span>
                </div>
              </div>
              <span
                suppressHydrationWarning
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 shadow-subtle"
              >
                ✨ Milestone {vitals.level}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 my-3 leading-relaxed">
              {totals.savingsRate >= 40
                ? "Outstanding work! You are saving over 40% of your earnings this period. Excellent financial discipline! 🌸"
                : totals.net >= 0
                ? "Steady and balanced! Your income exceeds your expenses. Keep up the consistent savings habit. 🍵"
                : "Friendly note: Expenses are higher than income this period. Consider trimming discretionary spending. 🍡"}
            </p>

            <div className="pt-2.5 border-t border-indigo-100/70 dark:border-indigo-900/40 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              <span>Goal: Consistent savings</span>
              <span>Keep steady →</span>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Four Executive Summary Metric Cards ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Cash Flow */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Flow</span>
            <Badge variant={totals.net >= 0 ? "income" : "expense"} size="sm">
              {totals.net >= 0 ? "Surplus" : "Deficit"}
            </Badge>
          </div>
          <div className="my-3">
            <div
              suppressHydrationWarning
              className={cn(
                "text-2xl font-bold tracking-tight font-sans",
                totals.net >= 0 ? "text-slate-900 dark:text-white" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatINR(totals.net)}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {period === "today" ? "Today's net" : period === "week" ? "Past 7 days" : "This month"}
            </p>
          </div>
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Savings Rate</span>
            <span
              suppressHydrationWarning
              className={cn("font-semibold", totals.savingsRate > 30 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300")}
            >
              {totals.savingsRate}%
            </span>
          </div>
        </Card>

        {/* Total Income */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Inflow</span>
            <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center text-xs font-bold">
              ↓
            </span>
          </div>
          <div className="my-3">
            <div
              suppressHydrationWarning
              className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-sans"
            >
              {formatINR(totals.income)}
            </div>
            <p suppressHydrationWarning className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {periodTxs.filter((t) => t.type === "income").length} credit entries
            </p>
          </div>
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Status</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Active Inflow</span>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Outflow</span>
            <span className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/60 flex items-center justify-center text-xs font-bold">
              ↑
            </span>
          </div>
          <div className="my-3">
            <div
              suppressHydrationWarning
              className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-sans"
            >
              {formatINR(totals.spent)}
            </div>
            <p suppressHydrationWarning className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {periodTxs.filter((t) => t.type === "expense").length} debit transactions
            </p>
          </div>
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Burn Ratio</span>
            <span suppressHydrationWarning className="text-slate-700 dark:text-slate-300 font-semibold">
              {totals.income > 0 ? `${Math.round((totals.spent / totals.income) * 100)}%` : "N/A"}
            </span>
          </div>
        </Card>

        {/* Monthly Budget Progress Card */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monthly Budget</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/mana/?edit=total")}
                className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline flex items-center gap-0.5"
                title="Change monthly budget limit"
              >
                <span>Edit</span>
                <span>→</span>
              </button>
              <span
                suppressHydrationWarning
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold font-mono"
              >
                {monthlyBudgetSummary.percent}%
              </span>
            </div>
          </div>
          <div className="my-3">
            <div
              suppressHydrationWarning
              className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans"
            >
              {formatINR(monthlyBudgetSummary.totalSpent)}
            </div>
            <p suppressHydrationWarning className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center justify-between gap-1 flex-wrap">
              <span>of {formatINR(monthlyBudgetSummary.totalLimit)} monthly cap</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatINR(monthlyBudgetSummary.remaining)} remaining
              </span>
            </p>
          </div>
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <ProgressBar
              value={monthlyBudgetSummary.totalSpent}
              max={monthlyBudgetSummary.totalLimit || 1}
              size="sm"
              variant="dynamic"
            />
          </div>
        </Card>
      </div>

      {/* ── 4. Main Dashboard Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Spending Chart & Recent Activity (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 14-Day Spending Velocity Chart */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Spending Trend</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daily expense distribution across the past 14 days
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Avg: {formatCompactINR(averageDailyExpense)}/day
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
                  Peak: {formatCompactINR(maxExpenseDay)}
                </span>
              </div>
            </CardHeader>

            {/* Sparkline Bar Chart */}
            <div className="pt-2">
              <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-2.5 px-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                {fourteenDayBars.map((bar, idx) => {
                  const heightPercent =
                    maxExpenseDay > 0 ? Math.max(8, Math.round((bar.amount / maxExpenseDay) * 100)) : 8;
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={bar.date}
                      className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Hover Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-12 z-20 px-2.5 py-1.5 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-sm text-white text-[11px] rounded-xl shadow-lg whitespace-nowrap pointer-events-none border border-slate-700/60 text-center animate-in fade-in duration-100">
                          <span className="font-bold font-numbers block">{formatINR(bar.amount)}</span>
                          <span className="text-slate-400 text-[10px] block font-medium">{bar.label}</span>
                        </div>
                      )}

                      {/* Bar Fill */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={cn(
                          "w-full rounded-t-md transition-all duration-150",
                          bar.amount === 0
                            ? "bg-slate-100 dark:bg-slate-800"
                            : bar.isToday
                            ? "bg-brand-600 hover:bg-brand-700 shadow-sm dark:bg-brand-500 dark:hover:bg-brand-400"
                            : "bg-brand-100 hover:bg-brand-200 dark:bg-brand-900/50 dark:hover:bg-brand-800/70"
                        )}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-Axis labels */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-2.5 px-1">
                <span suppressHydrationWarning>{fourteenDayBars[0]?.label}</span>
                <span suppressHydrationWarning>{fourteenDayBars[6]?.label}</span>
                <span suppressHydrationWarning className="text-brand-600 dark:text-brand-400 font-semibold">{fourteenDayBars[13]?.label} (Today)</span>
              </div>
            </div>
          </Card>

          {/* Recent Activity List (Apple Wallet Style) */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Latest recorded transactions and transfers
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={onNavigateToQuests}>
                View all →
              </Button>
            </CardHeader>

            {recentTransactions.length === 0 ? (
              <EmptyState
                title="No transactions recorded"
                description="Your transaction ledger is empty. Record your first expense or income entry."
                actionLabel="Add Transaction"
                onAction={onNewQuest}
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === "income";

                  return (
                    <div
                      key={tx.id}
                      onClick={() => onSelectTransaction?.(tx)}
                      className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group"
                    >
                      {/* Left: Merchant / Note & Category */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center text-sm shrink-0 border shadow-subtle",
                            isIncome
                              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          {getCategoryIcon(tx.category, isIncome)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {tx.note || tx.merchant || tx.category || "Untitled Transaction"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            <span>{tx.category || "General"}</span>
                            <span>•</span>
                            <span suppressHydrationWarning>{formatRelativeDate(tx.date)}</span>
                            {tx.method && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{tx.method}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Delete Action */}
                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        <div className="text-right">
                          <span
                            className={cn(
                              "text-sm font-bold tracking-tight font-sans",
                              isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                            )}
                          >
                            {isIncome ? "+" : "-"}{formatINR(tx.amount)}
                          </span>
                        </div>

                        {onDeleteTransaction && (
                          <button
                            type="button"
                            title="Delete transaction"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTransaction(tx.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Budgets & Savings Goals (1 col) */}
        <div className="space-y-6">
          {/* Monthly Category Budgets */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Budget Health</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Monthly category spending caps
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={onNavigateToBudgets}>
                Manage →
              </Button>
            </CardHeader>

            {activeBudgets.length === 0 ? (
              <EmptyState
                title="No active budgets"
                description="Set monthly category limits to prevent overspending."
                actionLabel="Create Budget"
                onAction={onNavigateToBudgets}
              />
            ) : (
              <div className="space-y-4">
                {activeBudgets.slice(0, 4).map((b) => (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{b.category}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 dark:text-white font-semibold">
                          {formatCompactINR(b.effectiveSpent)}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">/</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {formatCompactINR(b.limit)}
                        </span>
                        {b.isOverBudget && (
                          <Badge variant="expense" size="sm">
                            Exceeded
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ProgressBar
                      value={b.effectiveSpent}
                      max={b.limit}
                      size="sm"
                      variant="dynamic"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Savings Goals Snapshot */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Savings Goals</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Target milestones in progress
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={onNavigateToBounties}>
                View all →
              </Button>
            </CardHeader>

            {highlightGoals.length === 0 ? (
              <EmptyState
                title="No active goals"
                description="Create a savings target to track your progress."
                actionLabel="Add Goal"
                onAction={onNavigateToBounties}
              />
            ) : (
              <div className="space-y-3.5">
                {highlightGoals.map((g) => {
                  const saved = Number(g.savedAmount) || 0;
                  const target = Number(g.targetAmount) || 1;
                  const pct = Math.min(100, Math.round((saved / target) * 100));

                  return (
                    <div
                      key={g.id}
                      className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {g.title}
                        </span>
                        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 font-mono">
                          {pct}%
                        </span>
                      </div>
                      <ProgressBar value={saved} max={target} size="sm" variant="brand" />
                      <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{formatINR(saved)}</span>
                        <span>Target: {formatINR(target)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
