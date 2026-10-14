"use client";

import React, { useState, useMemo } from "react";
import { Goal } from "../../types/hunter";
import { formatINR, cn } from "../../lib/utils";
import { formatDisplayDate } from "../../lib/dateUtils";
import { useHunterSystem } from "../../lib/hunterContext";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import { EmptyState } from "../ui/EmptyState";

export interface BountyCardProps {
  goal: Goal;
  onDeposit?: (goalId: string, currentSaved: number) => void;
  onEdit?: (goal: Goal) => void;
  onViewHistory?: (goal: Goal) => void;
}

/**
 * Single Savings Goal Card
 */
export function BountyCard({ goal, onDeposit, onEdit, onViewHistory }: BountyCardProps) {
  const { animeAccents } = useHunterSystem();
  const saved = Number(goal?.savedAmount) || 0;
  const target = Number(goal?.targetAmount) || 0;
  const isCompleted = target > 0 && saved >= target;
  const progressPercent = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const pendingAmount = Math.max(0, target - saved);

  return (
    <Card
      variant="default"
      className={cn(
        "p-5 flex flex-col justify-between group rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card hover:border-slate-300 dark:hover:border-slate-700 transition-all",
        isCompleted && "border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20"
      )}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="neutral" size="sm">
            {goal.category || "General"}
          </Badge>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {goal.deadline && (
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                Target: {formatDisplayDate(goal.deadline)}
              </span>
            )}
            <Badge variant={isCompleted ? "income" : "brand"} size="sm">
              {isCompleted ? "Completed" : `${progressPercent}% Achieved`}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
          {goal.title}
        </h3>

        {/* Amounts */}
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <span className="text-xl sm:text-2xl font-bold font-numbers text-slate-900 dark:text-white">
              {formatINR(saved)}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-numbers block mt-0.5">
              Target: {formatINR(target)}
            </span>
          </div>

          <div className="text-right">
            <span className={cn("text-xs font-numbers font-medium", isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400")}>
              {isCompleted ? "Target Reached!" : `${formatINR(pendingAmount)} left`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <ProgressBar value={saved} max={target || 1} size="sm" variant={isCompleted ? "income" : "brand"} />
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
        <Button
          variant={isCompleted ? "secondary" : "primary"}
          size="sm"
          className="flex-1"
          onClick={() => onDeposit?.(goal.id, saved)}
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Contribution
        </Button>

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="p-2 rounded-xl text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
            title="Edit goal details"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}

        {onViewHistory && (
          <button
            type="button"
            onClick={() => onViewHistory(goal)}
            className="p-2 rounded-xl text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
            title="View contribution history"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
    </Card>
  );
}

export interface BountyBoardProps {
  goals: Goal[];
  onNewBounty?: () => void;
  onDeposit?: (goalId: string, currentSaved: number) => void;
  onEdit?: (goal: Goal) => void;
  onViewHistory?: (goal: Goal) => void;
}

/**
 * Main Savings Goals & Vaults Board
 */
export function BountyBoard({
  goals,
  onNewBounty,
  onDeposit,
  onEdit,
  onViewHistory,
}: BountyBoardProps) {
  const { animeAccents } = useHunterSystem();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Summary aggregates
  const aggregates = useMemo(() => {
    const list = goals || [];
    const totalTarget = list.reduce((acc, g) => acc + (Number(g?.targetAmount) || 0), 0);
    const totalSaved = list.reduce((acc, g) => acc + (Number(g?.savedAmount) || 0), 0);
    const completedCount = list.filter((g) => {
      const t = Number(g?.targetAmount) || 0;
      const s = Number(g?.savedAmount) || 0;
      return t > 0 && s >= t;
    }).length;
    return {
      totalTarget,
      totalSaved,
      pending: Math.max(0, totalTarget - totalSaved),
      completedCount,
      totalCount: list.length,
      overallPercent: totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0,
    };
  }, [goals]);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return (goals || []).filter((g) => {
      const t = Number(g?.targetAmount) || 0;
      const s = Number(g?.savedAmount) || 0;
      const isMet = t > 0 && s >= t;
      if (filter === "active") return !isMet;
      if (filter === "completed") return isMet;
      return true;
    });
  }, [goals, filter]);

  return (
    <div className="space-y-6">
      {/* ── GLOBAL GOALS OVERVIEW STRIP ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card variant="card" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Total Target
          </span>
          <span className="text-xl font-bold font-numbers text-slate-900 dark:text-white mt-1 block">
            {formatINR(aggregates.totalTarget)}
          </span>
        </Card>

        <Card variant="card" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 block">
            Total Accumulated
          </span>
          <span className="text-xl font-bold font-numbers text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatINR(aggregates.totalSaved)}
          </span>
        </Card>

        <Card variant="card" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Remaining to Save
          </span>
          <span className="text-xl font-bold font-numbers text-slate-900 dark:text-white mt-1 block">
            {formatINR(aggregates.pending)}
          </span>
        </Card>

        <Card variant="card" className="p-4 rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-card">
          <span className="text-xs font-medium text-brand-600 dark:text-brand-400 block">
            Completion Rate
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-numbers text-brand-600 dark:text-brand-400">
              {aggregates.overallPercent}%
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-numbers font-medium">
              ({aggregates.completedCount}/{aggregates.totalCount} achieved)
            </span>
          </div>
        </Card>
      </div>

      {/* ── FILTER BUTTONS (iOS Segmented Style) ────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all",
            filter === "all"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          All Goals ({(goals || []).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("active")}
          className={cn(
            "px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all",
            filter === "active"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          In Progress ({Math.max(0, (goals || []).length - aggregates.completedCount)})
        </button>
        <button
          type="button"
          onClick={() => setFilter("completed")}
          className={cn(
            "px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all",
            filter === "completed"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-sm font-semibold border border-emerald-100/60 dark:border-emerald-800/60"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          Achieved ({aggregates.completedCount})
        </button>
      </div>

      {/* ── GOALS CARDS GRID ───────────────────────────────────────── */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon="🌸"
          title="No Goals Found"
          description={
            filter !== "all"
              ? "No savings goals match the active filter criteria."
              : "Set up a savings goal for a trip, gadget, emergency fund, or investment milestone."
          }
          action={
            onNewBounty ? (
              <Button variant="primary" size="sm" onClick={onNewBounty}>
                Create Savings Goal
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => (
            <BountyCard
              key={goal.id}
              goal={goal}
              onDeposit={onDeposit}
              onEdit={onEdit}
              onViewHistory={onViewHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BountyBoard;
