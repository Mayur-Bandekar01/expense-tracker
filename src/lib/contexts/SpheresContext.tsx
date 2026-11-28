"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { CategorySphere } from "../../types/hunter";
import { DEFAULT_CATEGORIES } from "../mockData";
import { watchCategorySpheres, saveCategorySphere as fsSaveSphere, deleteCategorySphere as fsDeleteSphere } from "../firestore";
import {
  loadFromStorage,
  saveToStorage,
  getUserStorageKey,
  STORAGE_KEYS,
  sanitizeCategorySpheres,
  mergeRecordsById,
} from "./storageUtils";
import { useAuth } from "./AuthContext";

interface SpheresContextType {
  spheres: CategorySphere[];
  saveSphere: (sphere: Partial<CategorySphere>) => Promise<void>;
  deleteSphere: (id: string) => Promise<void>;
}

const SpheresContext = createContext<SpheresContextType | null>(null);

export function SpheresProvider({ children }: { children: React.ReactNode }) {
  const [spheres, setSpheres] = useState<CategorySphere[]>(DEFAULT_CATEGORIES);
  const [loadedUid, setLoadedUid] = useState<string | null | undefined>(undefined);
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const spheresKey = getUserStorageKey(uid, STORAGE_KEYS.SPHERES);
    const storedSpheres = loadFromStorage<unknown>(spheresKey, DEFAULT_CATEGORIES);
    setSpheres(sanitizeCategorySpheres(storedSpheres));
    setLoadedUid(uid ?? null);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const uKey = (k: string) => getUserStorageKey(uid, k);
    let isInitialSnapshot = true;

    const unsub = watchCategorySpheres(uid, (fsSpheres) => {
      if (!Array.isArray(fsSpheres)) return;
      const localSpheres = sanitizeCategorySpheres(
        loadFromStorage<unknown>(uKey(STORAGE_KEYS.SPHERES), DEFAULT_CATEGORIES)
      );
      const activeSpheres = sanitizeCategorySpheres(
        isInitialSnapshot ? mergeRecordsById(fsSpheres, localSpheres) : fsSpheres
      );
      const shouldMigrateLocal = isInitialSnapshot;
      isInitialSnapshot = false;
      setSpheres(activeSpheres);
      saveToStorage(uKey(STORAGE_KEYS.SPHERES), activeSpheres);

      if (shouldMigrateLocal) {
        const cloudIds = new Set(fsSpheres.map((sphere) => sphere.id));
        activeSpheres
          .filter((sphere) => !cloudIds.has(sphere.id))
          .forEach((sphere) => {
            void fsSaveSphere(uid, sphere).catch((err) =>
              console.error("Firestore category migration error:", err)
            );
          });
      }
    });

    return () => unsub();
  }, [uid]);

  useEffect(() => {
    if (loadedUid !== (uid ?? null)) return;
    if (spheres.length > 0) {
      saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.SPHERES), spheres);
    }
  }, [spheres, loadedUid, uid]);

  const saveSphere = useCallback(
    async (catData: Partial<CategorySphere>): Promise<void> => {
      const safeSpheres = Array.isArray(spheres) ? spheres : [];
      const existingSphere = catData.id
        ? safeSpheres.find((sphere) => sphere.id === catData.id)
        : undefined;
      const savedSphere: CategorySphere = existingSphere
        ? ({
            ...existingSphere,
            ...catData,
            element: catData.element || existingSphere.element || "water",
            auraColor: catData.auraColor || existingSphere.auraColor || "#00f2fe",
          } as CategorySphere)
        : {
            id: catData.id || `cat-${Date.now()}`,
            name: catData.name || "Custom Sphere",
            emoji: catData.emoji || "✨",
            element: catData.element || "water",
            auraColor: catData.auraColor || "#00f2fe",
            ...(catData.monthlyQuotaGold != null
              ? { monthlyQuotaGold: Number(catData.monthlyQuotaGold) }
              : {}),
          };
      const nextSpheres = existingSphere
        ? safeSpheres.map((sphere) => (sphere.id === savedSphere.id ? savedSphere : sphere))
        : [...safeSpheres, savedSphere];
      setSpheres(nextSpheres);

      if (uid) {
        try {
          await fsSaveSphere(uid, savedSphere);
        } catch (err) {
          console.error("Firestore saveSphere error:", err);
        }
      }
    },
    [spheres, uid]
  );

  const deleteSphere = useCallback(
    async (id: string): Promise<void> => {
      setSpheres((prev) => {
        return prev.filter((s) => s.id !== id);
      });

      if (uid) {
        try {
          await fsDeleteSphere(uid, id);
        } catch (err) {
          console.error("Firestore deleteSphere error:", err);
        }
      }
    },
    [uid]
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
