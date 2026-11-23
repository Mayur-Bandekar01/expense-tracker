"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { isSystemAudioMuted, setSystemAudioMuted, playClickSound } from "../audio";

interface UIContextType {
  animeAccents: boolean;
  toggleAnimeAccents: () => void;
  audioMuted: boolean;
  audioEnabled: boolean;
  toggleAudio: () => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [animeAccents, setAnimeAccents] = useState<boolean>(true);
  const [audioMuted, setAudioMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAudioMuted(isSystemAudioMuted());
    if (typeof window !== "undefined") {
      try {
        const storedAnime = localStorage.getItem("paisa_pulse_anime_accents");
        if (storedAnime !== null) setAnimeAccents(storedAnime === "true");
      } catch (_e) {}
    }
    setMounted(true);
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioMuted((prev) => {
      const next = !prev;
      setSystemAudioMuted(next);
      if (!next) playClickSound();
      return next;
    });
  }, []);

  const toggleAnimeAccents = useCallback(() => {
    setAnimeAccents((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("paisa_pulse_anime_accents", next ? "true" : "false");
      }
      return next;
    });
  }, []);

  const value = useMemo<UIContextType>(
    () => ({
      animeAccents,
      toggleAnimeAccents,
      audioMuted,
      audioEnabled: !audioMuted,
      toggleAudio,
    }),
    [animeAccents, audioMuted, toggleAudio, toggleAnimeAccents]
  );

  // Always render children with the provider, but return default values during SSR
  // The mounted check is for hydration purposes, not for preventing SSR
  if (typeof window === "undefined") {
    // Return default context during SSR to prevent hydration mismatches
    return (
      <UIContext.Provider value={{
        animeAccents: true,
        toggleAnimeAccents: () => {},
        audioMuted: false,
        audioEnabled: true,
        toggleAudio: () => {},
      }}>
        {children}
      </UIContext.Provider>
    );
  }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextType {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return ctx;
}