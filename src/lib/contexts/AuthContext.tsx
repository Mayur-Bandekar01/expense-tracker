"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { User } from "firebase/auth";
import { watchAuth, getCurrentUser, signOutUser } from "../auth";
import { loadFromStorage, saveToStorage, getUserStorageKey, STORAGE_KEYS } from "./storageUtils";

interface AuthContextType {
  user: User | null;
  authLoaded: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

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
      setUser(currUser);
      setAuthLoaded(true);

      if (!currUser) {
        return;
      }
    });

    return () => {
      clearTimeout(fallbackTimer);
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const uid = user.uid;
    const uKey = (k: string) => getUserStorageKey(uid, k);
    const migratedKey = getUserStorageKey(uid, "paisa_pulse_migrated_v2");
    const alreadyMigrated = loadFromStorage(migratedKey, false);

    if (!alreadyMigrated) {
      saveToStorage(migratedKey, true);
      const guestTxs = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
      if (guestTxs.length > 0) {
        guestTxs.forEach((tx) => saveToStorage(uKey(STORAGE_KEYS.TRANSACTIONS), tx));
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      }
      const guestGoals = loadFromStorage(STORAGE_KEYS.GOALS, []);
      if (guestGoals.length > 0) {
        guestGoals.forEach((g) => saveToStorage(uKey(STORAGE_KEYS.GOALS), g));
        localStorage.removeItem(STORAGE_KEYS.GOALS);
      }
      const guestRunes = loadFromStorage(STORAGE_KEYS.RUNES, []);
      if (guestRunes.length > 0) {
        guestRunes.forEach((r) => saveToStorage(uKey(STORAGE_KEYS.RUNES), r));
        localStorage.removeItem(STORAGE_KEYS.RUNES);
      }
      const guestPacts = loadFromStorage(STORAGE_KEYS.PACTS, []);
      if (guestPacts.length > 0) {
        guestPacts.forEach((p) => saveToStorage(uKey(STORAGE_KEYS.PACTS), p));
        localStorage.removeItem(STORAGE_KEYS.PACTS);
      }
    }
  }, [user]);

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