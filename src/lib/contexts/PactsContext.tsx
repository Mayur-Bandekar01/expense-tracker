"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { PerpetualPact } from "../../types/hunter";
import { getTodayLocalDate } from "../dateUtils";
import { watchPerpetualPacts, savePerpetualPact as fsSavePact, deletePerpetualPact as fsDeletePact } from "../firestore";
import {
  loadFromStorage,
  saveToStorage,
  getUserStorageKey,
  STORAGE_KEYS,
  normalizeRecordArray,
  mergeRecordsById,
} from "./storageUtils";
import { useAuth } from "./AuthContext";
import { useTransactions } from "./TransactionContext";

interface PactsContextType {
  pacts: PerpetualPact[];
  savePact: (pactData: Partial<PerpetualPact>) => Promise<void>;
  togglePact: (id: string) => Promise<void>;
  deletePact: (id: string, wipeTransactions?: boolean) => Promise<void>;
  executePact: (pactOrId: PerpetualPact | string) => Promise<string>;
}

const PactsContext = createContext<PactsContextType | null>(null);

export function PactsProvider({ children }: { children: React.ReactNode }) {
  const [pacts, setPacts] = useState<PerpetualPact[]>([]);
  const [loadedUid, setLoadedUid] = useState<string | null | undefined>(undefined);
  const { user } = useAuth();
  const uid = user?.uid;
  const { addTransaction, transactions, deleteTransaction } = useTransactions();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pactsKey = getUserStorageKey(uid, STORAGE_KEYS.PACTS);
    const storedPacts = normalizeRecordArray<PerpetualPact>(loadFromStorage<unknown>(pactsKey, []));
    setPacts(storedPacts);
    setLoadedUid(uid ?? null);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const uKey = (k: string) => getUserStorageKey(uid, k);
    let isInitialSnapshot = true;

    const unsub = watchPerpetualPacts(uid, (fsPacts) => {
      if (!Array.isArray(fsPacts)) return;
      const localPacts = normalizeRecordArray<PerpetualPact>(
        loadFromStorage<unknown>(uKey(STORAGE_KEYS.PACTS), [])
      );
      const activePacts = isInitialSnapshot ? mergeRecordsById(fsPacts, localPacts) : fsPacts;
      const shouldMigrateLocal = isInitialSnapshot;
      isInitialSnapshot = false;
      setPacts(activePacts);
      saveToStorage(uKey(STORAGE_KEYS.PACTS), activePacts);

      if (shouldMigrateLocal) {
        const cloudIds = new Set(fsPacts.map((pact) => pact.id));
        activePacts
          .filter((pact) => !cloudIds.has(pact.id))
          .forEach((pact) => {
            void fsSavePact(uid, pact).catch((err) =>
              console.error("Firestore pact migration error:", err)
            );
          });
      }
    });

    return () => unsub();
  }, [uid]);

  useEffect(() => {
    if (loadedUid !== (uid ?? null)) return;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.PACTS), pacts);
  }, [pacts, loadedUid, uid]);

  const savePact = useCallback(
    async (pactData: Partial<PerpetualPact>): Promise<void> => {
      const existingPact = pactData.id ? pacts.find((pact) => pact.id === pactData.id) : undefined;
      const targetPact: PerpetualPact = existingPact
        ? ({ ...existingPact, ...pactData } as PerpetualPact)
        : {
          id: pactData.id || `pact-${Date.now()}`,
          uid: uid || "guest",
          pactTitle: pactData.pactTitle || "New Pact",
          goldCost: Number(pactData.goldCost) || 999,
          frequency: pactData.frequency || "MONTHLY",
          nextInvocationDate: pactData.nextInvocationDate || getTodayLocalDate(),
          category: pactData.category || "Utilities",
          isActive: pactData.isActive ?? true,
        };
      setPacts((prev) =>
        existingPact
          ? prev.map((pact) => (pact.id === targetPact.id ? targetPact : pact))
          : [...prev, targetPact]
      );

      if (uid) {
        try {
          await fsSavePact(uid, targetPact);
        } catch (err) {
          console.error("Firestore savePact error:", err);
        }
      }
    },
    [pacts, uid]
  );

  const togglePact = useCallback(
    async (id: string): Promise<void> => {
      const currentPact = pacts.find((pact) => pact.id === id);
      if (!currentPact) return;
      const updatedPact = { ...currentPact, isActive: !currentPact.isActive };
      setPacts((prev) => prev.map((pact) => (pact.id === id ? updatedPact : pact)));

      if (uid) {
        try {
          await fsSavePact(uid, updatedPact);
        } catch (err) {
          console.error("Firestore togglePact error:", err);
        }
      }
    },
    [pacts, uid]
  );

  const deletePact = useCallback(
    async (id: string, wipeTransactions: boolean = true): Promise<void> => {
      const targetPact = pacts.find((p) => p.id === id);

      setPacts((prev) => (prev || []).filter((p) => p && p.id !== id));

      if (uid) {
        try {
          await fsDeletePact(uid, id);
        } catch (err) {
          console.error("Firestore deletePact error:", err);
        }
      }

      if (wipeTransactions && targetPact) {
        const titleLower = (targetPact.pactTitle || "").trim().toLowerCase();
        const expectedNote = `recurring payment: ${titleLower}`;
        const associatedTransactions = transactions.filter((transaction) => {
          if (!transaction.isRecurring) return false;
          const note = (transaction.note || "").trim().toLowerCase();
          const merchant = (transaction.merchant || "").trim().toLowerCase();
          return note === expectedNote || merchant === titleLower;
        });
        await Promise.all(associatedTransactions.map((transaction) => deleteTransaction(transaction.id)));
      }
    },
    [pacts, uid, transactions, deleteTransaction]
  );

  const executePact = useCallback(
    async (pactOrId: PerpetualPact | string): Promise<string> => {
      const pact =
        typeof pactOrId === "string" ? pacts.find((p) => p.id === pactOrId) : pactOrId;
      if (!pact) return "";

      const cost = Number(pact.goldCost) || 0;

      const txId = await addTransaction({
        amount: cost,
        type: "expense",
        category: pact.category || "Utilities",
        note: `Recurring Payment: ${pact.pactTitle}`,
        merchant: pact.pactTitle,
        method: "Auto-Debit",
        isRecurring: true,
      });

      let baseDate: Date;
      if (pact.nextInvocationDate) {
        const raw = String(pact.nextInvocationDate).trim();
        const clean = raw.includes("T") ? raw.split("T")[0] : raw;
        const parsed = new Date(clean + "T00:00:00");
        baseDate = isNaN(parsed.getTime()) ? new Date() : parsed;
      } else {
        baseDate = new Date();
      }

      const freq = (pact.frequency || "MONTHLY").toUpperCase();
      if (freq === "DAILY") {
        baseDate.setDate(baseDate.getDate() + 1);
      } else if (freq === "WEEKLY") {
        baseDate.setDate(baseDate.getDate() + 7);
      } else if (freq === "ANNUAL") {
        baseDate.setFullYear(baseDate.getFullYear() + 1);
      } else {
        const targetDay = baseDate.getDate();
        baseDate.setDate(1);
        baseDate.setMonth(baseDate.getMonth() + 1);
        const maxDaysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
        baseDate.setDate(Math.min(targetDay, maxDaysInMonth));
      }

      const year = baseDate.getFullYear();
      const month = String(baseDate.getMonth() + 1).padStart(2, "0");
      const day = String(baseDate.getDate()).padStart(2, "0");
      const nextISO = `${year}-${month}-${day}`;

      await savePact({ ...pact, nextInvocationDate: nextISO });
      return txId;
    },
    [pacts, addTransaction, savePact]
  );

  const value = useMemo<PactsContextType>(
    () => ({
      pacts,
      savePact,
      togglePact,
      deletePact,
      executePact,
    }),
    [pacts, savePact, togglePact, deletePact, executePact]
  );

  return <PactsContext.Provider value={value}>{children}</PactsContext.Provider>;
}

export function usePacts(): PactsContextType {
  const ctx = useContext(PactsContext);
  if (!ctx) {
    throw new Error("usePacts must be used within a PactsProvider");
  }
  return ctx;
}
