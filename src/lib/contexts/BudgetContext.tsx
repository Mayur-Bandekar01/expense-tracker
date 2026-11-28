"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { CategoryBudgetRune } from "../../types/hunter";
import { getTodayLocalDate } from "../dateUtils";
import { watchBudgetRunes, saveBudgetRune as fsSaveRune, deleteBudgetRune as fsDeleteRune, watchBudgetRune, setBudgetRune, deleteMonthlyBudget } from "../firestore";
import {
  loadFromStorage,
  saveToStorage,
  getUserStorageKey,
  STORAGE_KEYS,
  normalizeRecordArray,
  mergeRecordsById,
} from "./storageUtils";
import { useAuth } from "./AuthContext";

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
  const [loadedUid, setLoadedUid] = useState<string | null | undefined>(undefined);
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const runesKey = getUserStorageKey(uid, STORAGE_KEYS.RUNES);
    const budgetKey = getUserStorageKey(uid, STORAGE_KEYS.MONTHLY_BUDGET);
    const storedRunes = normalizeRecordArray<CategoryBudgetRune>(
      loadFromStorage<unknown>(runesKey, [])
    );
    const storedBudget = loadFromStorage<number | null>(budgetKey, null);
    setRunes(storedRunes);
    setMonthlyBudget(typeof storedBudget === "number" && storedBudget > 0 ? storedBudget : null);
    setLoadedUid(uid ?? null);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const uKey = (k: string) => getUserStorageKey(uid, k);
    const currentYM = getTodayLocalDate().slice(0, 7);
    let isInitialRuneSnapshot = true;
    let isInitialBudgetSnapshot = true;

    const unsubs: (() => void)[] = [];

    unsubs.push(
      watchBudgetRunes(uid, (fsRunes) => {
        if (!Array.isArray(fsRunes)) return;
        const localRunes = normalizeRecordArray<CategoryBudgetRune>(
          loadFromStorage<unknown>(uKey(STORAGE_KEYS.RUNES), [])
        );
        const activeRunes = isInitialRuneSnapshot
          ? mergeRecordsById(fsRunes, localRunes)
          : fsRunes;
        const shouldMigrateLocal = isInitialRuneSnapshot;
        isInitialRuneSnapshot = false;
        setRunes(activeRunes);
        saveToStorage(uKey(STORAGE_KEYS.RUNES), activeRunes);

        if (shouldMigrateLocal) {
          const cloudIds = new Set(fsRunes.map((rune) => rune.id));
          activeRunes
            .filter((rune) => !cloudIds.has(rune.id))
            .forEach((rune) => {
              void fsSaveRune(uid, rune).catch((err) =>
                console.error("Firestore budget migration error:", err)
              );
            });
        }
      })
    );

    unsubs.push(
      watchBudgetRune(uid, currentYM, (fsBudget) => {
        const isInitialSnapshot = isInitialBudgetSnapshot;
        isInitialBudgetSnapshot = false;
        if (fsBudget) {
          const rawAmt = (fsBudget as any).totalBudget ?? (fsBudget as any).allocatedManaGold;
          const parsed = Number(rawAmt);
          if (!isNaN(parsed) && parsed > 0) {
            setMonthlyBudget(parsed);
            saveToStorage(uKey(STORAGE_KEYS.MONTHLY_BUDGET), parsed);
            return;
          }
        }

        if (isInitialSnapshot) {
          const localBudget = loadFromStorage<number | null>(uKey(STORAGE_KEYS.MONTHLY_BUDGET), null);
          if (typeof localBudget === "number" && localBudget > 0) {
            setMonthlyBudget(localBudget);
            void setBudgetRune(uid, currentYM, {
              totalBudget: localBudget,
              allocatedManaGold: localBudget,
              monthYear: currentYM,
              currency: "INR",
            }).catch((err) => console.error("Firestore monthly budget migration error:", err));
            return;
          }
        }
        setMonthlyBudget(null);
        saveToStorage(uKey(STORAGE_KEYS.MONTHLY_BUDGET), null);
      })
    );

    return () => unsubs.forEach((u) => u());
  }, [uid]);

  useEffect(() => {
    if (loadedUid !== (uid ?? null)) return;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.RUNES), runes);
  }, [runes, loadedUid, uid]);

  useEffect(() => {
    if (loadedUid !== (uid ?? null)) return;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.MONTHLY_BUDGET), monthlyBudget);
  }, [monthlyBudget, loadedUid, uid]);

  const saveRune = useCallback(
    async (runeData: Partial<CategoryBudgetRune>): Promise<void> => {
      const safeRunes = Array.isArray(runes) ? runes : [];
      const trimmedCat = (runeData.category || "").trim().toLowerCase();
      const existingRune = runeData.id
        ? safeRunes.find((rune) => rune.id === runeData.id)
        : undefined;
      const existingCatRune = safeRunes.find(
          (r) => (r.category || "").trim().toLowerCase() === trimmedCat
        );
      const previous = existingRune || existingCatRune;
      const resolvedRune: CategoryBudgetRune = previous
        ? ({ ...previous, ...runeData, id: previous.id } as CategoryBudgetRune)
        : {
          id: runeData.id || `rune-${Date.now()}`,
          category: runeData.category || "Dining & Food",
          limit: Number(runeData.limit) || 10000,
          element: runeData.element || "sun",
          spent: Number(runeData.spent) || 0,
        };
      const nextRunes = previous
        ? safeRunes.map((rune) => (rune.id === previous.id ? resolvedRune : rune))
        : [...safeRunes, resolvedRune];
      setRunes(nextRunes);

      if (uid) {
        try {
          await fsSaveRune(uid, resolvedRune);
        } catch (err) {
          console.error("Firestore saveRune error:", err);
        }
      }
    },
    [runes, uid]
  );

  const deleteRune = useCallback(
    async (id: string): Promise<void> => {
      setRunes((prev) => {
        return prev.filter((r) => r.id !== id);
      });

      if (uid) {
        try {
          await fsDeleteRune(uid, id);
        } catch (err) {
          console.error("Firestore deleteRune error:", err);
        }
      }
    },
    [uid]
  );

  const updateMonthlyBudget = useCallback(
    async (amount: number | null): Promise<void> => {
      const currentYM = getTodayLocalDate().slice(0, 7);
      const validAmount =
        amount !== null && !isNaN(amount) && amount > 0
          ? Math.round(amount * 100) / 100
          : null;

      setMonthlyBudget(validAmount);

      if (uid) {
        try {
          if (validAmount === null) {
            await deleteMonthlyBudget(uid, currentYM);
          } else {
            await setBudgetRune(uid, currentYM, {
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
    [uid]
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
