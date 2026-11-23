"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { CategoryBudgetRune } from "../../types/hunter";
import { getTodayLocalDate } from "../dateUtils";
import { watchBudgetRunes, saveBudgetRune as fsSaveRune, deleteBudgetRune as fsDeleteRune, watchBudgetRune, setBudgetRune, deleteMonthlyBudget } from "../firestore";
import { loadFromStorage, saveToStorage, getUserStorageKey, STORAGE_KEYS } from "./storageUtils";
import { getCurrentUser } from "../auth";

interface BudgetContextType {
  runes: CategoryBudgetRune[];
  monthlyBudget: number | null;
  saveRune: (rune: Partial<CategoryBudgetRune>) => Promise<void>;
  deleteRune: (id: string) => Promise<void>;
  updateMonthlyBudget: (amount: number | null) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [runes, setRunes] = useState<CategoryBudgetRune[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const activeUid = getCurrentUser()?.uid;
      const runesKey = getUserStorageKey(activeUid, STORAGE_KEYS.RUNES);
      const budgetKey = getUserStorageKey(activeUid, STORAGE_KEYS.MONTHLY_BUDGET);
      const storedRunes = loadFromStorage<CategoryBudgetRune[]>(runesKey, []);
      const storedBudget = loadFromStorage<number | null>(budgetKey, null);
      setRunes(storedRunes);
      setMonthlyBudget(typeof storedBudget === "number" && storedBudget > 0 ? storedBudget : null);
    } catch (_e) {}
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const uid = user.uid;
    const uKey = (k: string) => getUserStorageKey(uid, k);
    const currentYM = getTodayLocalDate().slice(0, 7);

    const unsubs: (() => void)[] = [];

    unsubs.push(
      watchBudgetRunes(uid, (fsRunes) => {
        if (!Array.isArray(fsRunes)) return;
        setRunes(fsRunes);
        saveToStorage(uKey(STORAGE_KEYS.RUNES), fsRunes);
      })
    );

    unsubs.push(
      watchBudgetRune(uid, currentYM, (fsBudget) => {
        if (fsBudget) {
          const rawAmt = (fsBudget as any).totalBudget ?? (fsBudget as any).allocatedManaGold;
          const parsed = Number(rawAmt);
          if (!isNaN(parsed) && parsed > 0) {
            setMonthlyBudget(parsed);
            saveToStorage(uKey(STORAGE_KEYS.MONTHLY_BUDGET), parsed);
            return;
          }
        }
        setMonthlyBudget(null);
        saveToStorage(uKey(STORAGE_KEYS.MONTHLY_BUDGET), null);
      })
    );

    return () => unsubs.forEach((u) => u());
  }, [getCurrentUser()?.uid]);

  useEffect(() => {
    if (!storageLoaded) return;
    const uid = getCurrentUser()?.uid;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.RUNES), runes);
  }, [runes, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    const uid = getCurrentUser()?.uid;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.MONTHLY_BUDGET), monthlyBudget);
  }, [monthlyBudget, storageLoaded]);

  const saveRune = useCallback(
    async (runeData: Partial<CategoryBudgetRune>): Promise<void> => {
      let resolvedRune: CategoryBudgetRune | undefined;
      setRunes((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        if (runeData.id && safePrev.some((r) => r.id === runeData.id)) {
          const next = safePrev.map((r) => {
            if (r.id === runeData.id) {
              resolvedRune = { ...r, ...runeData } as CategoryBudgetRune;
              return resolvedRune;
            }
            return r;
          });
          const uid = getCurrentUser()?.uid;
          if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.RUNES), next);
          return next;
        }

        const trimmedCat = (runeData.category || "").trim().toLowerCase();
        const existingCatRune = safePrev.find(
          (r) => (r.category || "").trim().toLowerCase() === trimmedCat
        );
        if (existingCatRune) {
          const next = safePrev.map((r) => {
            if (r.id === existingCatRune.id) {
              resolvedRune = { ...r, ...runeData, id: existingCatRune.id } as CategoryBudgetRune;
              return resolvedRune;
            }
            return r;
          });
          const uid = getCurrentUser()?.uid;
          if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.RUNES), next);
          return next;
        }

        resolvedRune = {
          id: runeData.id || `rune-${Date.now()}`,
          category: runeData.category || "Dining & Food",
          limit: Number(runeData.limit) || 10000,
          element: runeData.element || "sun",
          spent: Number(runeData.spent) || 0,
        };
        const next = [...safePrev, resolvedRune];
        const uid = getCurrentUser()?.uid;
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.RUNES), next);
        return next;
      });

      const activeUser = getCurrentUser();
      if (activeUser && resolvedRune) {
        try {
          await fsSaveRune(activeUser.uid, resolvedRune);
        } catch (err) {
          console.error("Firestore saveRune error:", err);
        }
      }
    },
    []
  );

  const deleteRune = useCallback(
    async (id: string): Promise<void> => {
      setRunes((prev) => {
        const next = prev.filter((r) => r.id !== id);
        const uid = getCurrentUser()?.uid;
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.RUNES), next);
        return next;
      });

      const activeUser = getCurrentUser();
      if (activeUser) {
        try {
          await fsDeleteRune(activeUser.uid, id);
        } catch (err) {
          console.error("Firestore deleteRune error:", err);
        }
      }
    },
    []
  );

  const updateMonthlyBudget = useCallback(
    async (amount: number | null): Promise<void> => {
      const currentYM = getTodayLocalDate().slice(0, 7);
      const validAmount =
        amount !== null && !isNaN(amount) && amount > 0
          ? Math.round(amount * 100) / 100
          : null;

      setMonthlyBudget(validAmount);

      const activeUser = getCurrentUser();
      const uid = activeUser?.uid;
      if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.MONTHLY_BUDGET), validAmount);

      if (activeUser) {
        try {
          if (validAmount === null) {
            await deleteMonthlyBudget(activeUser.uid, currentYM);
          } else {
            await setBudgetRune(activeUser.uid, currentYM, {
              totalBudget: validAmount,
              allocatedManaGold: validAmount,
              monthYear: currentYM,
              currency: "INR",
              updatedAt: new Date().toISOString(),
            } as any);
          }
        } catch (err) {
          console.error("Firestore updateMonthlyBudget error:", err);
        }
      }
    },
    []
  );

  const value = useMemo<BudgetContextType>(
    () => ({
      runes,
      monthlyBudget,
      saveRune,
      deleteRune,
      updateMonthlyBudget,
    }),
    [runes, monthlyBudget, saveRune, deleteRune, updateMonthlyBudget]
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudgets(): BudgetContextType {
  const ctx = useContext(BudgetContext);
  if (!ctx) {
    throw new Error("useBudgets must be used within a BudgetProvider");
  }
  return ctx;
}