"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { User } from "firebase/auth";
import {
  Transaction,
  Goal,
  CategoryBudgetRune,
  CategorySphere,
  PerpetualPact,
  BountyDeposit,
  HunterRankTier,
  BreathingStyle,
} from "../types/hunter";
import { DEFAULT_CATEGORIES } from "./mockData";
import { watchAuth, getCurrentUser } from "./auth";
import {
  watchTransactions,
  addTransaction as fsAddTransaction,
  updateTransaction as fsUpdateTransaction,
  deleteTransaction as fsDeleteTransaction,
  watchGoals,
  addGoal as fsAddGoal,
  updateGoal as fsUpdateGoal,
  depositToGoal as fsDepositToGoal,
  deleteGoal as fsDeleteGoal,
  watchBudgetRunes,
  saveBudgetRune as fsSaveRune,
  deleteBudgetRune as fsDeleteRune,
  watchBudgetRune as fsWatchBudgetRune,
  setBudgetRune as fsSetBudgetRune,
  deleteMonthlyBudget as fsDeleteMonthlyBudget,
  watchPerpetualPacts,
  savePerpetualPact as fsSavePact,
  deletePerpetualPact as fsDeletePact,
  watchCategorySpheres,
  saveCategorySphere as fsSaveSphere,
  deleteCategorySphere as fsDeleteSphere,
} from "./firestore";
import { evaluateHunterRank } from "./utils";
import { getTodayLocalDate } from "./dateUtils";
import {
  playQuestSound,
  playBountySound,
  playDeleteSound,
  playLevelUpSound,
  playClickSound,
  isSystemAudioMuted,
  setSystemAudioMuted,
} from "./audio";

const STORAGE_KEYS = {
  TRANSACTIONS: "paisa_pulse_quests_v2",
  GOALS: "paisa_pulse_bounties_v2",
  RUNES: "paisa_pulse_runes_v2",
  MONTHLY_BUDGET: "paisa_pulse_monthly_budget_v2",
  SPHERES: "paisa_pulse_spheres_v2",
  PACTS: "paisa_pulse_pacts_v2",
};

export function getUserStorageKey(uid: string | null | undefined, baseKey: string): string {
  if (!uid || uid === "guest") return baseKey;
  return `${baseKey}_usr_${uid}`;
}

export interface HunterVitals {
  rank: HunterRankTier;
  title: string;
  auraColor: string;
  level: number;
  currentExp: number;
  maxExp: number;
  vitalityRatio: number;
  dailyLoginStreak: number;
  netGold: number;
  totalInflow: number;
  totalOutflow: number;
  avatarUrl?: string;
  hunterName: string;
}

export interface HunterContextType {
  user: User | null;
  authLoaded: boolean;
  storageLoaded: boolean;
  transactions: Transaction[];
  goals: Goal[];
  runes: CategoryBudgetRune[];
  monthlyBudget: number | null;
  updateMonthlyBudget: (amount: number | null) => Promise<void>;
  spheres: CategorySphere[];
  pacts: PerpetualPact[];
  vitals: HunterVitals;
  audioMuted: boolean;
  audioEnabled: boolean;
  toggleAudio: () => void;
  animeAccents: boolean;
  toggleAnimeAccents: () => void;

  addTransaction: (tx: Partial<Transaction>) => Promise<string>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addGoal: (goal: Partial<Goal>) => Promise<string>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  depositToGoal: (goalId: string, amount: number, note?: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  saveRune: (rune: Partial<CategoryBudgetRune>) => Promise<void>;
  deleteRune: (id: string) => Promise<void>;

  saveSphere: (sphere: Partial<CategorySphere>) => Promise<void>;
  deleteSphere: (id: string) => Promise<void>;

  savePact: (pact: Partial<PerpetualPact>) => Promise<void>;
  togglePact: (id: string) => Promise<void>;
  deletePact: (id: string, wipeTransactions?: boolean) => Promise<void>;
  executePact: (pact: PerpetualPact | string) => Promise<string>;

  resetToDemoData: () => void;
}

const HunterContext = createContext<HunterContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw && raw !== "null" && raw !== "undefined") {
      const parsed = JSON.parse(raw);
      if (parsed !== null && parsed !== undefined) {
        if (Array.isArray(fallback) && !Array.isArray(parsed)) {
          return fallback;
        }
        return parsed;
      }
    }
  } catch (_e) {}
  return fallback;
}

