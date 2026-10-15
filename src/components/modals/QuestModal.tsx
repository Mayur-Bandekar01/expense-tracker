"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Transaction } from "../../types/hunter";
import { parseSMS } from "../../lib/smsParser";
import { getTodayLocalDate } from "../../lib/dateUtils";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useHunterSystem } from "../../lib/hunterContext";

export interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Partial<Transaction>) => void;
  onDelete?: (id: string) => void;
  initialTransaction?: Transaction | null;
}

export function QuestModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTransaction,
}: QuestModalProps) {
  const { animeAccents, spheres } = useHunterSystem();

  const [activeTab, setActiveTab] = useState<"manual" | "sms">("manual");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("Dining & Food");
  const [note, setNote] = useState<string>("");
  const [merchant, setMerchant] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [method, setMethod] = useState<string>("UPI");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [smsRaw, setSmsRaw] = useState<string>("");
  const [smsFeedback, setSmsFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialTransaction) {
        setType(initialTransaction.type || "expense");
        setAmount(initialTransaction.amount != null ? String(initialTransaction.amount) : "");
        setCategory(initialTransaction.category || "Dining & Food");
        setNote(initialTransaction.note || "");
        setMerchant(initialTransaction.merchant || "");
        setDate(initialTransaction.date || getTodayLocalDate());
        setMethod(initialTransaction.method || "UPI");
        setIsRecurring(Boolean(initialTransaction.isRecurring));
      } else {
        setType("expense");
        setAmount("");
        setCategory("Dining & Food");
        setNote("");
        setMerchant("");
        setDate(getTodayLocalDate());
        setMethod("UPI");
        setIsRecurring(false);
      }
      setActiveTab("manual");
      setSmsRaw("");
      setSmsFeedback(null);
      setIsSaving(false);
      setConfirmDelete(false);
    }
  }, [isOpen, initialTransaction]);

  const handleParseSMS = () => {
    if (!smsRaw.trim()) return;
    const parsed = parseSMS(smsRaw);
    if (parsed) {
      setAmount(String(parsed.amount));
      setType(parsed.type);
      if (parsed.merchant) setMerchant(parsed.merchant);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.date) setDate(parsed.date);
      setSmsFeedback({
        message: `Decoded ₹${parsed.amount.toLocaleString("en-IN")} · ${parsed.merchant || "Merchant"} (${parsed.type.toUpperCase()})`,
        success: true,
      });
      setActiveTab("manual");
    } else {
      setSmsFeedback({
        message: "Could not parse SMS format. Please check the text or enter manually.",
        success: false,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSaving(true);
    try {
      onSave({
        id: initialTransaction?.id,
        amount: parsedAmount,
        type,
        category,
        note: note.trim() || merchant.trim() || (type === "income" ? "Income Deposit" : "Expense"),
        merchant: merchant.trim(),
        date,
        time: initialTransaction?.time || new Date().toTimeString().slice(0, 5),
        method,
        isRecurring,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const categories = useMemo(() => {
    const base = [
      "Dining & Food",
      "Groceries",
      "Transportation",
      "Shopping",
      "Software & SaaS",
      "Entertainment",
      "Rent & Housing",
      "Utilities & Bills",
      "Health & Fitness",
      "Investments & SIP",
      "Salary & Income",
      "Miscellaneous",
    ];
    const set = new Set<string>(base);
    if (Array.isArray(spheres)) {
      spheres.forEach((s) => {
        if (s?.name?.trim()) set.add(s.name.trim());
      });
    }
    if (initialTransaction?.category?.trim()) {
      set.add(initialTransaction.category.trim());
    }
    return Array.from(set).map((cat) => ({ value: cat, label: cat }));
  }, [spheres, initialTransaction]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTransaction ? "Edit Transaction" : "Add Transaction"}
      description="Enter the details of your financial transaction."
      size="md"
    >
      {/* Top Tab Bar: Manual vs SMS */}
      <div className="flex items-center gap-1.5 mb-5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeTab === "manual"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-subtle font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Manual Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sms")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "sms"
              ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-subtle font-semibold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span>💬</span>
          <span>Paste Bank SMS</span>
        </button>
      </div>

      {activeTab === "sms" ? (
        <div className="space-y-4 py-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Bank / UPI Transaction SMS
            </label>
            <textarea
              rows={4}
              value={smsRaw}
              onChange={(e) => setSmsRaw(e.target.value)}
              placeholder="e.g. Paid Rs. 450.00 to SWIGGY via UPI Ref 4123456789 on 11-10-2026..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-mono resize-none"
            />
          </div>

          {smsFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                smsFeedback.success
                  ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-950/50 border-rose-200/80 dark:border-rose-800/60 text-rose-800 dark:text-rose-300"
              }`}
            >
              <span className="font-bold">{smsFeedback.success ? "✓" : "!"}</span>
              <span>{smsFeedback.message}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("manual")}>
              Back to Form
            </Button>
            <Button variant="primary" size="sm" onClick={handleParseSMS} disabled={!smsRaw.trim()}>
              Auto-Extract Details
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Switcher: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-2 px-3 text-xs rounded-xl border transition-all flex items-center justify-center gap-2 ${
                type === "expense"
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/90 dark:border-rose-800/80 font-semibold shadow-subtle"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-2 px-3 text-xs rounded-xl border transition-all flex items-center justify-center gap-2 ${
                type === "income"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/90 dark:border-emerald-800/80 font-semibold shadow-subtle"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Income</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Amount (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl pl-8 pr-3 py-2.5 text-2xl font-bold font-sans tracking-tight focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-colors ${
                  type === "income"
                    ? "text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-700 focus:border-emerald-500"
                    : "text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:border-rose-500"
                }`}
              />
            </div>
          </div>

          {/* Category & Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categories}
            />

            <Input
              label="Merchant / Payee"
              placeholder="e.g. Swiggy, Amazon, Zepto"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </div>

          {/* Note / Description */}
          <Input
            label="Note / Description"
            placeholder="e.g. Team dinner, Grocery haul"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <Select
              label="Payment Method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              options={[
                { value: "UPI", label: "UPI (Google Pay, PhonePe)" },
                { value: "Card", label: "Debit / Credit Card" },
                { value: "Net Banking", label: "Net Banking / NEFT" },
                { value: "Cash", label: "Cash" },
              ]}
            />
          </div>

          {/* Recurring Toggle */}
          <div className="pt-1 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-0 focus:ring-offset-0 bg-white dark:bg-slate-800 accent-brand-600"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Mark as recurring subscription/bill
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div>
              {initialTransaction && onDelete && (
                confirmDelete ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        onDelete(initialTransaction.id);
                        setConfirmDelete(false);
                        onClose();
                      }}
                    >
                      Confirm Delete
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete
                  </Button>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                {initialTransaction ? "Save Changes" : "Add Transaction"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default QuestModal;
