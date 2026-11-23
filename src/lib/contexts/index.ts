/**
 * Paisa Pulse - Split Context Exports
 *
 * Each context is isolated to prevent unnecessary re-renders:
 * - TransactionContext: High-frequency transaction updates
 * - BudgetContext: Budget/runes/monthly budget (medium frequency)
 * - GoalsContext: Savings goals/bounties (low frequency)
 * - PactsContext: Recurring bills/subscriptions (low frequency)
 * - UIContext: Theme, audio, anime accents (rarely changes)
 * - AuthContext: User auth state (changes on login/logout)
 */

export { TransactionProvider, useTransactions } from "./TransactionContext";
export { BudgetProvider, useBudgets } from "./BudgetContext";
export { GoalsProvider, useGoals } from "./GoalsContext";
export { PactsProvider, usePacts } from "./PactsContext";
export { UIProvider, useUI } from "./UIContext";
export { AuthProvider, useAuth } from "./AuthContext";