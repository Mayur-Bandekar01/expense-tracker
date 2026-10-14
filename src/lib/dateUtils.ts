/**
 * Indian & Local Calendar Date Utilities
 * Ensures dates never get shifted to previous day by UTC conversion.
 */

/**
 * Returns today's date in local calendar YYYY-MM-DD format
 */
export function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns current month-year in YYYY-MM format
 */
export function getCurrentLocalMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Format a YYYY-MM-DD string or Date into human-readable date
 * e.g. "12 Oct, 2026"
 */
export function formatDisplayDate(dateStr?: string | Date): string {
  if (!dateStr) return "";
  try {
    const d =
      typeof dateStr === "string"
        ? dateStr.includes("T")
          ? new Date(dateStr)
          : new Date(dateStr + "T00:00:00")
        : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch (_e) {
    return String(dateStr);
  }
}

/**
 * Format a relative time description (e.g. "Today", "Yesterday", or "12 Oct")
 */
export function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return "";
  const today = getTodayLocalDate();
  if (dateStr === today) return "Today";

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, "0")}-${String(yesterdayDate.getDate()).padStart(2, "0")}`;
  if (dateStr === yesterdayStr) return "Yesterday";

  return formatDisplayDate(dateStr);
}
