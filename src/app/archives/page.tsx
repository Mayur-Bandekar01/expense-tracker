"use client";

import React, { useState, useRef } from "react";
import { signOutUser } from "../../lib/auth";
import { exportToCSV, parseCSVTransactions } from "../../lib/export";
import { parseSMS, ParsedSMSResult } from "../../lib/smsParser";
import { useHunterSystem } from "../../lib/hunterContext";
import { getTodayLocalDate } from "../../lib/dateUtils";
import { useTheme } from "../../lib/themeContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";

export default function HunterArchivesPage() {
  const {
    user,
    transactions,
    audioEnabled,
    toggleAudio,
    animeAccents,
    toggleAnimeAccents,
    resetToDemoData,
    addTransaction,
  } = useHunterSystem();

  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [authLoading, setAuthLoading] = useState(false);
  const [smsInput, setSmsInput] = useState("");
  const [parsedBatch, setParsedBatch] = useState<ParsedSMSResult[]>([]);
  const [smsResult, setSmsResult] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [importingCSV, setImportingCSV] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      alert("No transaction records to export.");
      return;
    }
    exportToCSV(transactions);
    setExportNotice(`Exported ${transactions.length} records successfully to CSV!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleImportCSVFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingCSV(true);
    try {
      const text = await file.text();
      const parsedRows = parseCSVTransactions(text);
      if (parsedRows.length === 0) {
        alert("No valid transactions found in the selected CSV file.");
        return;
      }

      for (const item of parsedRows) {
        await addTransaction(item);
      }

      setExportNotice(`Restored ${parsedRows.length} transactions from CSV backup!`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err) {
      console.error("CSV import error:", err);
      alert("Failed to read CSV file. Please ensure it matches the Paisa Pulse export format.");
    } finally {
      setImportingCSV(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDecodeSMS = () => {
    if (!smsInput.trim()) return;

    // Split by lines to support both single SMS and multi-line batch SMS pasting
    const lines = smsInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length >= 8);

    const batch: ParsedSMSResult[] = [];
    for (const line of lines) {
      const p = parseSMS(line);
      if (p) batch.push(p);
    }

    if (batch.length === 0) {
      const single = parseSMS(smsInput);
      if (single) batch.push(single);
    }

    if (batch.length > 0) {
      setParsedBatch(batch);
      if (batch.length === 1) {
        const p = batch[0];
        setSmsResult(
          `✓ Extracted ₹${p.amount.toLocaleString("en-IN")} · ${p.merchant || "Merchant"} (${(
            p.type || "expense"
          ).toUpperCase()}) · Category: ${p.category || "General"}`
        );
      } else {
        const totalAmt = batch.reduce((sum, item) => sum + item.amount, 0);
        setSmsResult(
          `✓ Decoded ${batch.length} SMS messages (Total: ₹${totalAmt.toLocaleString(
            "en-IN"
          )}). Ready to import all!`
        );
      }
    } else {
      setParsedBatch([]);
      setSmsResult("✕ Unable to decode message format. Please check text.");
    }
  };

  const handleAddParsedQuest = async () => {
    if (parsedBatch.length === 0) return;
    for (const item of parsedBatch) {
      await addTransaction({
        amount: item.amount,
        type: item.type,
        category: item.category || "Dining & Food",
        note: item.merchant ? `Payment to ${item.merchant}` : "SMS Parsed Transaction",
        merchant: item.merchant || "",
        date: item.date || getTodayLocalDate(),
        time: new Date().toTimeString().slice(0, 5),
        method: "UPI",
        isRecurring: false,
      });
    }
    setAddedNotice(
      `Recorded ${parsedBatch.length} ${
        parsedBatch.length === 1 ? "transaction" : "transactions"
      } into your ledger!`
    );
    setSmsInput("");
    setParsedBatch([]);
    setSmsResult(null);
    setTimeout(() => setAddedNotice(null), 4000);
  };

  const handleResetLedger = () => {
    if (
      window.confirm(
        "Clear all records and reset to an empty ledger? This will clear locally cached and cloud records."
      )
    ) {
      resetToDemoData();
      alert("Records cleared. Ledger is now empty and ready for your real data.");
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <span>⚙️</span>
          <span>Settings & Preferences</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your cloud account, companion preferences, sound effects, and data backup.
        </p>
      </div>

      <div className="space-y-5 max-w-4xl">
        {/* 1. Account & Cloud Sync */}
        <Card
          variant="default"
          className="p-5 md:p-6 rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Cloud Synchronization
                </span>
                <Badge variant="income" size="sm" suppressHydrationWarning>
                  {user ? "Cloud Synced" : "Signing Out..."}
                </Badge>
              </div>

              <h3
                suppressHydrationWarning
                className="text-base font-semibold text-slate-900 dark:text-white"
              >
                {user ? user.displayName || user.email : "Authenticated Account"}
              </h3>
              <p
                suppressHydrationWarning
                className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed"
              >
                {user
                  ? `Authenticated as ${user.email}. Real-time multi-device cloud synchronization is active via Firebase Firestore.`
                  : "Signed in to Paisa Pulse with Google. Cloud synchronization active."}
              </p>
            </div>

            <div>
              <Button
                variant="danger"
                size="sm"
                disabled={authLoading}
                onClick={async () => {
                  setAuthLoading(true);
                  await handleSignOut();
                }}
              >
                {authLoading ? "Signing Out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </Card>

        {/* 2. Appearance & Preferences */}
        <Card
          variant="default"
          className="p-5 md:p-6 rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card"
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-4">
            Preferences & Appearance
          </span>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            {/* Companion Toggle */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Mochi Financial Companion
                  </h4>
                  <Badge
                    variant={animeAccents ? "brand" : "neutral"}
                    size="sm"
                    suppressHydrationWarning
                  >
                    {animeAccents ? "Enabled" : "Off (Minimal)"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                  When enabled, shows Mochi 🍡 the friendly companion card, progress milestones, and soft accents. When disabled, the interface stays purely minimal and clean.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={animeAccents}
                onClick={toggleAnimeAccents}
                suppressHydrationWarning
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  animeAccents ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    animeAccents ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Audio SFX Toggle */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Sound Effects
                  </h4>
                  <Badge
                    variant={audioEnabled ? "income" : "neutral"}
                    size="sm"
                    suppressHydrationWarning
                  >
                    {audioEnabled ? "Sound On" : "Muted"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                  Subtle tactile sound clicks when recording transactions, depositing savings, and confirming actions.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={audioEnabled}
                onClick={toggleAudio}
                suppressHydrationWarning
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  audioEnabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    audioEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Theme Mode Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Interface Theme
                  </h4>
                  <Badge variant="brand" size="sm" suppressHydrationWarning>
                    {theme === "system"
                      ? "System Default"
                      : theme === "dark"
                      ? "Dark Mode"
                      : "Light Mode"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                  Choose clean Light mode, obsidian Dark mode with soothing contrast, or follow your operating system automatically.
                </p>
              </div>

              <div>
                <ThemeSwitcher variant="segmented" />
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Data Export, Import & Backup */}
        <Card
          variant="default"
          className="p-5 md:p-6 rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Data Export & Backup
              </span>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                CSV Ledger Backup ({transactions.length} Records)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                Export all transactions as an Excel-compatible CSV file, or import a previously exported CSV file to restore your records.
              </p>
              {exportNotice && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 block font-medium">
                  ✓ {exportNotice}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportCSVFile}
                className="hidden"
              />

              <Button
                variant="outline"
                size="sm"
                isLoading={importingCSV}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Import CSV
              </Button>

              <Button variant="secondary" size="sm" onClick={handleExport}>
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export CSV
              </Button>

              <Button variant="ghost" size="sm" onClick={handleResetLedger}>
                Clear Local Data
              </Button>
            </div>
          </div>
        </Card>

        {/* 4. Batch SMS Terminal Utility */}
        <Card
          variant="default"
          className="p-5 md:p-6 rounded-2xl md:rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-card"
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Utilities & Tools
          </span>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Bank & UPI SMS Parser (Single or Batch)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
            Paste one or multiple SMS messages (one per line) from Indian banks (HDFC, SBI, ICICI, Axis, Paytm, PhonePe, Google Pay) to extract and log them at once.
          </p>

          <div className="space-y-3">
            <textarea
              rows={4}
              placeholder={
                "Paste one or more SMS messages (one per line):\nPaid Rs. 450.00 to Swiggy using UPI on 15-10-2026\nRs. 1,200.00 debited from A/c towards Amazon on 15-10-2026"
              }
              value={smsInput}
              onChange={(e) => setSmsInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all resize-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <Button variant="secondary" size="sm" onClick={handleDecodeSMS}>
                  Parse Message(s)
                </Button>
                {parsedBatch.length > 0 && (
                  <Button variant="primary" size="sm" onClick={handleAddParsedQuest}>
                    {parsedBatch.length === 1
                      ? "Add as Transaction"
                      : `Import All (${parsedBatch.length})`}
                  </Button>
                )}
              </div>

              {addedNotice && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ {addedNotice}
                </span>
              )}
            </div>

            {smsResult && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300">
                {smsResult}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
