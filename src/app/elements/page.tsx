"use client";

import React, { useState, useMemo } from "react";
import { CategorySphere, BreathingStyle } from "../../types/hunter";
import { useHunterSystem } from "../../lib/hunterContext";
import { DEFAULT_CATEGORIES } from "../../lib/mockData";
import { formatINR, cn } from "../../lib/utils";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { EmptyState } from "../../components/ui/EmptyState";

export default function ElementSpheresPage() {
  const { spheres, saveSphere, deleteSphere, transactions, animeAccents } = useHunterSystem();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏷️");
  const [element, setElement] = useState<BreathingStyle>("water");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Defensive normalization of spheres
  const safeSpheres = useMemo(() => {
    if (!Array.isArray(spheres)) return [];
    return spheres.filter(Boolean).map((s, idx) => {
      const rawElem = typeof s?.element === "string" ? s.element.toLowerCase() : "water";
      const validElem: BreathingStyle =
        rawElem === "sun" ||
        rawElem === "thunder" ||
        rawElem === "beast" ||
        rawElem === "mist" ||
        rawElem === "flame"
          ? (rawElem as BreathingStyle)
          : "water";

      const defaultAura =
        validElem === "water"
          ? "#6366f1"
          : validElem === "sun"
          ? "#f43f5e"
          : validElem === "thunder"
          ? "#eab308"
          : validElem === "beast"
          ? "#10b981"
          : validElem === "flame"
          ? "#f97316"
          : "#8b5cf6";

      return {
        id: s?.id || `cat-${idx + 1}`,
        name: s?.name || "Custom Category",
        emoji: s?.emoji || "🏷️",
        element: validElem,
        auraColor: s?.auraColor || defaultAura,
        monthlyQuotaGold: typeof s?.monthlyQuotaGold === "number" ? s.monthlyQuotaGold : undefined,
      };
    });
  }, [spheres]);

  // Normalized category matching for stats
  const normalizeCat = (c: string) => {
    const lower = (c || "").trim().toLowerCase();
    if (lower.includes("food") || lower.includes("dining") || lower.includes("provision")) return "dining & food";
    if (lower.includes("transport")) return "transportation";
    if (lower.includes("utilit")) return "utilities & bills";
    if (lower.includes("salary") || lower.includes("bounty") || lower.includes("income")) return "salary & income";
    if (lower.includes("gear") || lower.includes("shop")) return "shopping";
    if (lower.includes("rent") || lower.includes("housing")) return "rent & housing";
    return lower;
  };

  const getStatsForCategory = (catName: string) => {
    const targetKey = normalizeCat(catName);
    let count = 0;
    let totalSpend = 0;
    (transactions || []).forEach((tx) => {
      const txKey = normalizeCat(tx?.category || "");
      if (txKey === targetKey || txKey.includes(targetKey) || targetKey.includes(txKey)) {
        count += 1;
        if (tx.type === "expense") {
          totalSpend += Number(tx.amount) || 0;
        }
      }
    });
    return { count, totalSpend };
  };

  const handleOpenAdd = () => {
    setName("");
    setEmoji("🏷️");
    setElement("water");
    setIsModalOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const auraColor =
      element === "water"
        ? "#6366f1"
        : element === "sun"
        ? "#f43f5e"
        : element === "thunder"
        ? "#eab308"
        : element === "beast"
        ? "#10b981"
        : element === "mist"
        ? "#8b5cf6"
        : "#f97316";

    await saveSphere({
      id: `cat-${Date.now()}`,
      name: name.trim(),
      emoji: emoji.trim() || "🏷️",
      element,
      auraColor,
    });

    setIsModalOpen(false);
  };

  const handleRestoreDefaults = async () => {
    if (window.confirm("Restore standard default categories? This will not affect your transactions or balances.")) {
      for (const cat of DEFAULT_CATEGORIES) {
        await saveSphere(cat);
      }
    }
  };

  const handleDelete = async (id: string, sphereName: string) => {
    if (window.confirm(`Delete category "${sphereName}"?`)) {
      await deleteSphere(id);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>🏷️</span>
            <span>Categories & Tags</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize expenses and income to power reports, filters, and monthly budget limits.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {safeSpheres.length === 0 && (
            <Button variant="secondary" size="sm" onClick={handleRestoreDefaults} className="flex-1 sm:flex-initial justify-center">
              Restore Defaults
            </Button>
          )}
          <Button variant="primary" onClick={handleOpenAdd} className="flex-1 sm:flex-initial justify-center shadow-sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </Button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card variant="default" className="p-5 sm:p-6 rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Configured Categories
            </span>
            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 shrink-0">
              🏷️
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold font-numbers text-slate-900 dark:text-white tracking-tight">
            {safeSpheres.length}
          </span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            Active spending spheres
          </p>
        </Card>

        <Card variant="default" className="p-5 sm:p-6 rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              Categorized Entries
            </span>
            <span className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/60 flex items-center justify-center text-xs text-brand-600 dark:text-brand-400 shrink-0">
              📊
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold font-numbers text-brand-600 dark:text-brand-400 tracking-tight">
            {(transactions || []).length}
          </span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            Logged transaction records
          </p>
        </Card>

        <Card variant="default" className="p-5 sm:p-6 rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Standard Presets
            </span>
            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 shrink-0">
              ✨
            </span>
          </div>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed block">
            Dining, Groceries, Transit, Bills, Housing, SIP
          </span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            Quick-match defaults
          </p>
        </Card>
      </div>

      {/* Categories Grid */}
      {safeSpheres.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No Categories Found"
          description="Create custom categories or restore standard presets to categorize your spending."
          action={
            <div className="flex gap-2.5 justify-center">
              <Button variant="primary" size="sm" onClick={handleOpenAdd}>
                Create Category
              </Button>
              <Button variant="outline" size="sm" onClick={handleRestoreDefaults}>
                Restore Defaults
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {safeSpheres.map((s) => {
            const stats = getStatsForCategory(s.name || "");

            return (
              <Card
                key={s.id}
                variant="default"
                className="p-5 flex flex-col justify-between group rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="w-11 h-11 text-xl rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center shrink-0">
                      {s.emoji}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: s.auraColor || "#6366f1" }}
                        title="Theme color"
                      />
                      <button
                        type="button"
                        title="Delete category"
                        onClick={() => handleDelete(s.id, s.name)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                    {s.name}
                  </h3>

                  <div className="mt-2 flex items-baseline justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{stats.count} {stats.count === 1 ? "entry" : "entries"}</span>
                    {stats.totalSpend > 0 && (
                      <span className="font-numbers text-slate-800 dark:text-slate-200 font-semibold">
                        {formatINR(stats.totalSpend)}
                      </span>
                    )}
                  </div>
                </div>

                {animeAccents && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                      Color: {s.element}
                    </span>
                    <Badge variant="brand" size="sm">
                      {s.element.toUpperCase()}
                    </Badge>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Category"
        description="Add a category to organize transactions and customize reports."
        size="md"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Category Name"
            required
            autoFocus
            placeholder="e.g. Dining, Coffee, Subscriptions, Fitness"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Emoji Symbol"
              placeholder="e.g. 🍕, ☕, 🎮"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
            />

            <Select
              label="Theme Color"
              value={element}
              onChange={(e) => setElement(e.target.value as BreathingStyle)}
              options={[
                { value: "water", label: "Indigo" },
                { value: "sun", label: "Rose Red" },
                { value: "thunder", label: "Amber Gold" },
                { value: "beast", label: "Emerald Green" },
                { value: "mist", label: "Violet" },
                { value: "flame", label: "Orange" },
              ]}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