function sanitizeCategorySpheres(items: any[]): CategorySphere[] {
  if (!Array.isArray(items) || items.length === 0) return DEFAULT_CATEGORIES;
  return items.filter(Boolean).map((s: any, idx: number) => {
    const rawElem = typeof s?.element === "string" ? s.element.toLowerCase() : "water";
    const validElem: BreathingStyle =
      rawElem === "sun" ||
      rawElem === "thunder" ||
      rawElem === "beast" ||
      rawElem === "mist" ||
      rawElem === "flame"
        ? (rawElem as BreathingStyle)
        : "water";

    const defaultAura =
      validElem === "water"
        ? "#00f2fe"
        : validElem === "sun"
        ? "#ff2a5f"
        : validElem === "thunder"
        ? "#ffe600"
        : validElem === "beast"
        ? "#10b981"
        : validElem === "flame"
        ? "#f97316"
        : "#818cf8";

    return {
      id: String(s?.id || `cat-${idx + 1}`),
      name: String(s?.name || `Sphere ${idx + 1}`),
      emoji: String(s?.emoji || "✨"),
      element: validElem,
      auraColor: String(s?.auraColor || defaultAura),
      monthlyQuotaGold: typeof s?.monthlyQuotaGold === "number" ? s.monthlyQuotaGold : undefined,
    };
  });
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_e) {}
}

