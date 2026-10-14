"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { useHunterSystem } from "../../lib/hunterContext";
import { signOutUser } from "../../lib/auth";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";

interface StatusLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

export function StatusLayout({ children }: StatusLayoutProps) {
  const pathname = usePathname();
  const { user, vitals, animeAccents } = useHunterSystem();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
    } catch (err) {
      console.error("[StatusLayout] Sign out error:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Close mobile drawer on route change or Escape key
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navItems = [
    {
      id: "status",
      label: "Overview",
      animeLabel: "Overview",
      path: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: "quests",
      label: "Transactions",
      animeLabel: "Transactions",
      path: "/quests/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      id: "mana",
      label: "Budgets",
      animeLabel: "Budgets",
      path: "/mana/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
          />
        </svg>
      ),
    },
    {
      id: "bounties",
      label: "Savings Goals",
      animeLabel: "Savings Goals",
      path: "/bounties/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      id: "pacts",
      label: "Recurring Bills",
      animeLabel: "Recurring Bills",
      path: "/pacts/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
    },
    {
      id: "elements",
      label: "Categories",
      animeLabel: "Categories",
      path: "/elements/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
    {
      id: "archives",
      label: "Settings",
      animeLabel: "Settings",
      path: "/archives/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const userName = vitals?.hunterName || user?.displayName || user?.email || "Account";
  const initials = userName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PP";

  return (
    <div className="min-h-screen bg-surface-base dark:bg-[#0b0f17] text-text-primary dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 min-h-screen sticky top-0 h-screen z-30 select-none">
        {/* Brand Header with Refined Tile and Theme Switcher */}
        <div className="h-[68px] flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Paisa Pulse Refined Logo Tile */}
            <div className="w-9 h-9 rounded-2xl bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-800/40 flex items-center justify-center text-sm shadow-sm shrink-0">
              {animeAccents ? (
                <span className="text-base select-none leading-none">🍡</span>
              ) : (
                <svg
                  className="w-5 h-5 text-violet-600 dark:text-violet-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                    d="M3 12h3.5l2.5-6 4 12 3-7h5"
                  />
                </svg>
              )}
            </div>

            {/* Brand Title & Meaningful Subtitle */}
            <div className="min-w-0">
              <span className="font-bold text-[15px] tracking-tight text-slate-900 dark:text-white block leading-tight">
                Paisa Pulse
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block leading-none mt-1">
                Personal Finance
              </span>
            </div>
          </div>

          {/* Compact Theme Dropdown */}
          <ThemeSwitcher align="right" />
        </div>

        {/* Navigation Items (Pale Lavender Pill on Active Only) */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const normalizedCurrent = (pathname || "/").replace(/\/$/, "");
            const normalizedItem = item.path.replace(/\/$/, "");
            const isActive =
              item.path === "/"
                ? normalizedCurrent === ""
                : normalizedCurrent.startsWith(normalizedItem);
            const displayLabel = animeAccents ? item.animeLabel : item.label;

            return (
              <Link
                key={item.id}
                href={item.path}
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-150 group active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
                  isActive
                    ? "bg-[#f2effd] dark:bg-violet-950/50 text-[#5e4db2] dark:text-violet-200 font-semibold shadow-[0_1px_2px_rgba(94,77,178,0.06)]"
                    : "bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/80 dark:hover:bg-slate-800/50 font-medium"
                )}
              >
                <span
                  className={cn(
                    "w-5 h-5 flex items-center justify-center transition-colors shrink-0",
                    isActive
                      ? "text-[#6e56cf] dark:text-violet-300"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  )}
                >
                  {item.icon}
                </span>
                <span className="truncate">{displayLabel}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer (Clean Avatar, Account Name, Storage Status) */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
          <Link
            href="/archives/"
            prefetch={true}
            title="Open Account Settings & Preferences"
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-150 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                suppressHydrationWarning
                className="w-9 h-9 rounded-full bg-violet-50 dark:bg-slate-800 border border-violet-100 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-violet-700 dark:text-violet-300 shrink-0 shadow-sm"
              >
                {vitals?.avatarUrl ? (
                  <img
                    src={vitals.avatarUrl}
                    alt={userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p
                  suppressHydrationWarning
                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors"
                >
                  {userName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      user ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
                    )}
                  />
                  <span
                    suppressHydrationWarning
                    className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-normal"
                  >
                    {user ? "Cloud Synced" : "Disconnecting..."}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-1 rounded-lg text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Desktop Direct Sign Out Action */}
          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/30 transition-colors border border-transparent hover:border-rose-200/80 dark:hover:border-rose-900/40"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── MOBILE HEADER ───────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-800/40 flex items-center justify-center text-xs shadow-sm">
              {animeAccents ? "🍡" : "⚡"}
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
              Paisa Pulse
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <ThemeSwitcher align="right" />

          {/* User profile avatar link */}
          <Link
            href="/archives/"
            suppressHydrationWarning
            className="w-8 h-8 rounded-full bg-violet-50 dark:bg-slate-800 border border-violet-100 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-violet-700 dark:text-violet-300 shadow-sm"
            title="Open Account Settings"
          >
            {initials}
          </Link>
        </div>
      </header>

      {/* ── MOBILE DRAWER NAVIGATION ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-full flex flex-col z-10 shadow-modal animate-in slide-in-from-left duration-200">
            {/* Drawer Brand Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-800/40 flex items-center justify-center text-xs shadow-sm shrink-0">
                  {animeAccents ? "🍡" : "⚡"}
                </div>
                <div>
                  <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">
                    Paisa Pulse
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block leading-none mt-0.5">
                    Personal Finance
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
                aria-label="Close Navigation"
              >
                ✕
              </button>
            </div>

            {/* Drawer Nav Items */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const normalizedCurrent = (pathname || "/").replace(/\/$/, "");
                const normalizedItem = item.path.replace(/\/$/, "");
                const isActive =
                  item.path === "/"
                    ? normalizedCurrent === ""
                    : normalizedCurrent.startsWith(normalizedItem);
                const displayLabel = animeAccents ? item.animeLabel : item.label;

                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-150 group select-none",
                      isActive
                        ? "bg-[#f2effd] dark:bg-violet-950/50 text-[#5e4db2] dark:text-violet-200 font-semibold shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/80 dark:hover:bg-slate-800/50 font-medium"
                    )}
                  >
                    <span
                      className={cn(
                        "w-5 h-5 flex items-center justify-center transition-colors",
                        isActive
                          ? "text-[#6e56cf] dark:text-violet-300"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{displayLabel}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Profile Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
              <Link
                href="/archives/"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-slate-800 border border-violet-100 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-violet-700 dark:text-violet-300 shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-violet-700 dark:group-hover:text-violet-300">
                      {userName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          user ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
                        )}
                      />
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {user ? "Cloud Synced" : "Disconnecting..."}
                      </span>
                    </div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Mobile Direct Sign Out Action */}
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  disabled={isSigningOut}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/30 transition-colors border border-transparent hover:border-rose-200/80 dark:hover:border-rose-900/40"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ──────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
