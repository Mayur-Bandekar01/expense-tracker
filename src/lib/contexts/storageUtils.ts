"use client";

/**
 * Shared localStorage utilities for all split contexts
 * Replaces the old monolithic hunterContext storage helpers
 */

import { CategorySphere, BreathingStyle } from "../../types/hunter";

export const STORAGE_KEYS = {
  TRANSACTIONS: "paisa_pulse_transactions",
  GOALS: "paisa_pulse_goals",
  RUNES: "paisa_pulse_runes",
  PACTS: "paisa_pulse_pacts",
  SPHERES: "paisa_pulse_spheres",
  MONTHLY_BUDGET: "paisa_pulse_monthly_budget",
  THEME: "paisa_pulse_theme",
  ANIME_ACCENTS: "paisa_pulse_anime_accents",
  AUDIO_MUTE: "paisa_pulse_audio_mute",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function getUserStorageKey(uid: string | null | undefined, key: string): string {
  if (!uid || uid === "guest") {
    return key;
  }
  return `paisa_pulse_${uid}_${key}`;
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_e) {
    // Silently fail on quota exceeded or private browsing
  }
}

/**
 * Default aura colors for breathing styles
 */
const BREATHING_AURAS: Record<BreathingStyle, string> = {
  water: "#6366f1",
  sun: "#f43f5e",
  thunder: "#eab308",
  beast: "#10b981",
  mist: "#8b5cf6",
  flame: "#f97316",
};

/**
 * Sanitizes raw category sphere data from localStorage
 */
export function sanitizeCategorySpheres(input: unknown): CategorySphere[] {
  const arr = Array.isArray(input) ? input : [];
  return arr
    .filter((s): s is Record<string, unknown> => {
      return (
        !!s &&
        typeof s === "object" &&
        typeof (s as Record<string, unknown>).id === "string" &&
        typeof (s as Record<string, unknown>).name === "string"
      );
    })
    .map((s): CategorySphere => {
      const rawElement = typeof s.element === "string" ? s.element.toLowerCase() : "water";
      const validElement: BreathingStyle =
        rawElement === "sun" ||
        rawElement === "thunder" ||
        rawElement === "beast" ||
        rawElement === "mist" ||
        rawElement === "flame"
          ? (rawElement as BreathingStyle)
          : "water";

      return {
        id: String((s as Record<string, unknown>).id),
        name: String((s as Record<string, unknown>).name).trim() || "Unnamed",
        emoji: String((s as Record<string, unknown>).emoji || "🏷️"),
        element: validElement,
        auraColor: String((s as Record<string, unknown>).auraColor || BREATHING_AURAS[validElement]),
        monthlyQuotaGold:
          typeof s.monthlyQuotaGold === "number" && !isNaN(s.monthlyQuotaGold)
            ? s.monthlyQuotaGold
            : undefined,
      };
    });
}