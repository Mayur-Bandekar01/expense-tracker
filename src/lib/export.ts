import { Transaction } from "../types/hunter";

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
