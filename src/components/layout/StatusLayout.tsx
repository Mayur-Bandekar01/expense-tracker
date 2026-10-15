"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, formatCompactINR } from "../../lib/utils";
import { useHunterSystem } from "../../lib/hunterContext";
import { signOutUser } from "../../lib/auth";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";

interface StatusLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  badge?: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function StatusLayout({ children }: StatusLayoutProps) {
  const pathname = usePathname();
  const { user, vitals, animeAccents, pacts } = useHunterSystem();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const activePactsCount = (pacts || []).filter((p) => p && p.isActive).length;

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

  const navSections: NavSection[] = [
    {
      title: "Workspace",
      items: [
        {
          id: "status",
          label: "Overview",
          path: "/",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          ),
        },
        {
          id: "quests",
          label: "Transactions",
          path: "/quests/",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Planning & Vaults",
      items: [
        {
          id: "mana",
          label: "Budgets",
          path: "/mana/",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          ),
        },
        {
          id: "bounties",
          label: "Savings Goals",
          path: "/bounties/",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          ),
        },
        {
          id: "pacts",
          label: "Recurring Bills",
          path: "/pacts/",
          badge: activePactsCount > 0 ? String(activePactsCount) : undefined,
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          id: "elements",
          label: "Categories",
          path: "/elements/",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          ),
        },
        {
          id: "archives",
          label: "Settings",
          path: "/archives/",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
      ],
    },
  ];

  const userName = vitals?.hunterName || user?.displayName || user?.email || "Account";
  const initials =
    userName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PP";

  const isRouteActive = (itemPath: string) => {
    const normalizedCurrent = (pathname || "/").replace(/\/$/, "");
    const normalizedItem = itemPath.replace(/\/$/, "");
    return itemPath === "/"
      ? normalizedCurrent === ""
      : normalizedCurrent.startsWith(normalizedItem);
  };

  const renderNavSections = (onItemClick?: () => void) => (
    <div className="space-y-5">
      {navSections.map((section) => (
        <div key={section.title} className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
            {section.title}
          </span>
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = isRouteActive(item.path);
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  prefetch={true}
                  onClick={onItemClick}
                  className={cn(
                    "relative flex items-center justify-between px-2.5 py-2 rounded-2xl text-[13px] transition-all duration-150 group select-none active:scale-[0.99]",
                    isActive
                      ? "bg-gradient-to-b from-white via-indigo-50/60 to-indigo-100/50 dark:from-indigo-950/80 dark:to-slate-900 text-indigo-950 dark:text-white font-semibold border border-indigo-200/80 dark:border-indigo-800/70 shadow-[inset_0_1px_0_#ffffff,0_3px_10px_-2px_rgba(79,70,229,0.12),0_1px_0_rgba(79,70,229,0.1)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.4)]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50 font-medium border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* 3D Tactile Icon Box */}
                    <span
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150",
                        isActive
                          ? "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_0_#312e81,0_4px_8px_rgba(79,70,229,0.25)]"
                          : "bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700/70 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-200 dark:group-hover:border-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-none"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {/* Right Active Indicator or Count Badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md",
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mr-1 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-base dark:bg-[#090d16] text-text-primary dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      {/* ── DESKTOP 3D TACTILE SIDEBAR ───────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-[272px] shrink-0 bg-gradient-to-b from-white via-white to-slate-50/90 dark:from-[#111726] dark:via-[#0f1522] dark:to-[#0b0f19] border-r border-slate-200/80 dark:border-slate-800/90 min-h-screen sticky top-0 h-screen z-30 select-none shadow-[4px_0_24px_-12px_rgba(15,23,42,0.06)] dark:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]">
        {/* 1. 3D Brand Header */}
        <div className="h-[72px] flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 min-w-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-700 border border-indigo-400/30 flex items-center justify-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#312e81,0_6px_12px_-2px_rgba(79,70,229,0.35)] shrink-0 transition-transform duration-150 group-hover:scale-105">
              {animeAccents ? (
                <span className="text-base leading-none">🍡</span>
              ) : (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.3"
                    d="M3 12h3.5l2.5-6 4 12 3-7h5"
                  />
                </svg>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[15px] tracking-tight text-slate-900 dark:text-white truncate">
                  Paisa Pulse
                </span>
                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  PRO
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block leading-none mt-1">
                Personal Finance Vault
              </span>
            </div>
          </Link>

          <ThemeSwitcher align="right" />
        </div>

        {/* 2. Categorized Navigation Links */}
        <nav className="flex-1 px-3.5 py-4 overflow-y-auto">
          {renderNavSections()}
        </nav>

        {/* 3. Recessed 3D Net Balance & Mochi Telemetry Card */}
        <div className="px-3.5 pb-2">
          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Net Balance</span>
              {animeAccents && (
                <span suppressHydrationWarning className="text-indigo-600 dark:text-indigo-400 font-mono">
                  Lv.{vitals.level} · {vitals.rank}
                </span>
              )}
            </div>
            <div
              suppressHydrationWarning
              className={cn(
                "text-base font-extrabold font-numbers tracking-tight mt-0.5",
                vitals.netGold >= 0
                  ? "text-slate-900 dark:text-white"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatCompactINR(vitals.netGold)}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>Savings Rate</span>
              <span suppressHydrationWarning className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {vitals.vitalityRatio}%
              </span>
            </div>
          </div>
        </div>

        {/* 4. 3D Profile & Sign-Out Dock */}
        <div className="p-3.5 border-t border-slate-200/70 dark:border-slate-800/80">
          <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[inset_0_1px_0_#ffffff,0_2px_6px_rgba(15,23,42,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center justify-between gap-2">
            <Link
              href="/archives/"
              prefetch={true}
              title="Account Settings"
              className="flex items-center gap-2.5 min-w-0 flex-1 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
            >
              <div
                suppressHydrationWarning
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(79,70,229,0.25)] overflow-hidden"
              >
                {vitals?.avatarUrl ? (
                  <img
                    src={vitals.avatarUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p
                  suppressHydrationWarning
                  className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  {userName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      user ? "bg-emerald-500" : "bg-slate-400"
                    )}
                  />
                  <span
                    suppressHydrationWarning
                    className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium"
                  >
                    {user ? "Cloud Synced" : "Offline"}
                  </span>
                </div>
              </div>
            </Link>

            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-50 hover:bg-rose-50 dark:bg-slate-800/80 dark:hover:bg-rose-950/50 border border-slate-200/80 hover:border-rose-200 dark:border-slate-700 dark:hover:border-rose-800/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-none active:translate-y-[1px] transition-all shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── MOBILE HEADER ───────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-xl bg-gradient-to-b from-white to-slate-100 dark:from-slate-800 dark:to-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-[inset_0_1px_0_#fff,0_2px_0_rgba(15,23,42,0.05)] dark:shadow-none flex items-center justify-center text-slate-700 dark:text-slate-200 active:translate-y-[1px]"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_0_#312e81]">
              {animeAccents ? "🍡" : "₹"}
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
              Paisa Pulse
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher align="right" />
          <Link
            href="/archives/"
            suppressHydrationWarning
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-sm"
            title="Open Account Settings"
          >
            {initials}
          </Link>
        </div>
      </header>

      {/* ── MOBILE 3D DRAWER NAVIGATION ─────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-[#0f1522] border-r border-slate-200/80 dark:border-slate-800 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_0_#312e81]">
                  {animeAccents ? "🍡" : "₹"}
                </div>
                <div>
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">
                    Paisa Pulse
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block leading-none mt-0.5">
                    Personal Finance Vault
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
                aria-label="Close Navigation"
              >
                ✕
              </button>
            </div>

            {/* Drawer Grouped Links */}
            <nav className="flex-1 p-3.5 overflow-y-auto">
              {renderNavSections(() => setMobileMenuOpen(false))}
            </nav>

            {/* Drawer Footer Dock */}
            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Net Balance
                </span>
                <span
                  suppressHydrationWarning
                  className="text-xs font-extrabold font-numbers text-slate-900 dark:text-white"
                >
                  {formatCompactINR(vitals.netGold)}
                </span>
              </div>

              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  disabled={isSigningOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800/70 active:translate-y-[1px]"
                >
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
