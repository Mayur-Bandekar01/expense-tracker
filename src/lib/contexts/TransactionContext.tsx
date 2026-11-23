"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Transaction } from "../../types/hunter";
import { getTodayLocalDate } from "../dateUtils";
import { watchTransactions, addTransaction as fsAddTransaction, updateTransaction as fsUpdateTransaction, deleteTransaction as fsDeleteTransaction, deleteAllTransactions } from "../firestore";
import { loadFromStorage, saveToStorage, getUserStorageKey, STORAGE_KEYS } from "./storageUtils";
import { getCurrentUser } from "../auth";

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
  const [storageLoaded, setStorageLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const activeUid = getCurrentUser()?.uid;
      const txKey = getUserStorageKey(activeUid, STORAGE_KEYS.TRANSACTIONS);
      const storedTx = loadFromStorage<Transaction[]>(txKey, []);
      setTransactions(storedTx);
    } catch (_e) {}
    setStorageLoaded(true);
  }, []);

  // Firestore sync when user logs in
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const uid = user.uid;
    const uKey = (k: string) => getUserStorageKey(uid, k);

    const unsub = watchTransactions(uid, (fsTxs) => {
      if (!Array.isArray(fsTxs)) return;
      const activeTxs = fsTxs.filter(Boolean);
      setTransactions(activeTxs);
      saveToStorage(uKey(STORAGE_KEYS.TRANSACTIONS), activeTxs);
    });

    return () => unsub();
  }, [getCurrentUser()?.uid]);

  // Persist to localStorage
  useEffect(() => {
    if (!storageLoaded) return;
    const uid = getCurrentUser()?.uid;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.TRANSACTIONS), transactions);
  }, [transactions, storageLoaded]);

  // Memoized derived computations
  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = t.category || "Miscellaneous";
        map.set(cat, (map.get(cat) || 0) + (Number(t.amount) || 0));
      });
    return map;
  }, [transactions]);

  const monthlyTotals = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    transactions.forEach((t) => {
      if (!t.date || t.date.length < 7) return;
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
        ...(tx.difficulty ? { difficulty: tx.difficulty } : {}),
      };

      setTransactions((prev) => {
        const next = [newTx, ...prev.filter((t) => t.id !== id)];
        const uid = getCurrentUser()?.uid;
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.TRANSACTIONS), next);
        return next;
      });

      const activeUser = getCurrentUser();
      if (activeUser) {
        try {
          await fsAddTransaction(activeUser.uid, newTx);
        } catch (err) {
          console.error("Firestore addTransaction error:", err);
        }
      }
      return id;
    },
    []
  );

  const updateTransaction = useCallback(
    async (id: string, tx: Partial<Transaction>): Promise<void> => {
      setTransactions((prev) => {
        const next = prev.map((t) => (t.id === id ? ({ ...t, ...tx } as Transaction) : t));
        const uid = getCurrentUser()?.uid;
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.TRANSACTIONS), next);
        return next;
      });

      const activeUser = getCurrentUser();
      if (activeUser) {
        try {
          await fsUpdateTransaction(activeUser.uid, id, tx);
        } catch (err) {
          console.error("Firestore updateTransaction error:", err);
        }
      }
    },
    []
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<void> => {
      const activeUser = getCurrentUser();
      const uid = activeUser?.uid;

      setTransactions((prev) => {
        const next = (prev || []).filter((t) => t && t.id !== id);
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.TRANSACTIONS), next);
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, next);
        return next;
      });

      if (activeUser && uid) {
        try {
          await fsDeleteTransaction(uid, id);
        } catch (err) {
          console.error("Firestore deleteTransaction error:", err);
        }
      }
    },
    []
  );

  /**
   * Resets all transaction data. Useful for demo mode or clearing local account.
   */
  const resetToDemoData = useCallback(async () => {
    const uid = getCurrentUser()?.uid;
    const demoData: Transaction[] = [];

    // Clear all transactions locally
    setTransactions(demoData);

    // Clear localStorage
    if (uid) {
      saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.TRANSACTIONS), demoData);
    }
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, demoData);

    // Clear Firestore if authenticated user
    const activeUser = getCurrentUser();
    if (activeUser) {
      try {
        await deleteAllTransactions(activeUser.uid);
      } catch (err) {
        console.error("Firestore resetToDemoData error:", err);
      }
    }
  }, []);

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