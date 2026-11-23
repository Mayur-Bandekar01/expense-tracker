"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { CategorySphere } from "../../types/hunter";
import { DEFAULT_CATEGORIES } from "../mockData";
import { watchCategorySpheres, saveCategorySphere as fsSaveSphere, deleteCategorySphere as fsDeleteSphere } from "../firestore";
import { loadFromStorage, saveToStorage, getUserStorageKey, STORAGE_KEYS, sanitizeCategorySpheres } from "./storageUtils";
import { getCurrentUser } from "../auth";

interface SpheresContextType {
  spheres: CategorySphere[];
  saveSphere: (sphere: Partial<CategorySphere>) => Promise<void>;
  deleteSphere: (id: string) => Promise<void>;
}

const SpheresContext = createContext<SpheresContextType | null>(null);

export function SpheresProvider({ children }: { children: React.ReactNode }) {
  const [spheres, setSpheres] = useState<CategorySphere[]>(DEFAULT_CATEGORIES);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const activeUid = getCurrentUser()?.uid;
      const spheresKey = getUserStorageKey(activeUid, STORAGE_KEYS.SPHERES);
      const storedSpheres = loadFromStorage(spheresKey, DEFAULT_CATEGORIES);
      setSpheres(sanitizeCategorySpheres(storedSpheres));
    } catch (_e) {}
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const uid = user.uid;
    const uKey = (k: string) => getUserStorageKey(uid, k);

    const unsub = watchCategorySpheres(uid, (fsSpheres) => {
      if (Array.isArray(fsSpheres) && fsSpheres.length > 0) {
        const sanitized = sanitizeCategorySpheres(fsSpheres);
        setSpheres(sanitized);
        saveToStorage(uKey(STORAGE_KEYS.SPHERES), sanitized);
      }
    });

    return () => unsub();
  }, [getCurrentUser()?.uid]);

  useEffect(() => {
    if (!storageLoaded) return;
    const uid = getCurrentUser()?.uid;
    if (spheres.length > 0) {
      saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.SPHERES), spheres);
    }
  }, [spheres, storageLoaded]);

  const saveSphere = useCallback(
    async (catData: Partial<CategorySphere>): Promise<void> => {
      let savedSphere: CategorySphere | undefined;
      setSpheres((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        if (catData.id && safePrev.some((s) => s.id === catData.id)) {
          const next = safePrev.map((s) => {
            if (s.id === catData.id) {
              savedSphere = {
                ...s,
                ...catData,
                element: catData.element || s.element || "water",
                auraColor: catData.auraColor || s.auraColor || "#00f2fe",
              } as CategorySphere;
              return savedSphere;
            }
            return s;
          });
          const uid = getCurrentUser()?.uid;
          if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.SPHERES), next);
          return next;
        }
        const newSphere: CategorySphere = {
          id: catData.id || `cat-${Date.now()}`,
          name: catData.name || "Custom Sphere",
          emoji: catData.emoji || "✨",
          element: catData.element || "water",
          auraColor: catData.auraColor || "#00f2fe",
          ...(catData.monthlyQuotaGold != null ? { monthlyQuotaGold: Number(catData.monthlyQuotaGold) } : {}),
        };
        savedSphere = newSphere;
        const next = [...safePrev, newSphere];
        const uid = getCurrentUser()?.uid;
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.SPHERES), next);
        return next;
      });

      const activeUser = getCurrentUser();
      if (activeUser && savedSphere) {
        try {
          await fsSaveSphere(activeUser.uid, savedSphere);
        } catch (err) {
          console.error("Firestore saveSphere error:", err);
        }
      }
    },
    []
  );

  const deleteSphere = useCallback(
    async (id: string): Promise<void> => {
      setSpheres((prev) => {
        const next = prev.filter((s) => s.id !== id);
        const uid = getCurrentUser()?.uid;
        if (uid) saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.SPHERES), next);
        return next;
      });

      const activeUser = getCurrentUser();
      if (activeUser) {
        try {
          await fsDeleteSphere(activeUser.uid, id);
        } catch (err) {
          console.error("Firestore deleteSphere error:", err);
        }
      }
    },
    []
  );

  const value = useMemo<SpheresContextType>(
    () => ({
      spheres,
      saveSphere,
      deleteSphere,
    }),
    [spheres, saveSphere, deleteSphere]
  );

  return <SpheresContext.Provider value={value}>{children}</SpheresContext.Provider>;
}

export function useSpheres(): SpheresContextType {
  const ctx = useContext(SpheresContext);
  if (!ctx) {
    throw new Error("useSpheres must be used within a SpheresProvider");
  }
  return ctx;
}