"use client";

import React, { useState } from "react";
import { BountyBoard } from "../../components/finance/BountyBoard";
import { BountyModal } from "../../components/modals/BountyModal";
import { Goal } from "../../types/hunter";
import { useHunterSystem } from "../../lib/hunterContext";
import { getTodayLocalDate } from "../../lib/dateUtils";
import { Button } from "../../components/ui/Button";

export default function BountiesPage() {
  const { goals, addGoal, updateGoal, depositToGoal, deleteGoal, addTransaction } =
    useHunterSystem();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "deposit" | "history">("create");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleOpenDeposit = (goalId: string) => {
    const target = goals.find((g) => g.id === goalId) || null;
    setSelectedGoal(target);
    setModalMode("deposit");
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedGoal(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleViewHistory = (goal: Goal) => {
    setSelectedGoal(goal);
    setModalMode("history");
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (goalData: Partial<Goal>) => {
    if (goalData.id) {
      await updateGoal(goalData.id, goalData);
    } else {
      await addGoal({
        title: goalData.title || "Savings Goal",
        targetAmount: goalData.targetAmount || 10000,
        savedAmount: goalData.savedAmount || 0,
        category: goalData.category || "General Savings",
        deadline: goalData.deadline,
      });
    }
  };

  const handleDeposit = async (
    goalId: string,
    amount: number,
    note: string,
    logInLedger: boolean = true
  ) => {
    const target = goals.find((g) => g.id === goalId);
    await depositToGoal(goalId, amount, note);

    if (logInLedger) {
      await addTransaction({
        amount,
        type: "expense",
        category: "Investments & SIP",
        merchant: target?.title || "Savings Goal",
        note: note ? `${note} (${target?.title || "Goal"})` : `Saved towards ${target?.title || "Goal"}`,
        date: getTodayLocalDate(),
        time: new Date().toTimeString().slice(0, 5),
        method: "UPI",
        isRecurring: false,
      });
    }
  };

  const handleDelete = async (goalId: string) => {
    await deleteGoal(goalId);
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>🎯</span>
            <span>Savings Goals</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track milestones for future purchases, trips, and long-term emergency reserves.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenCreate} className="self-start sm:self-auto">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Savings Goal
        </Button>
      </div>

      <BountyBoard
        goals={goals}
        onDeposit={handleOpenDeposit}
        onEdit={handleOpenEdit}
        onNewBounty={handleOpenCreate}
        onViewHistory={handleViewHistory}
      />

      <BountyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        onSwitchMode={(mode) => setModalMode(mode)}
        activeGoal={selectedGoal}
        onSaveGoal={handleSaveGoal}
        onDeposit={handleDeposit}
        onDeleteGoal={handleDelete}
      />
    </>
  );
}
