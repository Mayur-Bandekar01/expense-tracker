"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useHunterSystem } from "../../lib/hunterContext";
import { signInWithGoogle, formatAuthError } from "../../lib/auth";
import { useTheme } from "../../lib/themeContext";
import { LoginIllustration } from "./LoginIllustration";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, authLoaded } = useHunterSystem();
  const { theme, setTheme } = useTheme();
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | "security" | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Ensure unauthenticated users are on root login page url
  useEffect(() => {
    if (authLoaded && !user && pathname && pathname !== "/") {
      router.replace("/");
    }
  }, [authLoaded, user, pathname, router]);

  const handleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("[AuthGate] Sign in error:", err);
      const friendlyMessage = formatAuthError(err);
      setAuthError(friendlyMessage);
    } finally {
      setSigningIn(false);
    }
  };

  // 1. Loading State: Resolving initial session from Firebase Auth
  if (!authLoaded) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] dark:bg-[#0b0f17] text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4 transition-colors duration-200">
        <div className="flex flex-col items-center gap-4 animate-pulse select-none">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4338CA] to-[#6366F1] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3.5l2.5-6 4 12 3-7h5" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Paisa Pulse
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              Securing session & cloud sync...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Signed-Out State: Compact, Scroll-Free Split-Card Login Screen
  if (!user) {
    return (
      <div className="h-screen max-h-screen w-full bg-[#F4F6FB] dark:bg-[#0b0f17] text-slate-800 dark:text-slate-100 flex flex-col justify-between overflow-y-auto lg:overflow-hidden transition-colors duration-200 select-none">
        {/* ── Top Header Navigation Bar ───────────────────────────────── */}
        <header className="w-full max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3 shrink-0">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4338CA] to-[#6366F1] flex items-center justify-center shadow-sm shrink-0">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3.5l2.5-6 4 12 3-7h5" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">
                Paisa Pulse
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight font-normal">
                Your money, clearly in view
              </span>
            </div>
          </div>

          {/* Right Controls: Theme Switcher + Profile Avatar */}
          <div className="flex items-center gap-2.5">
            <div
              className="inline-flex items-center p-0.5 bg-white/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-full shadow-subtle"
              role="radiogroup"
              aria-label="Theme selection"
            >
              <button
                type="button"
                role="radio"
                aria-checked={theme === "light"}
                title="Light Mode"
                onClick={() => setTheme("light")}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  theme === "light"
                    ? "bg-slate-100 dark:bg-slate-700 text-amber-500 shadow-xs"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={theme === "dark"}
                title="Dark Mode"
                onClick={() => setTheme("dark")}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  theme === "dark"
                    ? "bg-slate-100 dark:bg-slate-700 text-indigo-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={theme === "system"}
                title="System Default"
                onClick={() => setTheme("system")}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  theme === "system"
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>

            <div
              className="w-8 h-8 rounded-full bg-[#3730A3] dark:bg-indigo-600 flex items-center justify-center text-white shadow-xs"
              title="Secure Account"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
        </header>

        {/* ── Main Login Central Card ─────────────────────────────────── */}
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-auto py-2 shrink">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_16px_50px_-12px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.4)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
            {/* ── LEFT COLUMN: Illustration & Overview ─────────────────── */}
            <div className="lg:col-span-5 bg-gradient-to-b from-[#EEF2FC] via-[#EEF2FC] to-[#E3EBFA] dark:from-slate-900/95 dark:via-indigo-950/30 dark:to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                {/* Top Pill Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-indigo-100/90 dark:border-indigo-900/50 shadow-subtle mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span className="text-[11px] font-semibold text-blue-900 dark:text-blue-200 tracking-wide">
                    Zero setup • Real-time clarity
                  </span>
                </div>

                {/* Illustration Asset - Scaled Compactly */}
                <div className="my-1 flex justify-center">
                  <LoginIllustration className="w-full max-w-[240px] sm:max-w-[270px]" />
                </div>

                {/* Headline & Subtitle */}
                <div className="mt-2 text-center sm:text-left">
                  <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                    A clearer view of your money starts here.
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Effortless tracking, thoughtful budgeting, and zero mental friction.
                  </p>
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-4 mt-3 border-t border-indigo-100/70 dark:border-slate-800/70 font-medium">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="3" />
                    <line x1="7" y1="9" x2="11" y2="9" />
                    <line x1="7" y1="13" x2="17" y2="13" />
                  </svg>
                  <span>Self-directed privacy</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Sync ready</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Sign-in Action ─────────────────────────── */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
              <div>
                {/* Meta Row: Badge & Step Indicator */}
                <div className="flex items-center justify-between mb-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Secure 256-bit Portal</span>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    Step 1 of 1
                  </span>
                </div>

                {/* Main Heading & Description */}
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Welcome to Paisa Pulse
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-md">
                    Sign in to manage your expenses, track your budgets, and keep your financial goals
                    organized in one calm dashboard.
                  </p>
                </div>

                {/* Error Banner (Visible only when actual error occurs) */}
                {authError && (
                  <div
                    role="alert"
                    className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
                  >
                    <svg
                      className="w-4 h-4 text-rose-500 shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div className="flex-1 leading-relaxed">
                      <p className="font-semibold uppercase tracking-wider text-[10px] text-rose-600 dark:text-rose-400">
                        Sign In Failed
                      </p>
                      <p className="mt-0.5">{authError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAuthError(null)}
                      className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 transition-colors p-0.5"
                      aria-label="Dismiss error"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Google Sign In Action Button */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={signingIn}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50/90 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-sm shadow-subtle hover:shadow-card active:scale-[0.99] transition-all duration-150 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    {signingIn ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-indigo-600 dark:text-indigo-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Connecting with Google...</span>
                      </>
                    ) : (
                      <>
                        {/* Official Multi-Color Google G SVG */}
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Your financial information stays private to your account.</span>
                  </div>
                </div>
              </div>

              {/* Subtle Status Notice */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center sm:text-left">
                Direct OAuth 2.0 connection · Zero password storage
              </div>
            </div>
          </div>

          {/* ── Feature Highlights Row Below Card ──────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-4 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Zero third-party data tracking</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
              <span>Instant cloud backup</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Customizable budget caps</span>
            </div>
          </div>
        </main>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 py-2.5 px-4 sm:px-8 shrink-0">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            {/* Left Bank-grade Security Note */}
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Bank-grade 256-bit encryption</span>
            </div>

            {/* Center Policy Links */}
            <div className="flex items-center gap-4 font-medium">
              <button
                type="button"
                onClick={() => setActiveModal("privacy")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("terms")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("security")}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Security
              </button>
            </div>

            {/* Right Copyright */}
            <div>
              &copy; 2025 Paisa Pulse Technologies. All rights reserved.
            </div>
          </div>
        </footer>

        {/* ── Information Modals (Privacy, Terms, Security) ──────────── */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {activeModal === "privacy" && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy</h3>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    <p>
                      <strong>Your privacy is self-directed.</strong> Paisa Pulse stores your financial transactions,
                      budgets, and goals strictly under your authenticated Google account ID.
                    </p>
                    <p>
                      We never sell, distribute, or mine your personal financial ledger. You have total authority to
                      export or purge your records at any time.
                    </p>
                    <p>
                      All network traffic is encrypted over TLS 1.3 with AES-256 bit data-at-rest protection.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === "terms" && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Terms of Service</h3>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    <p>
                      Paisa Pulse is designed to help you track expenses, plan savings goals, and understand personal
                      spending habits.
                    </p>
                    <p>
                      The application does not constitute professional investment or tax advice. By using Paisa Pulse,
                      you agree to maintain the security of your Google account credentials.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === "security" && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Security Architecture</h3>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    <p>
                      <strong>Bank-Grade 256-Bit Protection:</strong> All database documents in Google Cloud Firestore
                      are restricted by authenticated rule policies that enforce strict user-isolation.
                    </p>
                    <p>
                      No user can read, query, or mutate documents outside of their authenticated UID matching rules.
                    </p>
                    <p>
                      OAuth 2.0 authentication tokens are securely handled by Google Identity Services.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Authenticated State: User is verified, render protected application
  return <>{children}</>;
}
