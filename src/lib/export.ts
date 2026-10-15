import { Transaction } from "../types/hunter";
import { getTodayLocalDate } from "./dateUtils";

function escapeCSVField(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Trigger an Excel-compatible CSV download with UTF-8 BOM
 */
export function exportToCSV(transactions: Transaction[]): void {
  if (!transactions || transactions.length === 0) {
    return;
  }

  const headers = [
    "Date",
    "Type",
    "Category",
    "Amount (INR)",
    "Merchant / Payee",
    "Note / Description",
    "Payment Method",
    "Recurring",
  ];

  const rows = [...transactions]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .map((tx) => [
      tx.date || "",
      tx.type === "income" ? "Income" : "Expense",
      tx.category || "",
      (tx.amount || 0).toFixed(2),
      tx.merchant || "",
      tx.note || "",
      tx.method || "",
      tx.isRecurring ? "Yes" : "No",
    ]);

  const lines = [headers, ...rows].map((row) => row.map(escapeCSVField).join(","));
  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const name = `paisa-pulse-transactions-${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.csv`;

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", name);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Parse a single CSV line respecting quoted fields
 */
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parse an exported CSV file back into Transaction objects
 */
export function parseCSVTransactions(csvText: string): Partial<Transaction>[] {
  if (!csvText || !csvText.trim()) return [];

  const cleanText = csvText.replace(/^\uFEFF/, "").trim();
  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const results: Partial<Transaction>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (cols.length < 4) continue;

    const [rawDate, rawType, rawCategory, rawAmount, rawMerchant, rawNote, rawMethod, rawRecurring] =
      cols;

    const amount = parseFloat((rawAmount || "").replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) continue;

    const type: "income" | "expense" =
      (rawType || "").toLowerCase().includes("income") ? "income" : "expense";

    results.push({
      date: rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : getTodayLocalDate(),
      type,
      category: rawCategory || "Miscellaneous",
      amount,
      merchant: rawMerchant || "",
      note: rawNote || rawMerchant || (type === "income" ? "Income Deposit" : "Expense"),
      method: rawMethod || "UPI",
      isRecurring: (rawRecurring || "").toLowerCase() === "yes",
    });
  }

  return results;
}
