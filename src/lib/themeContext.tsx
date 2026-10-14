"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "paisa_pulse_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Helper to determine the system's preferred theme
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  // Helper to apply class and meta tags to the DOM
  const applyThemeToDOM = useCallback((mode: ThemeMode) => {
    if (typeof window === "undefined") return "light";

    const resolved: ResolvedTheme = mode === "system" ? getSystemTheme() : mode;
    const root = document.documentElement;

    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Update browser theme-color meta tag for seamless mobile integration
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", resolved === "dark" ? "#0b0f17" : "#f8fafc");
    }

    setResolvedTheme(resolved);
    return resolved;
  }, []);

  // Initialize theme from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      const initialMode: ThemeMode =
        stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
      setThemeState(initialMode);
      applyThemeToDOM(initialMode);
    } catch {
      applyThemeToDOM("system");
    }
    setMounted(true);
  }, [applyThemeToDOM]);

  // Listen to OS system color-scheme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // Only react if user preference is system
      const currentStored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (!currentStored || currentStored === "system") {
        applyThemeToDOM("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyThemeToDOM]);

  // Set theme with persistence
  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch (e) {
        console.warn("Unable to persist theme preference to localStorage", e);
      }
      applyThemeToDOM(newTheme);
    },
    [applyThemeToDOM]
  );

  // Toggle between light and dark (or dark and light)
  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
