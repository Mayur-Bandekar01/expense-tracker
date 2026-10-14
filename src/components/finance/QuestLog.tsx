"use client";

import React, { useState, useMemo } from "react";
import { Transaction, QuestDifficulty } from "../../types/hunter";
import { formatINR, cn } from "../../lib/utils";
import { formatDisplayDate } from "../../lib/dateUtils";
import { useHunterSystem } from "../../lib/hunterContext";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { EmptyState } from "../ui/EmptyState";

export interface QuestCardProps {
  transaction: Transaction;
  onClick?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}

/**
 * Determine difficulty rank based on transaction amount
 */
export function calculateQuestDifficulty(amount: number): QuestDifficulty {
  if (amount >= 50000) return "S-RANK";
  if (amount >= 20000) return "A-RANK";
  if (amount >= 8000) return "B-RANK";
  if (amount >= 2500) return "C-RANK";
  if (amount >= 800) return "D-RANK";
  return "E-RANK";
}

function getCategoryIcon(category: string, isIncome: boolean) {
  const cat = (category || "").toLowerCase();
  if (isIncome) {
    return (
      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  }
  if (cat.includes("food") || cat.includes("dining") || cat.includes("provision")) {
    return (
      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  }
  if (cat.includes("transport")) {
    return (
      <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    );
  }
  if (cat.includes("grocer") || cat.includes("market")) {
    return (
      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
  }
  if (cat.includes("shop") || cat.includes("gear")) {
    return (
      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    );
  }
  if (cat.includes("rent") || cat.includes("hous")) {
    return (
      <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
  }
  if (cat.includes("utilit") || cat.includes("bill") || cat.includes("phone")) {
    return (
      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (cat.includes("health") || cat.includes("gym") || cat.includes("fit")) {
    return (
      <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

/**
 * Single Transaction Row Component (Apple Wallet Style)
 */
export function QuestCard({ transaction, onClick, onDelete }: QuestCardProps) {
  const { animeAccents } = useHunterSystem();
  const isIncome = transaction.type === "income";
  const difficulty = transaction.difficulty || calculateQuestDifficulty(transaction.amount);

  return (
    <div
      onClick={() => onClick?.(transaction)}
      className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-card hover:shadow-md"
    >
      {/* Left Column: Icon + Description */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
            isIncome
              ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/60 shadow-sm"
              : "bg-slate-50 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700 shadow-sm"
          )}
        >
          {getCategoryIcon(transaction.category, isIncome)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-sans text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {transaction.merchant || transaction.note || transaction.category || "Transaction"}
            </h4>

            {transaction.isRecurring && (
              <Badge variant="warning" size="sm">
                Recurring
              </Badge>
            )}

            {animeAccents && (
              <span className="text-[10px] telemetry-code px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-cyan-400 font-semibold border border-slate-200 dark:border-slate-700">
                {difficulty}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            <span className="text-slate-600 dark:text-slate-300 font-medium">{transaction.category}</span>
            {transaction.note && transaction.merchant && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="truncate text-slate-400 dark:text-slate-400">{transaction.note}</span>
              </>
            )}
            {transaction.method && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="font-numbers text-[11px] text-slate-500 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                  {transaction.method}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Amount & Actions */}
      <div className="flex items-center gap-3 shrink-0 text-right">
        <div>
          <div
            className={cn(
              "font-numbers text-base sm:text-lg font-bold tracking-tight tabular-nums",
              isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
            )}
          >
            {isIncome ? "+" : "−"}
            {formatINR(transaction.amount)}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-numbers block">
            {transaction.time || (isIncome ? "Inflow" : "Outflow")}
          </span>
        </div>

        {/* Action icons on hover (visible by default on mobile touchscreens) */}
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {onDelete && (
            <button
              type="button"
              title="Delete record"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(transaction.id);
              }}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface QuestLogProps {
  transactions: Transaction[];
  onSelectTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onNewQuest?: () => void;
}

/**
 * Main Transactions Ledger Component
 */
export function QuestLog({
  transactions,
  onSelectTransaction,
  onDeleteTransaction,
  onNewQuest,
}: QuestLogProps) {
  const { animeAccents } = useHunterSystem();
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // Derive unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    (transactions || []).forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter((tx) => {
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (selectedCategory !== "all" && tx.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNote = tx.note?.toLowerCase().includes(query);
        const matchesMerchant = tx.merchant?.toLowerCase().includes(query);
        const matchesCat = tx.category?.toLowerCase().includes(query);
        const matchesAmount = (tx.amount != null ? String(tx.amount) : "").includes(query);
        if (!matchesNote && !matchesMerchant && !matchesCat && !matchesAmount) return false;
      }
      return true;
    });
  }, [transactions, filterType, selectedCategory, searchQuery]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortBy === "date-desc") return (b.date || "").localeCompare(a.date || "");
      if (sortBy === "date-asc") return (a.date || "").localeCompare(b.date || "");
      if (sortBy === "amount-desc") return (b.amount || 0) - (a.amount || 0);
      if (sortBy === "amount-asc") return (a.amount || 0) - (b.amount || 0);
      return 0;
    });
  }, [filteredTransactions, sortBy]);

  // Financial aggregates
  const stats = useMemo(() => {
    const list = filteredTransactions || [];
    const inflow = list
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const outflow = list
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    return {
      inflow,
      outflow,
      net: inflow - outflow,
      count: list.length,
    };
  }, [filteredTransactions]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    sortedTransactions.forEach((tx) => {
      const d = tx.date || "No Date";
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(tx);
    });
    return Array.from(map.entries());
  }, [sortedTransactions]);

  return (
    <div className="space-y-6">
      {/* ── KPI AGGREGATE STRIP ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card variant="card" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Total Transactions
          </span>
          <span className="text-xl font-bold font-numbers text-slate-900 dark:text-white mt-1 block">
            {stats.count}
          </span>
        </Card>

        <Card variant="card" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 block">
            Total Inflow
          </span>
          <span className="text-xl font-bold font-numbers text-emerald-600 dark:text-emerald-400 mt-1 block">
            +{formatINR(stats.inflow)}
          </span>
        </Card>

        <Card variant="card" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Total Outflow
          </span>
          <span className="text-xl font-bold font-numbers text-slate-900 dark:text-white mt-1 block">
            −{formatINR(stats.outflow)}
          </span>
        </Card>

        <Card variant="card" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Net Cash Flow
          </span>
          <span
            className={cn(
              "text-xl font-bold font-numbers mt-1 block",
              stats.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
            )}
          >
            {stats.net >= 0 ? "+" : "−"}
            {formatINR(Math.abs(stats.net))}
          </span>
        </Card>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ───────────────────────────────── */}
      <Card variant="card" className="p-4 sm:p-5 rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by merchant, note, category or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Switcher Pills (Grid on Mobile, Flex on Desktop) */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={cn(
                "py-2 sm:py-1.5 px-3 text-xs font-medium rounded-lg transition-all text-center justify-center flex items-center",
                filterType === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterType("income")}
              className={cn(
                "py-2 sm:py-1.5 px-3 text-xs font-medium rounded-lg transition-all text-center justify-center flex items-center gap-1.5",
                filterType === "income"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-sm font-semibold border border-emerald-100/60 dark:border-emerald-800/60"
                  : "text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Income</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType("expense")}
              className={cn(
                "py-2 sm:py-1.5 px-3 text-xs font-medium rounded-lg transition-all text-center justify-center flex items-center gap-1.5",
                filterType === "expense"
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shadow-sm font-semibold border border-rose-100/60 dark:border-rose-800/60"
                  : "text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>Expenses</span>
            </button>
          </div>
        </div>

        {/* Secondary Filters: Category & Sort (Equal 2 columns on mobile) */}
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2.5 sm:gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1 sm:gap-2 min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer truncate"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ── TRANSACTIONS LIST ──────────────────────────────────────── */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon="🍡"
          title="No Transactions Found"
          description={
            searchQuery || filterType !== "all" || selectedCategory !== "all"
              ? "Try adjusting your filters or search terms to locate transactions."
              : "No expenses or income logged yet. Record your first transaction to get started."
          }
          action={
            onNewQuest ? (
              <Button variant="primary" size="sm" onClick={onNewQuest}>
                Add Transaction
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {groupedByDate.map(([date, items]) => (
            <div key={date} className="space-y-2.5">
              {/* Date Header Pill */}
              <div className="flex items-center justify-between px-1.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  {formatDisplayDate(date)}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-numbers font-medium">
                  {items.length} {items.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              {/* Day Items */}
              <div className="space-y-2">
                {items.map((tx) => (
                  <QuestCard
                    key={tx.id}
                    transaction={tx}
                    onClick={onSelectTransaction}
                    onDelete={onDeleteTransaction ? () => setDeletingTx(tx) : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-App Confirmation Modal for Deleting Transaction */}
      <Modal
        isOpen={Boolean(deletingTx)}
        onClose={() => setDeletingTx(null)}
        title="Delete Transaction"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Permanently delete this transaction record?
          </p>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Merchant / Note:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {deletingTx?.merchant || deletingTx?.note || deletingTx?.category}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 font-numbers">
                {formatINR(deletingTx?.amount || 0)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              This will completely wipe the record from the database and recalculate your balances.
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setDeletingTx(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (deletingTx && onDeleteTransaction) {
                  onDeleteTransaction(deletingTx.id);
                  setDeletingTx(null);
                }
              }}
            >
              Wipe & Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default QuestLog;
