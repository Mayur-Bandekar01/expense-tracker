"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, ThemeMode } from "../../lib/themeContext";
import { cn } from "../../lib/utils";

// Sun Icon for Light Mode
export function SunIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

// Moon Icon for Dark Mode
export function MoonIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

// Computer / Monitor Icon for System Default
export function SystemIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

// Checkmark Icon for Selected Option
function CheckIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  );
}

interface ThemeSwitcherProps {
  className?: string;
  variant?: "button" | "segmented";
  align?: "left" | "right";
  showLabel?: boolean;
}

export function ThemeSwitcher({
  className,
  variant = "button",
  align = "right",
  showLabel = false,
}: ThemeSwitcherProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: "light",
      label: "Light Mode",
      icon: <SunIcon className="w-4 h-4 text-amber-500" />,
      desc: "Clean white & lavender accents",
    },
    {
      id: "dark",
      label: "Dark Mode",
      icon: <MoonIcon className="w-4 h-4 text-indigo-400" />,
      desc: "Elegant obsidian & comfortable contrast",
    },
    {
      id: "system",
      label: "System Default",
      icon: <SystemIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
      desc: "Automatically follows your OS theme",
    },
  ];

  // Current display icon based on user selection or resolved state
  const getCurrentIcon = () => {
    if (!mounted || theme === "system") {
      return <SystemIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
    }
    if (theme === "dark") {
      return <MoonIcon className="w-4 h-4 text-indigo-400" />;
    }
    return <SunIcon className="w-4 h-4 text-amber-500" />;
  };

  const getCurrentLabel = () => {
    if (!mounted || theme === "system") return "System";
    if (theme === "dark") return "Dark";
    return "Light";
  };

  // ── Segmented Control Variant (For Settings page) ─────────────────────────
  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl w-full sm:w-auto",
          className
        )}
        role="radiogroup"
        aria-label="Theme mode"
      >
        {themeOptions.map((opt) => {
          const isSelected = mounted ? theme === opt.id : opt.id === "system";
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              suppressHydrationWarning
              onClick={() => setTheme(opt.id)}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 select-none",
                isSelected
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-subtle border border-slate-200/60 dark:border-slate-700/80"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800"
              )}
            >
              <span>{opt.icon}</span>
              <span>{opt.label.replace(" Mode", "")}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Popover / Dropdown Variant (For Header & Navigation) ───────────────────
  return (
    <div className={cn("relative inline-block text-left", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={mounted ? `Theme: currently ${theme}. Click to change theme.` : "Theme mode selection"}
        suppressHydrationWarning
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium border transition-all duration-150 select-none",
          "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80",
          "border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 shadow-subtle",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        )}
      >
        <span className="flex items-center justify-center">{getCurrentIcon()}</span>
        {showLabel && <span className="font-medium hidden sm:inline">{getCurrentLabel()}</span>}
        <svg
          className={cn("w-3 h-3 text-slate-400 transition-transform duration-150", isOpen && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Dropdown Popover */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            "absolute z-50 mt-2 w-56 rounded-2xl p-1.5 shadow-modal border animate-in fade-in zoom-in-95 duration-150",
            "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Appearance Theme
            </span>
          </div>

          <div className="space-y-1">
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 group",
                    isSelected
                      ? "bg-brand-50/80 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200/60 dark:border-brand-800/50"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                        isSelected
                          ? "bg-white dark:bg-slate-900 border-brand-200 dark:border-brand-800 shadow-subtle"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200/70 dark:border-slate-700/60"
                      )}
                    >
                      {opt.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs truncate leading-tight">{opt.label}</span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate mt-0.5">
                        {opt.desc}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-brand-600 dark:text-brand-400 ml-2 shrink-0">
                      <CheckIcon />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Status indicator footer */}
          <div className="mt-1 pt-2 px-3 pb-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span>Active: {resolvedTheme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            {theme === "system" && <span className="font-mono text-indigo-500">OS Sync</span>}
          </div>
        </div>
      )}
    </div>
  );
}
