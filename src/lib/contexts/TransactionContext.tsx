"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Transaction } from "../../types/hunter";
import { getTodayLocalDate } from "../dateUtils";
import { watchTransactions, addTransaction as fsAddTransaction, updateTransaction as fsUpdateTransaction, deleteTransaction as fsDeleteTransaction, deleteAllTransactions } from "../firestore";
import {
  loadFromStorage,
  saveToStorage,
  getUserStorageKey,
  STORAGE_KEYS,
  normalizeRecordArray,
  mergeRecordsById,
} from "./storageUtils";
import { useAuth } from "./AuthContext";

/** Normalize category key for consistent lookups (lowercase, trimmed) */
function normCat(cat: string): string {
  return (cat || "Miscellaneous").trim().toLowerCase();
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (tx: Partial<Transaction>) => Promise<string>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  // Derived/computed values
  categoryTotals: Map<string, number>; // expense totals by category
  monthlyTotals: Map<string, { income: number; expense: number }>; // YYYY-MM -> totals
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadedUid, setLoadedUid] = useState<string | null | undefined>(undefined);
  const { user } = useAuth();
  const uid = user?.uid;

  // Reload user-scoped data whenever the authenticated account changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const txKey = getUserStorageKey(uid, STORAGE_KEYS.TRANSACTIONS);
    const storedTx = normalizeRecordArray<Transaction>(loadFromStorage<unknown>(txKey, []));
    setTransactions(storedTx);
    setLoadedUid(uid ?? null);
  }, [uid]);

  // Subscribe to Firestore on login. Merge local records into the initial snapshot
  // so guest migration and offline records are not discarded.
  useEffect(() => {
    if (!uid) return;
    const uKey = (k: string) => getUserStorageKey(uid, k);
    let isInitialSnapshot = true;

    const unsub = watchTransactions(uid, (fsTxs) => {
      if (!Array.isArray(fsTxs)) return;
      const localTxs = normalizeRecordArray<Transaction>(
        loadFromStorage<unknown>(uKey(STORAGE_KEYS.TRANSACTIONS), [])
      );
      const activeTxs = isInitialSnapshot
        ? mergeRecordsById(fsTxs.filter(Boolean), localTxs)
        : fsTxs.filter(Boolean);
      const shouldMigrateLocal = isInitialSnapshot;
      isInitialSnapshot = false;
      setTransactions(activeTxs);
      saveToStorage(uKey(STORAGE_KEYS.TRANSACTIONS), activeTxs);

      if (shouldMigrateLocal) {
        const cloudIds = new Set(fsTxs.map((tx) => tx.id));
        activeTxs
          .filter((tx) => !cloudIds.has(tx.id))
          .forEach((tx) => {
            void fsAddTransaction(uid, tx).catch((err) =>
              console.error("Firestore transaction migration error:", err)
            );
          });
      }
    });

    return () => unsub();
  }, [uid]);

  // Persist to localStorage
  useEffect(() => {
    if (loadedUid !== (uid ?? null)) return;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.TRANSACTIONS), transactions);
  }, [transactions, loadedUid, uid]);

  // Memoized derived computations
  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = normCat(t.category);
        map.set(cat, (map.get(cat) || 0) + (Number(t.amount) || 0));
      });
    return map;
  }, [transactions]);

  const monthlyTotals = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    transactions.forEach((t) => {
      if (!t.date || !dateRe.test(t.date)) return;
      const ym = t.date.slice(0, 7);
      const curr = map.get(ym) || { income: 0, expense: 0 };
      if (t.type === "income") curr.income += Number(t.amount) || 0;
      else curr.expense += Number(t.amount) || 0;
      map.set(ym, curr);
    });
    return map;
  }, [transactions]);

  const addTransaction = useCallback(
    async (tx: Partial<Transaction>): Promise<string> => {
      const id = tx.id || `tx-${Date.now()}`;
      const newTx: Transaction = {
        id,
        amount: Number(tx.amount) || 0,
        type: tx.type || "expense",
        category: tx.category || "Miscellaneous",
        note: tx.note || (tx.type === "income" ? "Income Deposit" : "Expense"),
        merchant: tx.merchant || "",
        date: tx.date || getTodayLocalDate(),
        time: tx.time || new Date().toTimeString().slice(0, 5),
        method: tx.method || "UPI",
        isRecurring: Boolean(tx.isRecurring),
        createdAt: Date.now(),
        ...(tx.difficulty ? { difficulty: tx.difficulty } : {}),
      };

      setTransactions((prev) => {
        return [newTx, ...prev.filter((t) => t.id !== id)];
      });

      if (uid) {
        try {
          await fsAddTransaction(uid, newTx);
        } catch (err) {
          console.error("Firestore addTransaction error:", err);
        }
      }
      return id;
    },
    [uid]
  );

  const updateTransaction = useCallback(
    async (id: string, tx: Partial<Transaction>): Promise<void> => {
      setTransactions((prev) => {
        return prev.map((t) => (t.id === id ? ({ ...t, ...tx } as Transaction) : t));
      });

      if (uid) {
        try {
          await fsUpdateTransaction(uid, id, tx);
        } catch (err) {
          console.error("Firestore updateTransaction error:", err);
        }
      }
    },
    [uid]
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<void> => {
      setTransactions((prev) => {
        return (prev || []).filter((t) => t && t.id !== id);
      });

      if (uid) {
        try {
          await fsDeleteTransaction(uid, id);
        } catch (err) {
          console.error("Firestore deleteTransaction error:", err);
        }
      }
    },
    [uid]
  );

  /**
   * Resets all transaction data. Useful for demo mode or clearing local account.
   */
  const resetToDemoData = useCallback(async () => {
    const demoData: Transaction[] = [];

    // Clear all transactions locally
    setTransactions(demoData);

    // Clear Firestore if authenticated user
    if (uid) {
      try {
        await deleteAllTransactions(uid);
      } catch (err) {
        console.error("Firestore resetToDemoData error:", err);
      }
    }
  }, [uid]);

  const value = useMemo<TransactionContextType>(
    () => ({
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      resetToDemoData,
      categoryTotals,
      monthlyTotals,
    }),
    [transactions, addTransaction, updateTransaction, deleteTransaction, resetToDemoData, categoryTotals, monthlyTotals]
  );

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactions(): TransactionContextType {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return ctx;
}
