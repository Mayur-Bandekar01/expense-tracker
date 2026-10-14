"use client";

import React, { useState, useMemo, useEffect } from "react";
import { formatINR, cn } from "../../lib/utils";
import { getTodayLocalDate } from "../../lib/dateUtils";
import { useHunterSystem } from "../../lib/hunterContext";
import { CategoryBudgetRune } from "../../types/hunter";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { EmptyState } from "../../components/ui/EmptyState";

export default function ManaReservesPage() {
  const {
    runes,
    saveRune,
    deleteRune,
    monthlyBudget,
    updateMonthlyBudget,
    transactions,
    animeAccents,
    spheres,
  } = useHunterSystem();

  // Category Budget Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRune, setEditingRune] = useState<CategoryBudgetRune | null>(null);
  const [catName, setCatName] = useState("Dining & Food");
  const [limitAmount, setLimitAmount] = useState("");
  const [element, setElement] = useState<"water" | "sun" | "thunder">("sun");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Overall Monthly Budget Modal State
  const [isTotalBudgetModalOpen, setIsTotalBudgetModalOpen] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState("");
  const [isSavingTotal, setIsSavingTotal] = useState(false);
  const [totalErrorMessage, setTotalErrorMessage] = useState<string | null>(null);

  // Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Current Month String (e.g. "2026-10")
  const currentMonth = useMemo(() => getTodayLocalDate().slice(0, 7), []);
  const monthLabel = useMemo(
    () => new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
    []
  );

  // Auto-open Total Budget modal if ?edit=total URL query is present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("edit") === "total") {
        setTotalBudgetInput(
          monthlyBudget && monthlyBudget > 0 ? String(monthlyBudget) : ""
        );
        setIsTotalBudgetModalOpen(true);
      }
    }
  }, [monthlyBudget]);

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

  // Compute live spent for each category from actual transactions for the current month
  const enrichedRunes = useMemo(() => {
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

      return {
        ...rune,
        effectiveSpent,
      };
    });
  }, [runes, transactions, currentMonth]);

  // Total actual expense for the month across all categories
  const actualMonthTotalSpent = useMemo(() => {
    return (transactions || [])
      .filter((tx) => tx?.type === "expense" && tx?.date && tx.date.startsWith(currentMonth))
      .reduce((sum, tx) => sum + (Number(tx?.amount) || 0), 0);
  }, [transactions, currentMonth]);

  const totalRunesCap = (enrichedRunes || []).reduce((sum, r) => sum + (Number(r?.limit) || 0), 0);

  // Effective Overall Budget: user's explicit monthly cap (e.g. ₹20,000) or sum of category limits
  const effectiveTotalCap =
    typeof monthlyBudget === "number" && monthlyBudget > 0
      ? monthlyBudget
      : totalRunesCap;

  const effectiveTotalBurn = actualMonthTotalSpent;
  const burnPercent = effectiveTotalCap > 0 ? Math.round((effectiveTotalBurn / effectiveTotalCap) * 100) : 0;
  const remainingTotal = Math.max(0, effectiveTotalCap - effectiveTotalBurn);

  const baseCategories = useMemo(
    () => [
      "Dining & Food",
      "Groceries",
      "Transportation",
      "Software & SaaS",
      "Entertainment",
      "Rent & Housing",
      "Utilities & Bills",
      "Health & Fitness",
      "Investments & SIP",
      "Miscellaneous",
    ],
    []
  );

  const categoryOptions = useMemo(() => {
    const set = new Set<string>(baseCategories);
    if (Array.isArray(spheres)) {
      spheres.forEach((s) => {
        if (s?.name && s.name.trim()) set.add(s.name.trim());
      });
    }
    if (editingRune?.category && editingRune.category.trim()) {
      set.add(editingRune.category.trim());
    }
    return Array.from(set).map((cat) => ({
      value: cat,
      label: cat,
    }));
  }, [baseCategories, spheres, editingRune]);

  // ── Overall Budget Handlers ──────────────────────────────────────
  const handleOpenEditTotalBudget = () => {
    setTotalBudgetInput(effectiveTotalCap > 0 ? String(effectiveTotalCap) : "");
    setTotalErrorMessage(null);
    setIsTotalBudgetModalOpen(true);
  };

  const handleSaveTotalBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotalErrorMessage(null);

    const parsed = parseFloat(totalBudgetInput);
    if (isNaN(parsed) || parsed <= 0) {
      setTotalErrorMessage("Please enter a valid monthly budget limit greater than ₹0.");
      return;
    }

    setIsSavingTotal(true);
    try {
      await updateMonthlyBudget(parsed);
      setSuccessMessage(`Overall monthly budget set to ${formatINR(parsed)}.`);
      setIsTotalBudgetModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("Save total budget error:", err);
      setTotalErrorMessage(err?.message || "Failed to update monthly budget. Please try again.");
    } finally {
      setIsSavingTotal(false);
    }
  };

  const handleRemoveTotalBudget = async () => {
    if (window.confirm("Remove overall monthly budget limit?")) {
      setIsSavingTotal(true);
      try {
        await updateMonthlyBudget(null);
        setSuccessMessage("Monthly budget limit removed.");
        setIsTotalBudgetModalOpen(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        setTotalErrorMessage(err?.message || "Failed to remove monthly budget.");
      } finally {
        setIsSavingTotal(false);
      }
    }
  };

  // ── Category Budget Handlers ────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingRune(null);
    setCatName("Dining & Food");
    setLimitAmount("");
    setElement("sun");
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rune: CategoryBudgetRune) => {
    setEditingRune(rune);
    setCatName(rune.category || "Dining & Food");
    setLimitAmount(String(rune.limit ?? ""));
    const validElem =
      rune.element === "thunder" || rune.element === "water" || rune.element === "sun"
        ? rune.element
        : "sun";
    setElement(validElem);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingRune(null);
    setErrorMessage(null);
  };

  const handleSaveRune = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedCat = catName.trim();
    if (!trimmedCat) {
      setErrorMessage("Please select or enter a valid category.");
      return;
    }

    const lim = parseFloat(limitAmount);
    if (isNaN(lim) || lim <= 0) {
      setErrorMessage("Please enter a valid monthly limit greater than ₹0.");
      return;
    }

    setIsSaving(true);
    try {
      await saveRune({
        id: editingRune ? editingRune.id : `rune-${Date.now()}`,
        category: trimmedCat,
        limit: Math.round(lim * 100) / 100,
        spent: editingRune ? (editingRune.spent ?? 0) : 0,
        element,
      });

      setSuccessMessage(
        editingRune
          ? `Budget for "${trimmedCat}" updated to ${formatINR(lim)}.`
          : `Budget for "${trimmedCat}" created with ${formatINR(lim)} limit.`
      );
      setIsModalOpen(false);
      setEditingRune(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      console.error("Save budget error:", err);
      setErrorMessage(err?.message || "Failed to save budget. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRune = async (id: string, name: string) => {
    if (window.confirm(`Delete budget limit for "${name}"?`)) {
      try {
        await deleteRune(id);
        setSuccessMessage(`Budget for "${name}" deleted.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        console.error("Delete budget error:", err);
        setErrorMessage(err?.message || "Failed to delete budget. Please try again.");
      }
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>📊</span>
            <span>Monthly Budgets</span>
          </h1>
          <p suppressHydrationWarning className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Category spending limits and allocation tracking for {monthLabel}.
          </p>
        </div>

        {/* Action Buttons: Clear distinction between editing Total Monthly Budget and adding Category limits */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <Button
            variant="outline"
            onClick={handleOpenEditTotalBudget}
            className="text-xs font-semibold"
          >
            <svg className="w-4 h-4 mr-1.5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {effectiveTotalCap > 0 ? "Edit Total Budget" : "Set Total Budget"}
          </Button>

          <Button
            variant="primary"
            onClick={handleOpenAdd}
            className="text-xs font-semibold"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category Limit
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center justify-between shadow-subtle animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5">
            <span className="text-base">✅</span>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Global Monthly Budget Summary Card */}
      <Card variant="default" className="p-5 md:p-6 mb-8 rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/50">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span suppressHydrationWarning className="text-xs font-semibold text-slate-400 dark:text-slate-400 tracking-wider uppercase">
                {monthLabel} Overview
              </span>
              {typeof monthlyBudget === "number" && monthlyBudget > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/60">
                  Fixed Cap
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-2.5 mt-1.5">
              <span suppressHydrationWarning className="text-2xl md:text-3xl font-bold font-numbers text-slate-900 dark:text-white">
                {formatINR(effectiveTotalBurn)}
              </span>
              <span suppressHydrationWarning className="text-sm font-numbers text-slate-500 dark:text-slate-400">
                {effectiveTotalCap > 0 ? (
                  <>spent of <strong className="text-slate-800 dark:text-slate-200">{formatINR(effectiveTotalCap)}</strong> budget</>
                ) : (
                  "spent this month (no budget limit set)"
                )}
              </span>

              {/* Direct Edit Button right next to the figures */}
              <button
                type="button"
                onClick={handleOpenEditTotalBudget}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm ml-1"
                title="Change monthly budget limit"
              >
                <svg className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>{effectiveTotalCap > 0 ? "Edit Budget" : "Set Budget"}</span>
              </button>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="flex items-center sm:justify-end gap-2">
              <Badge
                variant={
                  effectiveTotalCap === 0
                    ? "neutral"
                    : burnPercent > 100
                    ? "expense"
                    : burnPercent >= 80
                    ? "warning"
                    : "income"
                }
                size="md"
              >
                {effectiveTotalCap === 0
                  ? "No Limit"
                  : burnPercent > 100
                  ? "Over Budget"
                  : burnPercent >= 80
                  ? "Near Limit"
                  : "On Track"}
              </Badge>
              {effectiveTotalCap > 0 && (
                <span className="text-sm font-numbers font-bold text-slate-900 dark:text-white">
                  {burnPercent}%
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
              {effectiveTotalCap === 0
                ? "Set a budget cap to start tracking limit health"
                : burnPercent > 100
                ? `${formatINR(effectiveTotalBurn - effectiveTotalCap)} over total budget`
                : `${formatINR(remainingTotal)} remaining this month`}
            </span>
          </div>
        </div>

        <ProgressBar value={effectiveTotalBurn} max={effectiveTotalCap || 1} size="md" />
      </Card>

      {/* Category Budgets Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Category Spending Caps</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {enrichedRunes.length} {enrichedRunes.length === 1 ? "category" : "categories"}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any card or the Edit button to update individual category limits.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenAdd}
          className="text-xs font-semibold"
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </Button>
      </div>

      {/* Category Budgets Grid */}
      {enrichedRunes.length === 0 ? (
        <EmptyState
          icon="🍵"
          title="No Category Budgets Set"
          description="Create spending limits for dining, groceries, transit, or shopping to track your budget health."
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              Create First Category Limit
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrichedRunes.map((rune) => {
            const pct = rune.limit > 0 ? Math.round((rune.effectiveSpent / rune.limit) * 100) : 0;
            const isBreached = pct > 100;
            const isWarning = pct >= 80 && !isBreached;
            const remaining = Math.max(0, rune.limit - rune.effectiveSpent);

            return (
              <Card
                key={rune.id}
                variant="default"
                onClick={() => handleOpenEdit(rune)}
                className="p-5 flex flex-col justify-between group rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-card hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all cursor-pointer relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {rune.category}
                    </span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Badge
                        variant={isBreached ? "expense" : isWarning ? "warning" : "neutral"}
                        size="sm"
                      >
                        {isBreached ? "Exceeded" : isWarning ? "80%+ Used" : `${pct}%`}
                      </Badge>

                      {/* Header Edit Button */}
                      <button
                        type="button"
                        title="Edit budget"
                        aria-label={`Edit ${rune.category} budget`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(rune);
                        }}
                        className="p-1.5 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      {/* Header Delete Button */}
                      <button
                        type="button"
                        title="Delete budget"
                        aria-label={`Delete ${rune.category} budget`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRune(rune.id, rune.category);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-bold font-numbers text-slate-900 dark:text-white">
                        {formatINR(rune.effectiveSpent)}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-400 font-numbers block mt-0.5">
                        Limit: {formatINR(rune.limit)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={cn(
                          "text-xs font-semibold font-numbers",
                          isBreached ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {isBreached ? `+${formatINR(rune.effectiveSpent - rune.limit)} over` : `${formatINR(remaining)} left`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <ProgressBar
                      value={rune.effectiveSpent}
                      max={rune.limit}
                      size="sm"
                    />
                  </div>

                  {/* Distinct, explicit Edit button on each card */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(rune);
                    }}
                    aria-label={`Edit ${rune.category} budget`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 px-2.5 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/80 transition-colors flex items-center gap-1.5 shrink-0 shadow-subtle"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit Budget</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Modal 1: Edit Overall Monthly Budget ────────────────────── */}
      <Modal
        isOpen={isTotalBudgetModalOpen}
        onClose={() => {
          setIsTotalBudgetModalOpen(false);
          setTotalErrorMessage(null);
        }}
        title={effectiveTotalCap > 0 ? "Edit Total Monthly Budget" : "Set Monthly Budget"}
        description={`Set or completely change your total monthly spending cap for ${monthLabel}.`}
        size="md"
      >
        <form onSubmit={handleSaveTotalBudget} className="space-y-4">
          {totalErrorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{totalErrorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Monthly Budget Amount (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 dark:text-slate-500">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                autoFocus
                placeholder="e.g. 25,000"
                value={totalBudgetInput}
                onChange={(e) => {
                  setTotalBudgetInput(e.target.value);
                  setTotalErrorMessage(null);
                }}
                disabled={isSavingTotal}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-3 text-2xl font-extrabold font-numbers text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Quick preset chips for rapid selection */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Quick Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {[10000, 15000, 20000, 25000, 30000, 50000, 100000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setTotalBudgetInput(String(preset));
                    setTotalErrorMessage(null);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 transition-colors"
                >
                  {formatINR(preset)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5">
            {effectiveTotalCap > 0 ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleRemoveTotalBudget}
                disabled={isSavingTotal}
              >
                Remove Limit
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsTotalBudgetModalOpen(false);
                  setTotalErrorMessage(null);
                }}
                disabled={isSavingTotal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingTotal}
              >
                Save Budget
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Category Budget Create / Edit ─────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelModal}
        title={editingRune ? `Edit "${editingRune.category}" Budget` : "New Category Limit"}
        description={
          editingRune
            ? `Change the spending allowance or settings for ${editingRune.category}.`
            : "Set a monthly category allowance to keep expenditures under control."
        }
        size="md"
      >
        <form onSubmit={handleSaveRune} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <Select
            label="Category"
            value={catName}
            onChange={(e) => {
              setCatName(e.target.value);
              setErrorMessage(null);
            }}
            options={categoryOptions}
            disabled={isSaving}
          />

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Monthly Limit (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                autoFocus
                placeholder="e.g. 10,000"
                value={limitAmount}
                onChange={(e) => {
                  setLimitAmount(e.target.value);
                  setErrorMessage(null);
                }}
                disabled={isSaving}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-xl font-bold font-numbers text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {animeAccents && (
            <Select
              label="Budget Priority"
              value={element}
              onChange={(e) => setElement(e.target.value as any)}
              disabled={isSaving}
              options={[
                { value: "sun", label: "High Priority / Essential" },
                { value: "water", label: "Medium / Discretionary" },
                { value: "thunder", label: "Fixed / Utilities" },
              ]}
            />
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5">
            {editingRune ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  handleDeleteRune(editingRune.id, editingRune.category);
                  handleCancelModal();
                }}
                disabled={isSaving}
              >
                Delete Budget
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelModal}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
              >
                {editingRune ? "Save Changes" : "Create Budget"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
