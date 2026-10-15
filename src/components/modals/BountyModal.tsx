"use client";

import React, { useState, useEffect } from "react";
import { Goal } from "../../types/hunter";
import { formatINR } from "../../lib/utils";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import { useHunterSystem } from "../../lib/hunterContext";

export interface BountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoal?: (goal: Partial<Goal>) => void;
  onDeposit?: (goalId: string, amount: number, note: string, logInLedger?: boolean) => void;
  onDeleteGoal?: (goalId: string) => void;
  mode: "create" | "edit" | "deposit" | "history";
  onSwitchMode?: (mode: "create" | "edit" | "deposit" | "history") => void;
  activeGoal?: Goal | null;
}

export function BountyModal({
  isOpen,
  onClose,
  onSaveGoal,
  onDeposit,
  onDeleteGoal,
  mode,
  onSwitchMode,
  activeGoal,
}: BountyModalProps) {
  const { animeAccents } = useHunterSystem();

  // Create / Edit mode state
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialSaved, setInitialSaved] = useState("");
  const [category, setCategory] = useState("Gear & Equipment");
  const [deadline, setDeadline] = useState("");

  // Deposit mode state
  const [depositAmount, setDepositAmount] = useState("");
  const [depositNote, setDepositNote] = useState("");
  const [logInLedger, setLogInLedger] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        setTitle("");
        setTargetAmount("");
        setInitialSaved("");
        setCategory("Gear & Equipment");
        setDeadline("");
      } else if (mode === "edit" && activeGoal) {
        setTitle(activeGoal.title || "");
        setTargetAmount(activeGoal.targetAmount ? String(activeGoal.targetAmount) : "");
        setInitialSaved(activeGoal.savedAmount ? String(activeGoal.savedAmount) : "");
        setCategory(activeGoal.category || "Gear & Equipment");
        setDeadline(activeGoal.deadline || "");
      }
      setDepositAmount("");
      setDepositNote("");
      setLogInLedger(true);
    }
  }, [isOpen, activeGoal, mode]);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) return;

    onSaveGoal?.({
      ...(mode === "edit" && activeGoal ? { id: activeGoal.id } : {}),
      title: title.trim() || "Savings Goal",
      targetAmount: target,
      savedAmount:
        mode === "edit" && activeGoal
          ? Number(activeGoal.savedAmount) || 0
          : parseFloat(initialSaved) || 0,
      category,
      deadline: deadline || undefined,
    });
    onClose();
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal) return;
    const dep = parseFloat(depositAmount);
    if (isNaN(dep) || dep <= 0) return;

    onDeposit?.(
      activeGoal.id,
      dep,
      depositNote.trim() || "Deposit contribution",
      logInLedger
    );
    onClose();
  };

  const targetVal = Number(activeGoal?.targetAmount) || 0;
  const savedVal = Number(activeGoal?.savedAmount) || 0;
  const isCompleted = activeGoal ? targetVal > 0 && savedVal >= targetVal : false;
  const progressPercent = activeGoal
    ? Math.min(100, Math.round((savedVal / Math.max(1, targetVal)) * 100))
    : 0;

  const getTitle = () => {
    if (mode === "create") return "New Savings Goal";
    if (mode === "edit") return `Edit Savings Goal · ${activeGoal?.title || ""}`;
    if (mode === "deposit") return `Add Deposit · ${activeGoal?.title || ""}`;
    return `Contribution History · ${activeGoal?.title || ""}`;
  };

  const getDescription = () => {
    if (mode === "create") return "Set a target financial milestone to track your accumulated savings.";
    if (mode === "edit") return "Update title, target amount, category, or deadline for this goal.";
    if (mode === "deposit") return "Deposit funds towards achieving this financial target.";
    return "Chronological record of contributions made towards this savings goal.";
  };

  const categories = [
    { value: "Emergency Fund", label: "🛡️ Emergency Fund" },
    { value: "Travel & Vacation", label: "✈️ Travel & Vacation" },
    { value: "Gear & Equipment", label: "💻 Electronics & Gear" },
    { value: "Vehicle", label: "🚗 Vehicle / Car" },
    { value: "Home & Property", label: "🏡 Home & Property" },
    { value: "Investment Vault", label: "💎 Long-term Wealth" },
    { value: "General Savings", label: "🎯 General Savings" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      description={getDescription()}
      size="md"
    >
      {/* Mode: Create or Edit Goal */}
      {(mode === "create" || mode === "edit") && (
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Goal Title"
            required
            autoFocus
            placeholder="e.g. MacBook Pro, Japan Trip, Emergency Fund"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Target Amount (₹ INR) <span className="text-rose-500">*</span>
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
                placeholder="50,000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-xl font-bold font-numbers text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mode === "create" ? (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Already Saved (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={initialSaved}
                    onChange={(e) => setInitialSaved(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-7 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-numbers"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  Currently Accumulated
                </label>
                <div className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold font-numbers text-slate-700 dark:text-slate-200">
                  {formatINR(Number(activeGoal?.savedAmount) || 0)}
                </div>
              </div>
            )}

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categories}
            />
          </div>

          <Input
            label="Target Completion Date (Optional)"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {mode === "edit" ? "Save Changes" : "Create Goal"}
            </Button>
          </div>
        </form>
      )}

      {/* Mode: Deposit Funds */}
      {mode === "deposit" && (
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/80 space-y-2.5">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Current Progress</span>
              <span className="font-numbers font-bold text-slate-900 dark:text-white">
                {formatINR(activeGoal?.savedAmount || 0)}{" "}
                <span className="font-normal text-slate-400 dark:text-slate-500">of</span>{" "}
                {formatINR(activeGoal?.targetAmount || 0)}
              </span>
            </div>
            <ProgressBar
              value={activeGoal?.savedAmount || 0}
              max={activeGoal?.targetAmount || 1}
              size="sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Deposit Amount (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500">
                ₹
              </span>
              <input
                type="number"
                required
                autoFocus
                step="any"
                min="1"
                placeholder="5,000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-xl font-bold font-numbers text-emerald-600 dark:text-emerald-400 placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>

          <Input
            label="Note / Source"
            placeholder="e.g. Monthly salary savings, Bonus"
            value={depositNote}
            onChange={(e) => setDepositNote(e.target.value)}
          />

          <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={logInLedger}
              onChange={(e) => setLogInLedger(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-0 bg-white dark:bg-slate-800 accent-brand-600"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Also log in Transactions & deduct from Available Balance
            </span>
          </label>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {onSwitchMode && activeGoal && (
              <button
                type="button"
                onClick={() => onSwitchMode("history")}
                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
              >
                View Deposit History
              </button>
            )}
            <div className="flex gap-2.5 ml-auto">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm Deposit
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Mode: Deposit History */}
      {mode === "history" && activeGoal && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/80 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Category: {activeGoal.category || "General"}
              </span>
              <Badge variant={isCompleted ? "income" : "brand"} size="sm">
                {isCompleted ? "Completed" : `${progressPercent}% Saved`}
              </Badge>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-bold font-numbers text-slate-900 dark:text-white">
                {formatINR(activeGoal.savedAmount)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-numbers">
                Target: {formatINR(activeGoal.targetAmount)}
              </span>
            </div>
            <ProgressBar
              value={activeGoal.savedAmount}
              max={activeGoal.targetAmount || 1}
              size="sm"
            />
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Contribution History
            </span>
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {!activeGoal.contributions || activeGoal.contributions.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No deposits recorded yet. Add a deposit to start tracking contributions.
                  </p>
                </div>
              ) : (
                activeGoal.contributions
                  .slice()
                  .reverse()
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/70 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {item.hunterLog || "Deposit contribution"}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-numbers">
                          {item.depositedAt}
                        </div>
                      </div>
                      <span className="font-numbers text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatINR(item.goldAmount)}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {onDeleteGoal && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  if (window.confirm(`Delete savings goal "${activeGoal.title}"?`)) {
                    onDeleteGoal(activeGoal.id);
                    onClose();
                  }
                }}
              >
                Delete Goal
              </Button>
            )}

            <div className="flex gap-2.5 ml-auto">
              {onSwitchMode && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onSwitchMode("edit")}
                  >
                    Edit Goal
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => onSwitchMode("deposit")}
                  >
                    + Add Deposit
                  </Button>
                </>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default BountyModal;
