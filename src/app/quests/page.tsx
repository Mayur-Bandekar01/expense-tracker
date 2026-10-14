"use client";

import React, { useState } from "react";
import { QuestLog } from "../../components/finance/QuestLog";
import { QuestModal } from "../../components/modals/QuestModal";
import { Transaction } from "../../types/hunter";
import { useHunterSystem } from "../../lib/hunterContext";
import { getTodayLocalDate } from "../../lib/dateUtils";
import { Button } from "../../components/ui/Button";

export default function QuestLogPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, animeAccents } = useHunterSystem();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
  };

  const handleSave = async (tx: Partial<Transaction>) => {
    if (tx.id) {
      await updateTransaction(tx.id, tx);
    } else {
      await addTransaction({
        amount: tx.amount || 0,
        type: tx.type || "expense",
        category: tx.category || "Dining & Food",
        note: tx.note || "Expense",
        merchant: tx.merchant || "",
        date: tx.date || getTodayLocalDate(),
        time: tx.time || new Date().toTimeString().slice(0, 5),
        method: tx.method || "UPI",
        isRecurring: tx.isRecurring || false,
      });
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>💳</span>
            <span>Transactions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete history of your income and expenses with search, category filtering, and bank SMS import.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setEditingTx(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto shrink-0 justify-center shadow-sm"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </Button>
      </div>

      <QuestLog
        transactions={transactions}
        onDeleteTransaction={handleDelete}
        onSelectTransaction={(tx: Transaction) => {
          setEditingTx(tx);
          setIsModalOpen(true);
        }}
        onNewQuest={() => {
          setEditingTx(null);
          setIsModalOpen(true);
        }}
      />

      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        initialTransaction={editingTx}
      />
    </>
  );
}
