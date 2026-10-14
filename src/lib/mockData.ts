import { Transaction, Goal, CategoryBudgetRune, CategorySphere, PerpetualPact } from "../types/hunter";

/**
 * Standard Built-In Category Presets (Preserved for categorization)
 */
export const DEFAULT_CATEGORIES: CategorySphere[] = [
  { id: "cat-1", name: "Dining & Food", emoji: "🍜", element: "sun", auraColor: "#ff6b35" },
  { id: "cat-2", name: "Salary & Income", emoji: "💼", element: "water", auraColor: "#00f2fe" },
  { id: "cat-3", name: "Transportation", emoji: "🚗", element: "thunder", auraColor: "#ffe600" },
  { id: "cat-4", name: "Groceries", emoji: "🍎", element: "beast", auraColor: "#10b981" },
  { id: "cat-5", name: "Software & SaaS", emoji: "💻", element: "sun", auraColor: "#ff2a5f" },
  { id: "cat-6", name: "Entertainment", emoji: "🎬", element: "mist", auraColor: "#818cf8" },
  { id: "cat-7", name: "Rent & Housing", emoji: "🏠", element: "sun", auraColor: "#f97316" },
  { id: "cat-8", name: "Utilities & Bills", emoji: "💡", element: "water", auraColor: "#38bdf8" },
];

// Backwards compatibility alias
export const MOCK_SPHERES: CategorySphere[] = DEFAULT_CATEGORIES;

/**
 * Clean baseline arrays for new accounts (No demo / seeded records)
 */
export const MOCK_TRANSACTIONS: Transaction[] = [];
export const MOCK_GOALS: Goal[] = [];
export const MOCK_RUNES: CategoryBudgetRune[] = [];
export const MOCK_PACTS: PerpetualPact[] = [];

