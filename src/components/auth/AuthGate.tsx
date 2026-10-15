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

  useEffect(() => {
    if (authLoaded && !user && pathname && pathname !== "/") {
      router.replace("/");
    }
  }, [authLoaded, user, pathname, router]);

  const handleSignIn = async (forceRedirect = false) => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle(forceRedirect);
    } catch (err: any) {
      console.error("[AuthGate] Sign in error:", err);
      setAuthError(formatAuthError(err));
    } finally {
      setSigningIn(false);
    }
  };

  // 1. Loading State
  if (!authLoaded) {
    return (
      <div className="min-h-[100dvh] bg-[#F4F6FB] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4 transition-colors duration-200">
        <div className="flex flex-col items-center gap-4 animate-pulse select-none">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-700 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_0_#312e81,0_10px_20px_rgba(79,70,229,0.3)]">
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

  // 2. Signed-Out State: 3D Tactile Responsive Portal (Mobile + Desktop)
  if (!user) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#F4F6FB] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden transition-colors duration-200 select-none">
        {/* Top Header Navigation Bar */}
        <header className="w-full max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_0_#312e81,0_4px_10px_rgba(79,70,229,0.25)] shrink-0">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3.5l2.5-6 4 12 3-7h5" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">
                Paisa Pulse
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight">
                Your money, clearly in view
              </span>
            </div>
          </div>

          {/* Theme Switcher Pill */}
          <div
            className="inline-flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-full shadow-[inset_0_1px_0_#fff,0_2px_5px_rgba(15,23,42,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            role="radiogroup"
            aria-label="Theme selection"
          >
            <button
              type="button"
              role="radio"
              aria-checked={theme === "light"}
              title="Light Mode"
              onClick={() => setTheme("light")}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                theme === "light"
                  ? "bg-amber-50 dark:bg-slate-800 text-amber-500 shadow-xs"
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
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                theme === "dark"
                  ? "bg-indigo-950/80 text-indigo-400 shadow-xs"
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
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                theme === "system"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs"
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
        </header>

        {/* Main 3D Split Card Container */}
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-auto py-3">
          <div className="card-3d overflow-hidden grid grid-cols-1 lg:grid-cols-12 rounded-3xl">
            {/* RIGHT COLUMN ON DESKTOP / TOP ON MOBILE: Sign-in Action Portal */}
            <div className="order-1 lg:order-2 lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/50 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>256-Bit Cloud Sync</span>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Mobile & Desktop Ready
                  </span>
                </div>

                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Welcome to Paisa Pulse
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-md">
                    Sign in with Google to track expenses, decode bank SMS alerts, and sync your
                    monthly budgets across your phone and laptop.
                  </p>
                </div>

                {/* Error Alert Banner */}
                {authError && (
                  <div
                    role="alert"
                    className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5"
                  >
                    <span className="text-sm shrink-0">⚠️</span>
                    <div className="flex-1 leading-relaxed">
                      <p className="font-bold text-rose-700 dark:text-rose-300">
                        Authentication Notice
                      </p>
                      <p className="mt-0.5">{authError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAuthError(null)}
                      className="text-rose-400 hover:text-rose-600 p-0.5"
                      aria-label="Dismiss error"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* 3D Tactile Google Sign-In Button */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSignIn(false)}
                    disabled={signingIn}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-sm border border-indigo-700/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_3px_0_#312e81,0_8px_20px_-4px_rgba(79,70,229,0.45)] active:translate-y-[2px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_0_#312e81] transition-all duration-150 disabled:opacity-70 cursor-pointer"
                  >
                    {signingIn ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
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
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-xs shrink-0">
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                        </span>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>

                  {/* Mobile In-App Browser Redirect Fallback Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Private, self-directed ledger</span>
                    <button
                      type="button"
                      onClick={() => handleSignIn(true)}
                      disabled={signingIn}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Popup blocked on mobile? Use Redirect Sign-In →
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick 3D Feature Mini-Pills */}
              <div className="grid grid-cols-3 gap-2 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-sm block">💬</span>
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                    SMS Parser
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-sm block">📊</span>
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                    Smart Budgets
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-sm block">☁️</span>
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                    Instant Sync
                  </span>
                </div>
              </div>
            </div>

            {/* LEFT COLUMN ON DESKTOP / BOTTOM ON MOBILE: 3D Vault Card Showcase */}
            <div className="order-2 lg:order-1 lg:col-span-5 bg-gradient-to-b from-[#EEF2FC] via-[#E8EEFB] to-[#DCE5F9] dark:from-slate-900 dark:via-indigo-950/35 dark:to-slate-900 border-t lg:border-t-0 lg:border-r border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 border border-indigo-100 dark:border-indigo-900/50 shadow-xs mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  <span className="text-[11px] font-semibold text-indigo-950 dark:text-indigo-200">
                    Interactive 3D Telemetry
                  </span>
                </div>

                {/* 3D Tilted Vault Card Showcase */}
                <div className="my-2 flex justify-center">
                  <LoginIllustration className="w-full" />
                </div>

                <div className="mt-2 text-center lg:text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                    A clearer view of your money starts here.
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Effortless tracking, thoughtful budgeting, and zero mental friction across all
                    your devices.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-4 mt-4 border-t border-indigo-200/60 dark:border-slate-800 font-medium">
                <span>Self-directed privacy</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  OAuth 2.0 Verified
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 py-3 px-4 sm:px-8 shrink-0">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>🛡️ Bank-grade 256-bit user isolation</span>
            </div>

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

            <div>&copy; 2026 Paisa Pulse. All rights reserved.</div>
          </div>
        </footer>

        {/* Policy Modals */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="card-3d bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Close"
              >
                ✕
              </button>

              {activeModal === "privacy" && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Privacy Policy
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-3">
                    <p>
                      <strong>Your privacy is self-directed.</strong> Paisa Pulse stores your
                      financial transactions, budgets, and goals strictly under your authenticated
                      Google account UID.
                    </p>
                    <p>
                      We never sell, distribute, or mine your personal financial ledger. You can
                      export or wipe your records at any time.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === "terms" && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Terms of Service
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-3">
                    <p>
                      Paisa Pulse is a personal finance companion designed to help you organize
                      expenses, budgets, and savings goals.
                    </p>
                  </div>
                </div>
              )}

              {activeModal === "security" && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Security Architecture
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-3">
                    <p>
                      All database documents in Google Cloud Firestore are restricted by
                      authenticated security rules enforcing strict UID isolation.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold"
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

  return <>{children}</>;
}
