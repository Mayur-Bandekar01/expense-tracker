/**
 * Paisa Pulse · Hunter System Core TypeScript Definitions
 * Strict Type System — Zero `any` policy.
 */

export type HunterRankTier = "E" | "D" | "C" | "B" | "A" | "S" | "NATIONAL_LEVEL";

export type BreathingStyle = "water" | "sun" | "thunder" | "beast" | "mist" | "flame";

export type QuestType = "water_inflow" | "flame_outflow";

export type QuestDifficulty = "E-RANK" | "D-RANK" | "C-RANK" | "B-RANK" | "A-RANK" | "S-RANK";

export type BountyStatus = "ACTIVE_HUNT" | "CLAIMED_TREASURE" | "DORMANT";

/**
 * Player Hunter Profile & Vitality Metrics
 */
export interface HunterStats {
  uid: string;
  hunterName: string;
  title: string;                 // e.g. "Shadow Monarch", "Water Hashira", "Rookie Hunter"
  rank: HunterRankTier;          // "S", "A", etc.
  level: number;
  currentExp: number;
  maxExp: number;
  vitalityNetGold: number;       // Net Financial Worth (Thunder)
  waterTotalInflow: number;      // Total Income (Water Breathing)
  flameTotalOutflow: number;     // Total Expenses (Sun Breathing)
  dailyLoginStreak: number;      // Daily Logging Streak (Bonus)
  lastLoginDate: string;         // ISO YYYY-MM-DD
  avatarUrl?: string;
  awakenedAt: string;            // ISO Timestamp
}

/**
 * Quest Log Entry (Replaces standard Transaction)
 */
export interface Quest {
  id: string;
  uid: string;
  questTitle: string;            // e.g. "Dungeon Guild Grocery Run", "Freelance Bounty Reward"
  targetMerchant: string;        // e.g. "Swiggy Tavern", "Zepto Guild", "Steam Kingdom"
  goldAmount: number;            // Transaction amount in INR
  type: QuestType;               // "water_inflow" (income) or "flame_outflow" (expense)
  element: BreathingStyle;       // "water", "sun", "thunder"
  difficulty: QuestDifficulty;   // Scaled by expense/income amount
  categorySphere: string;        // Food, Gear, Transport, etc.
  date: string;                  // ISO YYYY-MM-DD
  time?: string;                 // HH:MM
  notes?: string;
  isRecurringPact?: boolean;
  createdAt: number;             // Timestamp ms
}

/**
 * Bounty & Treasure Hunt (Replaces Savings Goal)
 */
export interface BountyDeposit {
  id: string;
  goldAmount: number;
  depositedAt: string;           // ISO YYYY-MM-DD
  hunterLog?: string;            // e.g. "Stashed spoils from raid"
  timestamp: number;
}

export interface Bounty {
  id: string;
  uid: string;
  bountyName: string;            // e.g. "Mechanical Keyboard of the Monarch", "Tokyo Raid Trip"
  targetTreasureGold: number;    // Goal amount
  accumulatedGold: number;       // Currently saved
  status: BountyStatus;
  wantedPosterUrl?: string;      // Image thumbnail
  targetDeadline?: string;       // ISO YYYY-MM-DD
  breathingAffinity: BreathingStyle;
  deposits: BountyDeposit[];
  createdAt: number;
}

/**
 * Mana Rune Reserve (Replaces Monthly Budget)
 */
export interface ManaRune {
  id: string;
  uid: string;
  monthYear: string;             // YYYY-MM
  allocatedManaGold: number;     // Total budget limit
  consumedManaGold: number;      // Total spent
  runeCategoryLimits?: Record<string, number>;
  alertThresholdPercent: number; // e.g. 80% (Warning aura)
}

export interface CategoryBudgetRune {
  id: string;
  category: string;
  limit: number;
  spent?: number;
  element?: BreathingStyle;
}

/**
 * Elemental Category Sphere
 */
export interface CategorySphere {
  id: string;
  name: string;
  emoji: string;
  element: BreathingStyle;
  auraColor: string;             // Hex code or Tailwind color
  monthlyQuotaGold?: number;
}

/**
 * Perpetual Pact (Replaces Recurring Subscriptions / Bills)
 */
export interface PerpetualPact {
  id: string;
  uid: string;
  pactTitle: string;             // e.g. "Gym Guild Membership", "Streaming Grimoire"
  goldCost: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "ANNUAL";
  nextInvocationDate: string;    // ISO YYYY-MM-DD
  category: string;
  isActive: boolean;
}

/**
 * Standard Financial Transaction Interface (Quest Log representation)
 */
export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  note?: string;
  date: string;                  // ISO YYYY-MM-DD
  time?: string;                 // e.g. "14:30"
  merchant?: string;             // Target merchant / guild source
  method?: string;               // UPI, Card, Cash, Guild Bank
  isRecurring?: boolean;
  difficulty?: QuestDifficulty;
  createdAt?: number;
}

/**
 * Standard Savings Goal Interface (Wanted Bounty representation)
 */
export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  category?: string;
  deadline?: string;             // ISO YYYY-MM-DD
  color?: string;
  wantedPosterUrl?: string;
  contributions?: BountyDeposit[];
}

