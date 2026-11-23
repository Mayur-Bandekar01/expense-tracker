"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { PerpetualPact } from "../../types/hunter";
import { getTodayLocalDate } from "../dateUtils";
import { watchPerpetualPacts, savePerpetualPact as fsSavePact, deletePerpetualPact as fsDeletePact } from "../firestore";
import { loadFromStorage, saveToStorage, getUserStorageKey, STORAGE_KEYS } from "./storageUtils";
import { getCurrentUser } from "../auth";
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
  const [storageLoaded, setStorageLoaded] = useState(false);
  const { addTransaction } = useTransactions();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const activeUid = getCurrentUser()?.uid;
      const pactsKey = getUserStorageKey(activeUid, STORAGE_KEYS.PACTS);
      const storedPacts = loadFromStorage<PerpetualPact[]>(pactsKey, []);
      setPacts(storedPacts);
    } catch (_e) {}
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const uid = user.uid;
    const uKey = (k: string) => getUserStorageKey(uid, k);

    const unsub = watchPerpetualPacts(uid, (fsPacts) => {
      if (!Array.isArray(fsPacts)) return;
      setPacts(fsPacts);
      saveToStorage(uKey(STORAGE_KEYS.PACTS), fsPacts);
    });

    return () => unsub();
  }, [getCurrentUser()?.uid]);

  useEffect(() => {
    if (!storageLoaded) return;
    const uid = getCurrentUser()?.uid;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.PACTS), pacts);
  }, [pacts, storageLoaded]);

  const savePact = useCallback(
    async (pactData: Partial<PerpetualPact>): Promise<void> => {
      let targetPact: PerpetualPact | undefined;
      setPacts((prev) => {
        if (pactData.id && prev.some((p) => p.id === pactData.id)) {
          const next = prev.map((p) => {
            if (p.id === pactData.id) {
              targetPact = { ...p, ...pactData } as PerpetualPact;
              return targetPact;
            }
            return p;
          });
          const uid = getCurrentUser()?.uid;
          if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.PACTS), next);
          return next;
        }
        const activeUid = getCurrentUser()?.uid || "guest";
        const newPact: PerpetualPact = {
          id: pactData.id || `pact-${Date.now()}`,
          uid: activeUid,
          pactTitle: pactData.pactTitle || "New Pact",
          goldCost: Number(pactData.goldCost) || 999,
          frequency: pactData.frequency || "MONTHLY",
          nextInvocationDate: pactData.nextInvocationDate || getTodayLocalDate(),
          category: pactData.category || "Utilities",
          isActive: pactData.isActive ?? true,
        };
        targetPact = newPact;
        const next = [...prev, newPact];
        const uid = getCurrentUser()?.uid;
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.PACTS), next);
        return next;
      });

      const activeUser = getCurrentUser();
      if (activeUser && targetPact) {
        try {
          await fsSavePact(activeUser.uid, targetPact);
        } catch (err) {
          console.error("Firestore savePact error:", err);
        }
      }
    },
    []
  );

  const togglePact = useCallback(
    async (id: string): Promise<void> => {
      let updatedPact: PerpetualPact | undefined;
      setPacts((prev) => {
        const next = prev.map((p) => {
          if (p.id !== id) return p;
          updatedPact = { ...p, isActive: !p.isActive };
          return updatedPact;
        });
        const uid = getCurrentUser()?.uid;
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.PACTS), next);
        return next;
      });

      const activeUser = getCurrentUser();
      if (activeUser && updatedPact) {
        try {
          await fsSavePact(activeUser.uid, updatedPact);
        } catch (err) {
          console.error("Firestore togglePact error:", err);
        }
      }
    },
    []
  );

  const deletePact = useCallback(
    async (id: string, wipeTransactions: boolean = true): Promise<void> => {
      const activeUser = getCurrentUser();
      const uid = activeUser?.uid;
      const targetPact = pacts.find((p) => p.id === id);

      setPacts((prev) => {
        const next = (prev || []).filter((p) => p && p.id !== id);
        if (uid) {
          saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.PACTS), next);
        }
        saveToStorage(STORAGE_KEYS.PACTS, next);
        return next;
      });

      if (activeUser && uid) {
        try {
          await fsDeletePact(uid, id);
        } catch (err) {
          console.error("Firestore deletePact error:", err);
        }
      }

      if (wipeTransactions && targetPact) {
        const titleLower = (targetPact.pactTitle || "").trim().toLowerCase();
        let wipedTxs: any[] = [];

        // We need to import the deleteTransaction from TransactionContext
        // This will be handled by the consumer component
      }
    },
    [pacts]
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