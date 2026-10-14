"use client";

import React, { useState, useMemo } from "react";
import { PerpetualPact } from "../../types/hunter";
import { formatINR, cn } from "../../lib/utils";
import { getTodayLocalDate, formatDisplayDate } from "../../lib/dateUtils";
import { useHunterSystem } from "../../lib/hunterContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { EmptyState } from "../../components/ui/EmptyState";

export default function PerpetualPactsPage() {
  const { pacts, savePact, togglePact, deletePact, executePact, user, animeAccents } = useHunterSystem();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payingPact, setPayingPact] = useState<PerpetualPact | null>(null);
  const [deletingPact, setDeletingPact] = useState<{ id: string; name: string } | null>(null);
  const [executingPactId, setExecutingPactId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [recentlyPaidId, setRecentlyPaidId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [category, setCategory] = useState("Entertainment");
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "ANNUAL">("MONTHLY");
  const [nextDate, setNextDate] = useState(getTodayLocalDate());

  // Normalized monthly calculation based on frequency
  const getMonthlyEquivalent = (amount: number, freq: string) => {
    switch (freq) {
      case "DAILY":
        return amount * 30;
      case "WEEKLY":
        return amount * 4.33;
      case "MONTHLY":
        return amount;
      case "ANNUAL":
        return amount / 12;
      default:
        return amount;
    }
  };

  const activePacts = useMemo(() => (pacts || []).filter((p) => p && p.isActive), [pacts]);

  const totalMonthlyCommitment = useMemo(() => {
    return activePacts.reduce(
      (sum, p) => sum + getMonthlyEquivalent(Number(p.goldCost) || 0, p.frequency),
      0
    );
  }, [activePacts]);

  const totalAnnualCommitment = totalMonthlyCommitment * 12;

  const handleOpenAdd = () => {
    setTitle("");
    setCost("");
    setCategory("Entertainment");
    setFrequency("MONTHLY");
    setNextDate(getTodayLocalDate());
    setIsModalOpen(true);
  };

  const handleSavePact = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseFloat(cost);
    if (isNaN(c) || c <= 0 || !title.trim()) return;

    await savePact({
      id: `pact-${Date.now()}`,
      uid: user?.uid || "guest-user",
      pactTitle: title.trim(),
      goldCost: c,
      frequency,
      nextInvocationDate: nextDate,
      category,
      isActive: true,
    });

    setIsModalOpen(false);
  };

  const handleOpenPayModal = (pact: PerpetualPact) => {
    setPayingPact(pact);
  };

  const handleConfirmPay = async () => {
    if (!payingPact) return;
    try {
      setExecutingPactId(payingPact.id);
      await executePact(payingPact);
      setRecentlyPaidId(payingPact.id);
      setSuccessBanner(
        `Recorded payment of ${formatINR(payingPact.goldCost)} for "${payingPact.pactTitle}" in your ledger.`
      );
      setPayingPact(null);
      setTimeout(() => setRecentlyPaidId(null), 3500);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      console.error("Execute pact error:", err);
    } finally {
      setExecutingPactId(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeletingPact({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deletingPact) return;
    try {
      await deletePact(deletingPact.id, true);
      setSuccessBanner(`Deleted "${deletingPact.name}" and wiped associated recurring transactions.`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      console.error("Delete pact error:", err);
    } finally {
      setDeletingPact(null);
    }
  };

  const categoryOptions = [
    { value: "Entertainment", label: "Entertainment & Streaming" },
    { value: "Rent & Housing", label: "Housing & Rent" },
    { value: "Utilities", label: "Utilities & Internet" },
    { value: "Health & Fitness", label: "Gym & Fitness" },
    { value: "Software & SaaS", label: "Software & Subscriptions" },
    { value: "Insurance", label: "Insurance & Health" },
    { value: "Investments & SIP", label: "SIP & Investments" },
    { value: "Miscellaneous", label: "Miscellaneous" },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>🔁</span>
            <span>Recurring Bills & Subscriptions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track subscriptions, monthly utility bills, rent, and scheduled recurring expenses.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAdd} className="w-full sm:w-auto shrink-0 justify-center shadow-sm">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Recurring Bill
        </Button>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
              ✓
            </span>
            <span className="truncate">{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 dark:text-emerald-300 font-bold p-1 text-sm hover:opacity-80 shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card variant="default" className="p-5 sm:p-6 rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Monthly Commitment
            </span>
            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 shrink-0">
              📅
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-numbers text-slate-900 dark:text-white tracking-tight">
              {formatINR(totalMonthlyCommitment)}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-numbers font-medium">/ month</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            Active monthly recurring run-rate
          </p>
        </Card>

        <Card variant="default" className="p-5 sm:p-6 rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Annual Projected Cost
            </span>
            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 shrink-0">
              📈
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-numbers text-slate-900 dark:text-white tracking-tight">
              {formatINR(totalAnnualCommitment)}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-numbers font-medium">/ year</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            Projected 12-month recurring spend
          </p>
        </Card>

        <Card variant="default" className="p-5 sm:p-6 rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              Active Subscriptions
            </span>
            <span className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/60 flex items-center justify-center text-xs text-brand-600 dark:text-brand-400 shrink-0">
              ⚡
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-numbers text-brand-600 dark:text-brand-400 tracking-tight">
              {activePacts.length}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-numbers font-medium">
              of {(pacts || []).length} total
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
            Enabled recurring payment pacts
          </p>
        </Card>
      </div>

      {/* Bills List */}
      {(pacts || []).filter(Boolean).length === 0 ? (
        <EmptyState
          icon="🍵"
          title="No Recurring Bills Tracked"
          description="Add your subscriptions (Netflix, Spotify, broadband), rent, or SIPs to monitor upcoming dues."
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              Add Recurring Bill
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {(pacts || []).filter(Boolean).map((pact) => {
            const monthlyEquiv = getMonthlyEquivalent(Number(pact.goldCost) || 0, pact.frequency);

            return (
              <Card
                key={pact.id}
                variant="default"
                className={cn(
                  "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-card hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all group",
                  !pact.isActive && "opacity-60 bg-slate-50/80 dark:bg-slate-900/40"
                )}
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {pact.pactTitle}
                      </h4>
                      <Badge variant="brand" size="sm">
                        {pact.frequency}
                      </Badge>
                      {!pact.isActive && (
                        <Badge variant="neutral" size="sm">
                          Paused
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{pact.category}</span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span>Next Due: {formatDisplayDate(pact.nextInvocationDate)}</span>
                      {pact.frequency !== "MONTHLY" && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="font-numbers text-slate-400">≈ {formatINR(monthlyEquiv)}/mo</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Cost & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center justify-between sm:justify-end sm:text-right gap-2">
                    <span className="sm:hidden text-xs text-slate-500 dark:text-slate-400 font-medium">Cost</span>
                    <div>
                      <span className="font-numbers text-lg sm:text-xl font-bold text-slate-900 dark:text-white block sm:text-right">
                        {formatINR(pact.goldCost)}
                      </span>
                      <span className="text-[11px] text-slate-400 uppercase font-numbers block sm:text-right">
                        per {pact.frequency.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    {/* Mark as paid / log to transactions */}
                    <Button
                      variant={recentlyPaidId === pact.id ? "success" : "outline"}
                      size="sm"
                      isLoading={executingPactId === pact.id}
                      onClick={() => handleOpenPayModal(pact)}
                      title="Log payment to transactions and advance due date"
                      className="flex-1 sm:flex-initial justify-center font-medium"
                    >
                      {recentlyPaidId === pact.id ? "Paid ✓" : "Pay & Log"}
                    </Button>

                    {/* Active / Paused Toggle */}
                    <button
                      type="button"
                      onClick={() => togglePact(pact.id)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors shrink-0",
                        pact.isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/60"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
                      )}
                    >
                      {pact.isActive ? "Active" : "Paused"}
                    </button>

                    {/* Delete button (visible on mobile touchscreens) */}
                    <button
                      type="button"
                      title="Delete bill"
                      onClick={() => handleDelete(pact.id, pact.pactTitle)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Confirm Payment Modal (Reliable across all mobile browsers & webviews) ── */}
      <Modal
        isOpen={Boolean(payingPact)}
        onClose={() => setPayingPact(null)}
        title="Confirm Bill Payment"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Record payment of{" "}
            <strong className="text-slate-900 dark:text-white font-numbers font-bold">
              {formatINR(payingPact?.goldCost || 0)}
            </strong>{" "}
            for <strong>&quot;{payingPact?.pactTitle}&quot;</strong> into your transactions ledger?
          </p>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{payingPact?.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 dark:text-slate-500">Billing Cycle:</span>
              <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">{payingPact?.frequency}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
              This logs an expense transaction and advances the next due date by one {payingPact?.frequency.toLowerCase()} cycle.
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setPayingPact(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={executingPactId === payingPact?.id}
              onClick={handleConfirmPay}
            >
              Confirm & Log
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Confirm Delete Recurring Bill Modal ── */}
      <Modal
        isOpen={Boolean(deletingPact)}
        onClose={() => setDeletingPact(null)}
        title="Delete Recurring Bill"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Permanently delete <strong>&quot;{deletingPact?.name}&quot;</strong>?
          </p>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300">
            This will remove the recurring bill and automatically wipe out all associated transaction records from your ledger and database.
          </div>
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setDeletingPact(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
              Wipe & Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Recurring Bill"
        description="Track recurring subscriptions and scheduled bill commitments."
        size="md"
      >
        <form onSubmit={handleSavePact} className="space-y-4">
          <Input
            label="Bill / Subscription Name"
            required
            autoFocus
            placeholder="e.g. Netflix, Spotify, Rent, Broadband"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Amount (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500">
                ₹
              </span>
              <input
                type="number"
                required
                step="any"
                min="1"
                placeholder="999.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-xl font-bold font-numbers text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Billing Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              options={[
                { value: "MONTHLY", label: "Monthly" },
                { value: "ANNUAL", label: "Annual (Yearly)" },
                { value: "WEEKLY", label: "Weekly" },
                { value: "DAILY", label: "Daily" },
              ]}
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions}
            />
          </div>

          <Input
            label="Next Due Date"
            type="date"
            required
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Recurring Bill
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
