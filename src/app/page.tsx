"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusWindow } from "../components/finance/StatusWindow";
import { QuestModal } from "../components/modals/QuestModal";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { useHunterSystem } from "../lib/hunterContext";
import { getTodayLocalDate } from "../lib/dateUtils";
import { formatINR } from "../lib/utils";
import { Transaction } from "../types/hunter";

export default function StatusWindowPage() {
  const router = useRouter();
  const {
    transactions,
    goals,
    runes,
    vitals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useHunterSystem();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const handleSaveQuest = async (tx: Partial<Transaction>) => {
    if (tx.id) {
      await updateTransaction(tx.id, tx);
    } else {
      await addTransaction({
        amount: tx.amount || 0,
        type: tx.type || "expense",
        category: tx.category || "General",
        note: tx.note || "Daily Expense",
        merchant: tx.merchant || "",
        date: tx.date || getTodayLocalDate(),
        time: new Date().toTimeString().slice(0, 5),
        method: tx.method || "UPI",
        isRecurring: tx.isRecurring || false,
      });
    }
  };

  const handleDeleteQuest = async (id: string) => {
    await deleteTransaction(id);
    setDeletingTx(null);
  };

  return (
    <>
      <StatusWindow
        transactions={transactions}
        goals={goals}
        runes={runes}
        hunterName={vitals.hunterName}
        onNavigateToQuests={() => router.push("/quests/")}
        onNavigateToBounties={() => router.push("/bounties/")}
        onNavigateToBudgets={() => router.push("/mana/")}
        onSelectTransaction={(tx) => {
          setEditingTx(tx);
          setIsModalOpen(true);
        }}
        onDeleteTransaction={(id) => {
          const target = transactions.find((t) => t.id === id) || null;
          setDeletingTx(target);
        }}
        onNewQuest={() => {
          setEditingTx(null);
          setIsModalOpen(true);
        }}
      />

      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuest}
        onDelete={handleDeleteQuest}
        initialTransaction={editingTx}
      />

      {/* Direct Delete Confirmation Modal for Dashboard Recent Activity */}
      <Modal
        isOpen={Boolean(deletingTx)}
        onClose={() => setDeletingTx(null)}
        title="Delete Transaction"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Permanently delete this transaction?
          </p>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">Record:</span>
              <span className="text-slate-900 dark:text-white font-semibold">
                {deletingTx?.merchant || deletingTx?.note || deletingTx?.category}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-500">Amount:</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold font-numbers">
                {formatINR(deletingTx?.amount || 0)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
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
                if (deletingTx) handleDeleteQuest(deletingTx.id);
              }}
            >
              Wipe & Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
