"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Goal, BountyDeposit } from "../../types/hunter";
import { getTodayLocalDate } from "../dateUtils";
import { watchGoals, addGoal as fsAddGoal, updateGoal as fsUpdateGoal, depositToGoal as fsDepositToGoal, deleteGoal as fsDeleteGoal } from "../firestore";
import { loadFromStorage, saveToStorage, getUserStorageKey, STORAGE_KEYS } from "./storageUtils";
import { getCurrentUser } from "../auth";

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
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const activeUid = getCurrentUser()?.uid;
      const goalsKey = getUserStorageKey(activeUid, STORAGE_KEYS.GOALS);
      const storedGoals = loadFromStorage<Goal[]>(goalsKey, []);
      setGoals(storedGoals);
    } catch (_e) {}
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const uid = user.uid;
    const uKey = (k: string) => getUserStorageKey(uid, k);

    const unsub = watchGoals(uid, (fsGoals) => {
      if (!Array.isArray(fsGoals)) return;
      setGoals(fsGoals);
      saveToStorage(uKey(STORAGE_KEYS.GOALS), fsGoals);
    });

    return () => unsub();
  }, [getCurrentUser()?.uid]);

  useEffect(() => {
    if (!storageLoaded) return;
    const uid = getCurrentUser()?.uid;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.GOALS), goals);
  }, [goals, storageLoaded]);

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
        const uid = getCurrentUser()?.uid;
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.GOALS), next);
        return next;
      });

      const activeUser = getCurrentUser();
      if (activeUser) {
        try {
          await fsAddGoal(activeUser.uid, newGoal);
        } catch (err) {
          console.error("Firestore addGoal error:", err);
        }
      }
      return id;
    },
    []
  );

  const updateGoal = useCallback(
    async (id: string, goalData: Partial<Goal>): Promise<void> => {
      setGoals((prev) => {
        const next = prev.map((g) => (g.id === id ? ({ ...g, ...goalData } as Goal) : g));
        const uid = getCurrentUser()?.uid;
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.GOALS), next);
        return next;
      });

      const activeUser = getCurrentUser();
      if (activeUser) {
        try {
          await fsUpdateGoal(activeUser.uid, id, goalData);
        } catch (err) {
          console.error("Firestore updateGoal error:", err);
        }
      }
    },
    []
  );

  const depositToGoal = useCallback(
    async (goalId: string, amount: number, note?: string): Promise<void> => {
      const deposit: BountyDeposit = {
        id: `dep-${Date.now()}`,
        goldAmount: amount,
        depositedAt: getTodayLocalDate(),
        hunterLog: note || "Deposit contribution",
        timestamp: Date.now(),
      };

      const targetGoal = goals.find((g) => g.id === goalId);
      if (!targetGoal) return;

      const updatedGoal: Goal = {
        ...targetGoal,
        savedAmount: (Number(targetGoal.savedAmount) || 0) + amount,
        contributions: [...(targetGoal.contributions || []), deposit],
      };

      setGoals((prev) => {
        const next = prev.map((g) => (g.id === goalId ? updatedGoal : g));
        const uid = getCurrentUser()?.uid;
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.GOALS), next);
        return next;
      });

      const activeUser = getCurrentUser();
      if (activeUser) {
        try {
          await fsDepositToGoal(activeUser.uid, targetGoal, amount, note);
        } catch (err) {
          console.error("Firestore depositToGoal error:", err);
        }
      }
    },
    [goals]
  );

  const deleteGoal = useCallback(
    async (id: string): Promise<void> => {
      setGoals((prev) => {
        const next = prev.filter((g) => g.id !== id);
        const uid = getCurrentUser()?.uid;
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.GOALS), next);
        return next;
      });

      const activeUser = getCurrentUser();
      if (activeUser) {
        try {
          await fsDeleteGoal(activeUser.uid, id);
        } catch (err) {
          console.error("Firestore deleteGoal error:", err);
        }
      }
    },
    []
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