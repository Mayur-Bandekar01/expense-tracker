"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { User } from "firebase/auth";
import { watchAuth, getCurrentUser, signOutUser } from "../auth";
import {
  loadFromStorage,
  saveToStorage,
  getUserStorageKey,
  STORAGE_KEYS,
  normalizeRecordArray,
  mergeRecordsById,
} from "./storageUtils";

interface AuthContextType {
  user: User | null;
  authLoaded: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function migrateGuestStorage(uid: string): void {
  if (typeof window === "undefined") return;

  // Migration lock: prevents multiple tabs from running migration simultaneously
  const lockKey = `paisa_pulse_migration_lock_${uid}`;
  const lockValue = Date.now().toString();
  try {
    const existing = localStorage.getItem(lockKey);
    if (existing && Date.now() - Number(existing) < 30000) {
      // Another tab is migrating (or finished recently). Skip.
      return;
    }
    localStorage.setItem(lockKey, lockValue);
  } catch {
    return; // Cannot acquire lock, skip
  }

  const migratedKey = getUserStorageKey(uid, "paisa_pulse_migrated_v3");
  if (loadFromStorage(migratedKey, false)) {
    try { localStorage.removeItem(lockKey); } catch {}
    return;
  }

  const collectionKeys = [
    STORAGE_KEYS.TRANSACTIONS,
    STORAGE_KEYS.GOALS,
    STORAGE_KEYS.RUNES,
    STORAGE_KEYS.PACTS,
    STORAGE_KEYS.SPHERES,
  ];
  let migrationComplete = true;

  for (const key of collectionKeys) {
    const userKey = getUserStorageKey(uid, key);
    const guestRaw = loadFromStorage<unknown>(key, null);
    const userRaw = loadFromStorage<unknown>(userKey, null);
    const guestRecords = normalizeRecordArray<{ id?: string }>(guestRaw);
    const userRecords = normalizeRecordArray<{ id?: string }>(userRaw);
    const merged = mergeRecordsById(userRecords, guestRecords);

    // Also normalize scalar values written by the previous migration implementation.
    if (guestRecords.length > 0 || !Array.isArray(userRaw)) {
      if (!saveToStorage(userKey, merged)) {
        migrationComplete = false;
        continue;
      }
    }

    if (guestRaw !== null) {
      try {
        localStorage.removeItem(key);
      } catch {
        migrationComplete = false;
      }
    }
  }

  const guestBudget = loadFromStorage<number | null>(STORAGE_KEYS.MONTHLY_BUDGET, null);
  const userBudgetKey = getUserStorageKey(uid, STORAGE_KEYS.MONTHLY_BUDGET);
  const userBudget = loadFromStorage<number | null>(userBudgetKey, null);
  if (guestBudget !== null) {
    if (userBudget === null && !saveToStorage(userBudgetKey, guestBudget)) {
      migrationComplete = false;
    } else {
      try {
        localStorage.removeItem(STORAGE_KEYS.MONTHLY_BUDGET);
      } catch {
        migrationComplete = false;
      }
    }
  }

  if (migrationComplete) saveToStorage(migratedKey, true);
  try { localStorage.removeItem(lockKey); } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    let resolved = false;
    const fallbackTimer = setTimeout(() => {
      if (!resolved) {
        setAuthLoaded(true);
      }
    }, 1500);

    const unsub = watchAuth((currUser) => {
      resolved = true;
      clearTimeout(fallbackTimer);
      if (currUser) migrateGuestStorage(currUser.uid);
      setUser(currUser);
      setAuthLoaded(true);
    });

    return () => {
      clearTimeout(fallbackTimer);
      unsub();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error("[AuthProvider] Sign out error:", err);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      authLoaded,
      signOut,
    }),
    [user, authLoaded, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