export function HunterProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [runes, setRunes] = useState<CategoryBudgetRune[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [spheres, setSpheres] = useState<CategorySphere[]>(DEFAULT_CATEGORIES);
  const [pacts, setPacts] = useState<PerpetualPact[]>([]);

  const [animeAccents, setAnimeAccents] = useState<boolean>(true);
  const [storageLoaded, setStorageLoaded] = useState<boolean>(false);

  useEffect(() => {
    setAudioMuted(isSystemAudioMuted());
    if (typeof window !== "undefined") {
      try {
        const activeUid = getCurrentUser()?.uid;
        const txKey = getUserStorageKey(activeUid, STORAGE_KEYS.TRANSACTIONS);
        const goalsKey = getUserStorageKey(activeUid, STORAGE_KEYS.GOALS);
        const runesKey = getUserStorageKey(activeUid, STORAGE_KEYS.RUNES);
        const budgetKey = getUserStorageKey(activeUid, STORAGE_KEYS.MONTHLY_BUDGET);
        const spheresKey = getUserStorageKey(activeUid, STORAGE_KEYS.SPHERES);
        const pactsKey = getUserStorageKey(activeUid, STORAGE_KEYS.PACTS);

        const storedTx = loadFromStorage<Transaction[]>(txKey, []);
        const storedGoals = loadFromStorage<Goal[]>(goalsKey, []);
        const storedRunes = loadFromStorage<CategoryBudgetRune[]>(runesKey, []);
        const storedMonthlyBudget = loadFromStorage<number | null>(budgetKey, null);
        const storedSpheres = sanitizeCategorySpheres(loadFromStorage(spheresKey, DEFAULT_CATEGORIES));
        const storedPacts = loadFromStorage<PerpetualPact[]>(pactsKey, []);

        const isLegacyDemoId = (id: string | undefined, prefix: string) => {
          if (!id) return false;
          const match = id.match(new RegExp(`^${prefix}-(\\d+)$`));
          return match ? match[1].length < 8 : false;
        };

        const cleanTx = (storedTx || []).filter((t) => t && !isLegacyDemoId(t.id, "tx"));
        const cleanGoals = (storedGoals || []).filter((g) => g && !isLegacyDemoId(g.id, "goal"));
        const cleanRunes = (storedRunes || []).filter((r) => r && !isLegacyDemoId(r.id, "rune"));
        const cleanPacts = (storedPacts || []).filter((p) => p && !isLegacyDemoId(p.id, "pact"));

        setTransactions(cleanTx);
        setGoals(cleanGoals);
        setRunes(cleanRunes);
        setMonthlyBudget(
          typeof storedMonthlyBudget === "number" && storedMonthlyBudget > 0 ? storedMonthlyBudget : null
        );
        setSpheres(storedSpheres);
        setPacts(cleanPacts);
      } catch (_e) {}

      const storedAnime = localStorage.getItem("paisa_pulse_anime_accents");
      if (storedAnime !== null) setAnimeAccents(storedAnime === "true");
    }
    setStorageLoaded(true);
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioMuted((prev) => {
      const next = !prev;
      setSystemAudioMuted(next);
      if (!next) playClickSound();
      return next;
    });
  }, []);

  const toggleAnimeAccents = useCallback(() => {
    setAnimeAccents((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("paisa_pulse_anime_accents", next ? "true" : "false");
      }
      return next;
    });
  }, []);

  useEffect(() => {
    let resolved = false;
    const fallbackTimer = setTimeout(() => {
      if (!resolved) {
        setAuthLoaded(true);
      }
    }, 1500);

    const unsub = watchAuth((currUser) => {
      resolved = true;
      clearTimeout(fallbackTimer);
      setUser(currUser);
      setAuthLoaded(true);

      if (!currUser) {
        setTransactions([]);
        setGoals([]);
        setRunes([]);
        setMonthlyBudget(null);
        setPacts([]);
        setSpheres(DEFAULT_CATEGORIES);
        return;
      }

      try {
        const uKey = (k: string) => getUserStorageKey(currUser.uid, k);
        const cachedTx = loadFromStorage<Transaction[] | null>(uKey(STORAGE_KEYS.TRANSACTIONS), null);
        if (Array.isArray(cachedTx)) setTransactions(cachedTx);

        const cachedGoals = loadFromStorage<Goal[] | null>(uKey(STORAGE_KEYS.GOALS), null);
        if (Array.isArray(cachedGoals)) setGoals(cachedGoals);

        const cachedRunes = loadFromStorage<CategoryBudgetRune[] | null>(uKey(STORAGE_KEYS.RUNES), null);
        if (Array.isArray(cachedRunes)) setRunes(cachedRunes);

        const cachedBudget = loadFromStorage<number | null>(uKey(STORAGE_KEYS.MONTHLY_BUDGET), null);
        setMonthlyBudget(typeof cachedBudget === "number" && cachedBudget > 0 ? cachedBudget : null);

        const cachedSpheres = loadFromStorage<CategorySphere[] | null>(uKey(STORAGE_KEYS.SPHERES), null);
        if (Array.isArray(cachedSpheres) && cachedSpheres.length > 0) {
          setSpheres(sanitizeCategorySpheres(cachedSpheres));
        }

        const cachedPacts = loadFromStorage<PerpetualPact[] | null>(uKey(STORAGE_KEYS.PACTS), null);
        if (Array.isArray(cachedPacts)) setPacts(cachedPacts);
      } catch (_e) {}
    });

    return () => {
      clearTimeout(fallbackTimer);
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubs: (() => void)[] = [];
    const uid = user.uid;
    const uKey = (k: string) => getUserStorageKey(uid, k);

    const migratedKey = getUserStorageKey(uid, "paisa_pulse_migrated_v2");
    const alreadyMigrated = loadFromStorage(migratedKey, false);
    if (!alreadyMigrated) {
      saveToStorage(migratedKey, true);
      const guestTxs = loadFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
      if (guestTxs.length > 0) {
        guestTxs.forEach((tx) => fsAddTransaction(uid, tx).catch((e) => console.error("Migration error:", e)));
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      }
      const guestGoals = loadFromStorage<Goal[]>(STORAGE_KEYS.GOALS, []);
      if (guestGoals.length > 0) {
        guestGoals.forEach((g) => fsAddGoal(uid, g).catch((e) => console.error("Migration error:", e)));
        localStorage.removeItem(STORAGE_KEYS.GOALS);
      }
      const guestRunes = loadFromStorage<CategoryBudgetRune[]>(STORAGE_KEYS.RUNES, []);
      if (guestRunes.length > 0) {
        guestRunes.forEach((r) => fsSaveRune(uid, r).catch((e) => console.error("Migration error:", e)));
        localStorage.removeItem(STORAGE_KEYS.RUNES);
      }
      const guestPacts = loadFromStorage<PerpetualPact[]>(STORAGE_KEYS.PACTS, []);
      if (guestPacts.length > 0) {
        guestPacts.forEach((p) => fsSavePact(uid, p).catch((e) => console.error("Migration error:", e)));
        localStorage.removeItem(STORAGE_KEYS.PACTS);
      }
    }

    // 1. Transactions watcher
    unsubs.push(
      watchTransactions(uid, (fsTxs) => {
        if (!Array.isArray(fsTxs)) return;
        const activeTxs = fsTxs.filter(Boolean);
        setTransactions(activeTxs);
        saveToStorage(uKey(STORAGE_KEYS.TRANSACTIONS), activeTxs);
      })
    );

    // 2. Goals watcher
    unsubs.push(
      watchGoals(uid, (fsGoals) => {
        if (!Array.isArray(fsGoals)) return;
        setGoals(fsGoals);
        saveToStorage(uKey(STORAGE_KEYS.GOALS), fsGoals);
      })
    );

    // 3. Category Runes watcher
    unsubs.push(
      watchBudgetRunes(uid, (fsRunes) => {
        if (!Array.isArray(fsRunes)) return;
        setRunes(fsRunes);
        saveToStorage(uKey(STORAGE_KEYS.RUNES), fsRunes);
      })
    );

    // 4. Category Spheres watcher
    unsubs.push(
      watchCategorySpheres(uid, (fsSpheres) => {
        if (Array.isArray(fsSpheres) && fsSpheres.length > 0) {
          const sanitized = sanitizeCategorySpheres(fsSpheres);
          setSpheres(sanitized);
          saveToStorage(uKey(STORAGE_KEYS.SPHERES), sanitized);
        }
      })
    );

    // 5. Perpetual Pacts watcher
    unsubs.push(
      watchPerpetualPacts(uid, (fsPacts) => {
        if (!Array.isArray(fsPacts)) return;
        setPacts(fsPacts);
        saveToStorage(uKey(STORAGE_KEYS.PACTS), fsPacts);
      })
    );

    // 6. Overall Monthly Budget watcher
    const currentYM = getTodayLocalDate().slice(0, 7);
    unsubs.push(
      fsWatchBudgetRune(uid, currentYM, (fsBudget) => {
        if (fsBudget) {
          const rawAmt = (fsBudget as any).totalBudget ?? (fsBudget as any).allocatedManaGold;
          const parsed = Number(rawAmt);
          if (!isNaN(parsed) && parsed > 0) {
            setMonthlyBudget(parsed);
            saveToStorage(uKey(STORAGE_KEYS.MONTHLY_BUDGET), parsed);
            return;
          }
        }
        setMonthlyBudget(null);
        saveToStorage(uKey(STORAGE_KEYS.MONTHLY_BUDGET), null);
      })
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user]);

  useEffect(() => {
    if (!storageLoaded) return;
    const uid = user?.uid || getCurrentUser()?.uid;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.TRANSACTIONS), transactions);
  }, [transactions, user, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    const uid = user?.uid || getCurrentUser()?.uid;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.GOALS), goals);
  }, [goals, user, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    const uid = user?.uid || getCurrentUser()?.uid;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.RUNES), runes);
  }, [runes, user, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    const uid = user?.uid || getCurrentUser()?.uid;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.MONTHLY_BUDGET), monthlyBudget);
  }, [monthlyBudget, user, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    const uid = user?.uid || getCurrentUser()?.uid;
    if (spheres.length > 0) {
      saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.SPHERES), spheres);
    }
  }, [spheres, user, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    const uid = user?.uid || getCurrentUser()?.uid;
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.PACTS), pacts);
  }, [pacts, user, storageLoaded]);

  const vitals = useMemo<HunterVitals>(() => {
    const totalInflow = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalOutflow = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const netGold = totalInflow - totalOutflow;
    const rankInfo = evaluateHunterRank(netGold);

    const vitalityRatio =
      totalInflow > 0
        ? Math.max(0, Math.min(100, Math.round(((totalInflow - totalOutflow) / totalInflow) * 100)))
        : 0;

    const baseExp = transactions.length * 250 + Math.floor(Math.max(0, netGold) / 100);
    const level = Math.max(1, Math.floor(baseExp / 2500) + 1);
    const currentExp = baseExp % 2500;
    const maxExp = 2500;

    const hunterName = user?.displayName || (user?.email ? user.email.split("@")[0] : "User");
    const avatarUrl = user?.photoURL || undefined;

    return {
      rank: rankInfo.rank,
      title: rankInfo.title,
      auraColor: rankInfo.auraColor,
      level,
      currentExp,
      maxExp,
      vitalityRatio,
      dailyLoginStreak: Math.min(30, 7 + (transactions.length % 15)),
      netGold,
      totalInflow,
      totalOutflow,
      avatarUrl,
      hunterName,
    };
  }, [transactions, user]);

  // ── 1. Quest Transaction Handlers ─────────────────────────────
  const addTransaction = useCallback(
    async (tx: Partial<Transaction>): Promise<string> => {
      const id = tx.id || `tx-${Date.now()}`;
      const newTx: Transaction = {
        id,
        amount: Number(tx.amount) || 0,
        type: tx.type || "expense",
        category: tx.category || "Miscellaneous",
        note: tx.note || (tx.type === "income" ? "Income Deposit" : "Expense"),
        merchant: tx.merchant || "",
        date: tx.date || getTodayLocalDate(),
        time: tx.time || new Date().toTimeString().slice(0, 5),
        method: tx.method || "UPI",
        isRecurring: Boolean(tx.isRecurring),
        ...(tx.difficulty ? { difficulty: tx.difficulty } : {}),
      };

      setTransactions((prev) => {
        const next = [newTx, ...prev.filter((t) => t.id !== id)];
        const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.TRANSACTIONS);
        saveToStorage(key, next);
        return next;
      });
      playQuestSound();

      const activeUser = user || getCurrentUser();
      if (activeUser) {
        try {
          await fsAddTransaction(activeUser.uid, newTx);
        } catch (err) {
          console.error("Firestore addTransaction error:", err);
        }
      }
      return id;
    },
    [user]
  );

  const updateTransaction = useCallback(
    async (id: string, tx: Partial<Transaction>): Promise<void> => {
      setTransactions((prev) => {
        const next = prev.map((t) => (t.id === id ? ({ ...t, ...tx } as Transaction) : t));
        const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.TRANSACTIONS);
        saveToStorage(key, next);
        return next;
      });
      playClickSound();

      const activeUser = user || getCurrentUser();
      if (activeUser) {
        try {
          await fsUpdateTransaction(activeUser.uid, id, tx);
        } catch (err) {
          console.error("Firestore updateTransaction error:", err);
        }
      }
    },
    [user]
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<void> => {
      const activeUser = user || getCurrentUser();
      const uid = activeUser?.uid;

      setTransactions((prev) => {
        const next = (prev || []).filter((t) => t && t.id !== id);
        if (uid) {
          saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.TRANSACTIONS), next);
        }
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, next);
        return next;
      });
      playDeleteSound();

      if (activeUser && uid) {
        try {
          await fsDeleteTransaction(uid, id);
        } catch (err) {
          console.error("Firestore deleteTransaction error:", err);
        }
      }
    },
    [user]
  );

  // ── 2. Bounty Goal Handlers ──────────────────────────────────
  const addGoal = useCallback(
    async (goalData: Partial<Goal>): Promise<string> => {
      const id = goalData.id || `goal-${Date.now()}`;
      const initialSaved = Number(goalData.savedAmount) || 0;
      const initialContributions: BountyDeposit[] =
        initialSaved > 0
          ? [
              {
                id: `dep-${Date.now()}`,
                goldAmount: initialSaved,
                depositedAt: getTodayLocalDate(),
                hunterLog: "Initial deposit",
                timestamp: Date.now(),
              },
            ]
          : [];

      const newGoal: Goal = {
        id,
        title: goalData.title || "Savings Goal",
        targetAmount: Number(goalData.targetAmount) || 10000,
        savedAmount: initialSaved,
        category: goalData.category || "General",
        ...(goalData.deadline ? { deadline: goalData.deadline } : {}),
        contributions: initialContributions,
      };

      setGoals((prev) => {
        const next = [newGoal, ...prev.filter((g) => g.id !== id)];
        const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.GOALS);
        saveToStorage(key, next);
        return next;
      });
      playBountySound();

      const activeUser = user || getCurrentUser();
      if (activeUser) {
        try {
          await fsAddGoal(activeUser.uid, newGoal);
        } catch (err) {
          console.error("Firestore addGoal error:", err);
        }
      }
      return id;
    },
    [user]
  );

  const updateGoal = useCallback(
    async (id: string, goalData: Partial<Goal>): Promise<void> => {
      setGoals((prev) => {
        const next = prev.map((g) => (g.id === id ? ({ ...g, ...goalData } as Goal) : g));
        const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.GOALS);
        saveToStorage(key, next);
        return next;
      });
      playClickSound();

      const activeUser = user || getCurrentUser();
      if (activeUser) {
        try {
          await fsUpdateGoal(activeUser.uid, id, goalData);
        } catch (err) {
          console.error("Firestore updateGoal error:", err);
        }
      }
    },
    [user]
  );

  const depositToGoal = useCallback(
    async (goalId: string, amount: number, note?: string): Promise<void> => {
      const deposit: BountyDeposit = {
        id: `dep-${Date.now()}`,
        goldAmount: amount,
        depositedAt: getTodayLocalDate(),
        hunterLog: note || "Deposit contribution",
        timestamp: Date.now(),
      };

      const targetGoal = goals.find((g) => g.id === goalId);
      if (!targetGoal) return;

      const updatedGoal: Goal = {
        ...targetGoal,
        savedAmount: (Number(targetGoal.savedAmount) || 0) + amount,
        contributions: [...(targetGoal.contributions || []), deposit],
      };

      setGoals((prev) => {
        const next = prev.map((g) => (g.id === goalId ? updatedGoal : g));
        const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.GOALS);
        saveToStorage(key, next);
        return next;
      });
      playBountySound();

      const activeUser = user || getCurrentUser();
      if (activeUser) {
        try {
          await fsDepositToGoal(activeUser.uid, targetGoal, amount, note);
        } catch (err) {
          console.error("Firestore depositToGoal error:", err);
        }
      }
    },
    [goals, user]
  );

  const deleteGoal = useCallback(
    async (id: string): Promise<void> => {
      setGoals((prev) => {
        const next = prev.filter((g) => g.id !== id);
        const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.GOALS);
        saveToStorage(key, next);
        return next;
      });
      playDeleteSound();

      const activeUser = user || getCurrentUser();
      if (activeUser) {
        try {
          await fsDeleteGoal(activeUser.uid, id);
        } catch (err) {
          console.error("Firestore deleteGoal error:", err);
        }
      }
    },
    [user]
  );

  // ── 3. Mana Rune & Monthly Budget Handlers ──────────────────
  const updateMonthlyBudget = useCallback(
    async (amount: number | null): Promise<void> => {
      const currentYM = getTodayLocalDate().slice(0, 7);
      const validAmount =
        amount !== null && !isNaN(amount) && amount > 0
          ? Math.round(amount * 100) / 100
          : null;

      setMonthlyBudget(validAmount);
      playClickSound();

      const activeUser = user || getCurrentUser();
      const storageKey = getUserStorageKey(activeUser?.uid, STORAGE_KEYS.MONTHLY_BUDGET);
      saveToStorage(storageKey, validAmount);

      if (activeUser) {
        try {
          if (validAmount === null) {
            await fsDeleteMonthlyBudget(activeUser.uid, currentYM);
          } else {
            await fsSetBudgetRune(activeUser.uid, currentYM, {
              totalBudget: validAmount,
              allocatedManaGold: validAmount,
              monthYear: currentYM,
              currency: "INR",
              updatedAt: new Date().toISOString(),
            } as any);
          }
        } catch (err) {
          console.error("Firestore updateMonthlyBudget error:", err);
        }
      }
    },
    [user]
  );

  const saveRune = useCallback(
    async (runeData: Partial<CategoryBudgetRune>): Promise<void> => {
      let resolvedRune: CategoryBudgetRune | undefined;
      setRunes((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        if (runeData.id && safePrev.some((r) => r.id === runeData.id)) {
          const next = safePrev.map((r) => {
            if (r.id === runeData.id) {
              resolvedRune = { ...r, ...runeData } as CategoryBudgetRune;
              return resolvedRune;
            }
            return r;
          });
          const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.RUNES);
          saveToStorage(key, next);
          return next;
        }

        const trimmedCat = (runeData.category || "").trim().toLowerCase();
        const existingCatRune = safePrev.find(
          (r) => (r.category || "").trim().toLowerCase() === trimmedCat
        );
        if (existingCatRune) {
          const next = safePrev.map((r) => {
            if (r.id === existingCatRune.id) {
              resolvedRune = { ...r, ...runeData, id: existingCatRune.id } as CategoryBudgetRune;
              return resolvedRune;
            }
            return r;
          });
          const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.RUNES);
          saveToStorage(key, next);
          return next;
        }

        resolvedRune = {
          id: runeData.id || `rune-${Date.now()}`,
          category: runeData.category || "Dining & Food",
          limit: Number(runeData.limit) || 10000,
          element: runeData.element || "sun",
          spent: Number(runeData.spent) || 0,
        };
        const next = [...safePrev, resolvedRune];
        const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.RUNES);
        saveToStorage(key, next);
        return next;
      });
      playClickSound();

      const activeUser = user || getCurrentUser();
      if (activeUser && resolvedRune) {
        try {
          await fsSaveRune(activeUser.uid, resolvedRune);
        } catch (err) {
          console.error("Firestore saveRune error:", err);
        }
      }
    },
    [user]
  );

  const deleteRune = useCallback(
    async (id: string): Promise<void> => {
      setRunes((prev) => {
        const next = prev.filter((r) => r.id !== id);
        const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.RUNES);
        saveToStorage(key, next);
        return next;
      });
      playDeleteSound();

      const activeUser = user || getCurrentUser();
      if (activeUser) {
        try {
          await fsDeleteRune(activeUser.uid, id);
        } catch (err) {
          console.error("Firestore deleteRune error:", err);
        }
      }
    },
    [user]
  );

  // ── 4. Category Sphere Handlers ──────────────────────────────
  const saveSphere = useCallback(
    async (catData: Partial<CategorySphere>): Promise<void> => {
      let savedSphere: CategorySphere | undefined;
      setSpheres((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        if (catData.id && safePrev.some((s) => s.id === catData.id)) {
          const next = safePrev.map((s) => {
            if (s.id === catData.id) {
              savedSphere = {
                ...s,
                ...catData,
                element: catData.element || s.element || "water",
                auraColor: catData.auraColor || s.auraColor || "#00f2fe",
              } as CategorySphere;
              return savedSphere;
            }
            return s;
          });
          const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.SPHERES);
          saveToStorage(key, next);
          return next;
        }
        const newSphere: CategorySphere = {
          id: catData.id || `cat-${Date.now()}`,
          name: catData.name || "Custom Sphere",
          emoji: catData.emoji || "✨",
          element: catData.element || "water",
          auraColor: catData.auraColor || "#00f2fe",
          ...(catData.monthlyQuotaGold != null ? { monthlyQuotaGold: Number(catData.monthlyQuotaGold) } : {}),
        };
        savedSphere = newSphere;
        const next = [...safePrev, newSphere];
        const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.SPHERES);
        saveToStorage(key, next);
        return next;
      });
      playClickSound();

      const activeUser = user || getCurrentUser();
      if (activeUser && savedSphere) {
        try {
          await fsSaveSphere(activeUser.uid, savedSphere);
        } catch (err) {
          console.error("Firestore saveSphere error:", err);
        }
      }
    },
    [user]
  );

  const deleteSphere = useCallback(
    async (id: string): Promise<void> => {
      setSpheres((prev) => {
        const next = prev.filter((s) => s.id !== id);
        const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.SPHERES);
        saveToStorage(key, next);
        return next;
      });
      playDeleteSound();

      const activeUser = user || getCurrentUser();
      if (activeUser) {
        try {
          await fsDeleteSphere(activeUser.uid, id);
        } catch (err) {
          console.error("Firestore deleteSphere error:", err);
        }
      }
    },
    [user]
  );

  // ── 5. Perpetual Pact Handlers ────────────────────────────────
  const savePact = useCallback(
    async (pactData: Partial<PerpetualPact>): Promise<void> => {
      let targetPact: PerpetualPact | undefined;
      setPacts((prev) => {
        if (pactData.id && prev.some((p) => p.id === pactData.id)) {
          const next = prev.map((p) => {
            if (p.id === pactData.id) {
              targetPact = { ...p, ...pactData } as PerpetualPact;
              return targetPact;
            }
            return p;
          });
          const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.PACTS);
          saveToStorage(key, next);
          return next;
        }
        const activeUid = user?.uid || getCurrentUser()?.uid || "guest";
        const newPact: PerpetualPact = {
          id: pactData.id || `pact-${Date.now()}`,
          uid: activeUid,
          pactTitle: pactData.pactTitle || "New Pact",
          goldCost: Number(pactData.goldCost) || 999,
          frequency: pactData.frequency || "MONTHLY",
          nextInvocationDate: pactData.nextInvocationDate || getTodayLocalDate(),
          category: pactData.category || "Utilities",
          isActive: pactData.isActive ?? true,
        };
        targetPact = newPact;
        const next = [...prev, newPact];
        const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.PACTS);
        saveToStorage(key, next);
        return next;
      });
      playClickSound();

      const activeUser = user || getCurrentUser();
      if (activeUser && targetPact) {
        try {
          await fsSavePact(activeUser.uid, targetPact);
        } catch (err) {
          console.error("Firestore savePact error:", err);
        }
      }
    },
    [user]
  );

  const togglePact = useCallback(
    async (id: string): Promise<void> => {
      let updatedPact: PerpetualPact | undefined;
      setPacts((prev) => {
        const next = prev.map((p) => {
          if (p.id !== id) return p;
          updatedPact = { ...p, isActive: !p.isActive };
          return updatedPact;
        });
        const key = getUserStorageKey(user?.uid || getCurrentUser()?.uid, STORAGE_KEYS.PACTS);
        saveToStorage(key, next);
        return next;
      });
      playClickSound();

      const activeUser = user || getCurrentUser();
      if (activeUser && updatedPact) {
        try {
          await fsSavePact(activeUser.uid, updatedPact);
        } catch (err) {
          console.error("Firestore togglePact error:", err);
        }
      }
    },
    [user]
  );

  const deletePact = useCallback(
    async (id: string, wipeTransactions: boolean = true): Promise<void> => {
      const activeUser = user || getCurrentUser();
      const uid = activeUser?.uid;
      const targetPact = pacts.find((p) => p.id === id);

      setPacts((prev) => {
        const next = (prev || []).filter((p) => p && p.id !== id);
        const key = getUserStorageKey(uid, STORAGE_KEYS.PACTS);
        saveToStorage(key, next);
        saveToStorage(STORAGE_KEYS.PACTS, next);
        return next;
      });
      playDeleteSound();

      if (activeUser && uid) {
        try {
          await fsDeletePact(uid, id);
        } catch (err) {
          console.error("Firestore deletePact error:", err);
        }
      }

      if (wipeTransactions && targetPact) {
        const titleLower = (targetPact.pactTitle || "").trim().toLowerCase();
        let wipedTxs: Transaction[] = [];

        setTransactions((prev) => {
          const next = (prev || []).filter((t) => {
            if (!t) return false;
            const noteMatch = (t.note || "").toLowerCase().includes(titleLower);
            const merchantMatch = (t.merchant || "").toLowerCase() === titleLower;
            const isMatch = t.isRecurring && (noteMatch || merchantMatch);
            if (isMatch) {
              wipedTxs.push(t);
              return false;
            }
            return true;
          });

          if (uid) {
            saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.TRANSACTIONS), next);
          }
          saveToStorage(STORAGE_KEYS.TRANSACTIONS, next);
          return next;
        });

        if (activeUser && uid && wipedTxs.length > 0) {
          for (const tx of wipedTxs) {
            await fsDeleteTransaction(uid, tx.id).catch((e) =>
              console.error("Error wiping recurring tx from Firestore:", e)
            );
          }
        }
      }
    },
    [pacts, user]
  );

  const executePact = useCallback(
    async (pactOrId: PerpetualPact | string): Promise<string> => {
      const pact =
        typeof pactOrId === "string" ? pacts.find((p) => p.id === pactOrId) : pactOrId;
      if (!pact) return "";

      const cost = Number(pact.goldCost) || 0;

      const txId = await addTransaction({
        amount: cost,
        type: "expense",
        category: pact.category || "Utilities",
        note: `Recurring Payment: ${pact.pactTitle}`,
        merchant: pact.pactTitle,
        method: "Auto-Debit",
        isRecurring: true,
      });

      let baseDate: Date;
      if (pact.nextInvocationDate) {
        const raw = String(pact.nextInvocationDate).trim();
        const clean = raw.includes("T") ? raw.split("T")[0] : raw;
        const parsed = new Date(clean + "T00:00:00");
        baseDate = isNaN(parsed.getTime()) ? new Date() : parsed;
      } else {
        baseDate = new Date();
      }

      const freq = (pact.frequency || "MONTHLY").toUpperCase();
      if (freq === "DAILY") {
        baseDate.setDate(baseDate.getDate() + 1);
      } else if (freq === "WEEKLY") {
        baseDate.setDate(baseDate.getDate() + 7);
      } else if (freq === "ANNUAL") {
        baseDate.setFullYear(baseDate.getFullYear() + 1);
      } else {
        const targetDay = baseDate.getDate();
        baseDate.setDate(1);
        baseDate.setMonth(baseDate.getMonth() + 1);
        const maxDaysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
        baseDate.setDate(Math.min(targetDay, maxDaysInMonth));
      }

      const year = baseDate.getFullYear();
      const month = String(baseDate.getMonth() + 1).padStart(2, "0");
      const day = String(baseDate.getDate()).padStart(2, "0");
      const nextISO = `${year}-${month}-${day}`;

      await savePact({ ...pact, nextInvocationDate: nextISO });
      playLevelUpSound();
      return txId;
    },
    [addTransaction, pacts, savePact]
  );

  // ── Reset to Clean Initial Ledger ─────────────────────────────
  const resetToDemoData = useCallback(async () => {
    const activeUser = user || getCurrentUser();
    const uid = activeUser?.uid;
    const currentYM = getTodayLocalDate().slice(0, 7);

    const currentTxs = [...transactions];
    const currentGoals = [...goals];
    const currentRunes = [...runes];
    const currentPacts = [...pacts];

    setTransactions([]);
    setGoals([]);
    setRunes([]);
    setSpheres(DEFAULT_CATEGORIES);
    setPacts([]);
    setMonthlyBudget(null);

    const keys = [
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.GOALS,
      STORAGE_KEYS.RUNES,
      STORAGE_KEYS.SPHERES,
      STORAGE_KEYS.PACTS,
    ];
    keys.forEach((k) => {
      saveToStorage(getUserStorageKey(uid, k), []);
      saveToStorage(k, []);
    });
    saveToStorage(getUserStorageKey(uid, STORAGE_KEYS.MONTHLY_BUDGET), null);
    saveToStorage(STORAGE_KEYS.MONTHLY_BUDGET, null);

    if (activeUser) {
      try {
        await fsDeleteMonthlyBudget(activeUser.uid, currentYM).catch(() => {});
        for (const tx of currentTxs) {
          await fsDeleteTransaction(activeUser.uid, tx.id).catch(() => {});
        }
        for (const g of currentGoals) {
          await fsDeleteGoal(activeUser.uid, g.id).catch(() => {});
        }
        for (const r of currentRunes) {
          await fsDeleteRune(activeUser.uid, r.id).catch(() => {});
        }
        for (const p of currentPacts) {
          await fsDeletePact(activeUser.uid, p.id).catch(() => {});
        }
      } catch (_e) {}
    }

    playDeleteSound();
  }, [user, transactions, goals, runes, pacts]);

  const audioEnabled = !audioMuted;

  const value = useMemo<HunterContextType>(
    () => ({
      user,
      authLoaded,
      storageLoaded,
      transactions,
      goals,
      runes,
      monthlyBudget,
      updateMonthlyBudget,
      spheres,
      pacts,
      vitals,
      audioMuted,
      audioEnabled,
      toggleAudio,
      animeAccents,
      toggleAnimeAccents,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      depositToGoal,
      deleteGoal,
      saveRune,
      deleteRune,
      saveSphere,
      deleteSphere,
      savePact,
      togglePact,
      deletePact,
      executePact,
      resetToDemoData,
    }),
    [
      user,
      authLoaded,
      storageLoaded,
      transactions,
      goals,
      runes,
      monthlyBudget,
      updateMonthlyBudget,
      spheres,
      pacts,
      vitals,
      audioMuted,
      audioEnabled,
      toggleAudio,
      animeAccents,
      toggleAnimeAccents,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      depositToGoal,
      deleteGoal,
      saveRune,
      deleteRune,
      saveSphere,
      deleteSphere,
      savePact,
      togglePact,
      deletePact,
      executePact,
      resetToDemoData,
    ]
  );

  return <HunterContext.Provider value={value}>{children}</HunterContext.Provider>;
}

export function useHunterSystem(): HunterContextType {
  const ctx = useContext(HunterContext);
  if (!ctx) {
    throw new Error("useHunterSystem must be used within a HunterProvider");
  }
  return ctx;
}
