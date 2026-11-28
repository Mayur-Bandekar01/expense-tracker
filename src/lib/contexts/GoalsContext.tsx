"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Goal, BountyDeposit } from "../../types/hunter";
import { getTodayLocalDate } from "../dateUtils";
import { watchGoals, addGoal as fsAddGoal, updateGoal as fsUpdateGoal, depositToGoal as fsDepositToGoal, deleteGoal as fsDeleteGoal } from "../firestore";
import {
  loadFromStorage,
  saveToStorage,
  getUserStorageKey,
  STORAGE_KEYS,
  normalizeRecordArray,
  mergeRecordsById,
} from "./storageUtils";
import { useAuth } from "./AuthContext";

interface GoalsContextType {
  goals: Goal[];
  addGoal: (goalData: Partial<Goal>) => Promise<string>;
  updateGoal: (id: string, goalData: Partial<Goal>) => Promise<void>;
  depositToGoal: (goalId: string, amount: number, note?: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | null>(null);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadedUid, setLoadedUid] = useState<string | null | undefined>(undefined);
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const goalsKey = getUserStorageKey(uid, STORAGE_KEYS.GOALS);
    const storedGoals = normalizeRecordArray<Goal>(loadFromStorage<unknown>(goalsKey, []));
    setGoals(storedGoals);
    setLoadedUid(uid ?? null);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const uKey = (k: string) => getUserStorageKey(uid, k);
    let isInitialSnapshot = true;

    const unsub = watchGoals(uid, (fsGoals) => {
      if (!Array.isArray(fsGoals)) return;
      const localGoals = normalizeRecordArray<Goal>(
        loadFromStorage<unknown>(uKey(STORAGE_KEYS.GOALS), [])
      );
      const activeGoals = isInitialSnapshot
        ? mergeRecordsById(fsGoals, localGoals)
        : fsGoals;
      const shouldMigrateLocal = isInitialSnapshot;
      isInitialSnapshot = false;
      setGoals(activeGoals);
      saveToStorage(uKey(STORAGE_KEYS.GOALS), activeGoals);

      if (shouldMigrateLocal) {
        const cloudIds = new Set(fsGoals.map((goal) => goal.id));
        activeGoals
          .filter((goal) => !cloudIds.has(goal.id))
          .forEach((goal) => {
            void fsAddGoal(uid, goal).catch((err) =>
              console.error("Firestore goal migration error:", err)
            );
          });
      }
    });

    return () => unsub();
  }, [uid]);

  useEffect(() => {
    if (loadedUid !== (uid ?? null)) return;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.GOALS), goals);
  }, [goals, loadedUid, uid]);

  const addGoal = useCallback(
    async (goalData: Partial<Goal>): Promise<string> => {
      const id = goalData.id || `goal-${Date.now()}`;
      const initialSaved = Number(goalData.savedAmount) || 0;
      const initialContributions: BountyDeposit[] =
        initialSaved > 0
          ? [
              {
                id: `dep-${Date.now()}`,
                goldAmount: initialSaved,
                depositedAt: getTodayLocalDate(),
                hunterLog: "Initial deposit",
                timestamp: Date.now(),
              },
            ]
          : [];

      const newGoal: Goal = {
        id,
        title: goalData.title || "Savings Goal",
        targetAmount: Number(goalData.targetAmount) || 10000,
        savedAmount: initialSaved,
        category: goalData.category || "General",
        ...(goalData.deadline ? { deadline: goalData.deadline } : {}),
        contributions: initialContributions,
      };

      setGoals((prev) => {
        const next = [newGoal, ...prev.filter((g) => g.id !== id)];
        return next;
      });

      if (uid) {
        try {
          await fsAddGoal(uid, newGoal);
        } catch (err) {
          console.error("Firestore addGoal error:", err);
        }
      }
      return id;
    },
    [uid]
  );

  const updateGoal = useCallback(
    async (id: string, goalData: Partial<Goal>): Promise<void> => {
      setGoals((prev) => {
        const next = prev.map((g) => (g.id === id ? ({ ...g, ...goalData } as Goal) : g));
        return next;
      });

      if (uid) {
        try {
          await fsUpdateGoal(uid, id, goalData);
        } catch (err) {
          console.error("Firestore updateGoal error:", err);
        }
      }
    },
    [uid]
  );

  const depositToGoal = useCallback(
    async (goalId: string, amount: number, note?: string): Promise<void> => {
      // Deterministic ID: goalId + amount + date + minute bucket
      // Rapid clicks within the same minute produce the same ID -> idempotent
      const dateStr = getTodayLocalDate();
      const minuteBucket = Math.floor(Date.now() / 60000);
      const depositId = `dep-${goalId}-${amount}-${dateStr}-${minuteBucket}`;
      const deposit: BountyDeposit = {
        id: depositId,
        goldAmount: amount,
        depositedAt: dateStr,
        hunterLog: note || "Deposit contribution",
        timestamp: Date.now(),
      };

      const targetGoal = goals.find((g) => g.id === goalId);
      if (!targetGoal) return;

      setGoals((prev) => {
        return prev.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                savedAmount: (Number(goal.savedAmount) || 0) + amount,
                contributions: [...(goal.contributions || []), deposit],
              }
            : goal
        );
      });

      if (uid) {
        try {
          await fsDepositToGoal(uid, goalId, deposit);
        } catch (err) {
          console.error("Firestore depositToGoal error:", err);
        }
      }
    },
    [goals, uid]
  );

  const deleteGoal = useCallback(
    async (id: string): Promise<void> => {
      setGoals((prev) => {
        const next = prev.filter((g) => g.id !== id);
        return next;
      });

      if (uid) {
        try {
          await fsDeleteGoal(uid, id);
        } catch (err) {
          console.error("Firestore deleteGoal error:", err);
        }
      }
    },
    [uid]
  );

  const value = useMemo<GoalsContextType>(
    () => ({
      goals,
      addGoal,
      updateGoal,
      depositToGoal,
      deleteGoal,
    }),
    [goals, addGoal, updateGoal, depositToGoal, deleteGoal]
  );

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

export function useGoals(): GoalsContextType {
  const ctx = useContext(GoalsContext);
  if (!ctx) {
    throw new Error("useGoals must be used within a GoalsProvider");
  }
  return ctx;
}
