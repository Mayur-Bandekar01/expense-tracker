import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  Transaction,
  Goal,
  BountyDeposit,
  ManaRune,
  CategoryBudgetRune,
  CategorySphere,
  PerpetualPact,
  HunterStats,
} from "../types/hunter";
import { getTodayLocalDate } from "./dateUtils";

/**
 * Recursively cleans an object or array to ensure no `undefined` values are sent to Firestore.
 * Firestore strictly rejects documents with `undefined` values if ignoreUndefinedProperties is not set.
 * Preserves Date instances, FieldValue sentinels, and primitives.
 */
export function cleanFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof data === "object") {
    // Preserve Dates and Firestore FieldValue sentinels
    if (
      data instanceof Date ||
      typeof (data as any).toMillis === "function" ||
      typeof (data as any).isEqual === "function" ||
      (data as any)._methodName !== undefined ||
      (data as any)?._delegate !== undefined ||
      (data as any)?.constructor?.name === "FieldValue" ||
      (data as any)?.constructor?.name === "ServerTimestampFieldValueImpl"
    ) {
      return data;
    }
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    }
    return cleaned as T;
  }
  return data;
}

// ── 1. Transactions (Quests) ──────────────────────────────────
export async function addTransaction(uid: string, data: Partial<Transaction>): Promise<string> {
  const coll = collection(db, "users", uid, "transactions");
  const docId = data.id || `tx-${Date.now()}`;
  const now = new Date().toISOString();
  const cleaned = cleanFirestoreData({
    ...data,
    id: docId,
    createdAt: (data as any).createdAt || now,
    updatedAt: now,
  });
  await setDoc(doc(coll, docId), cleaned, { merge: true });
  return docId;
}

export async function updateTransaction(
  uid: string,
  id: string,
  data: Partial<Transaction>
): Promise<void> {
  const now = new Date().toISOString();
  const cleaned = cleanFirestoreData({
    ...data,
    updatedAt: now,
  });
  delete (cleaned as any).id;
  await setDoc(doc(db, "users", uid, "transactions", id), cleaned, { merge: true });
}

export async function deleteTransaction(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "transactions", id));
}

export function watchTransactions(
  uid: string,
  callback: (transactions: Transaction[]) => void
): () => void {
  const coll = collection(db, "users", uid, "transactions");
  return onSnapshot(
    coll,
    (snap) => {
      const txs: Transaction[] = [];
      snap.forEach((d: any) => {
        const item = d.data();
        if (item) {
          txs.push({ id: d.id, ...item });
        }
      });
      // In-memory sort by date desc, then time desc, then id desc
      txs.sort((a, b) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        if (dateB !== dateA) return dateB.localeCompare(dateA);
        const timeA = a.time || "";
        const timeB = b.time || "";
        if (timeB !== timeA) return timeB.localeCompare(timeA);
        return (b.id || "").localeCompare(a.id || "");
      });
      callback(txs);
    },
    (err) => console.error("[watchTransactions]", err)
  );
}

// ── 2. Goals (Bounties) ───────────────────────────────────────
export async function addGoal(uid: string, data: Partial<Goal>): Promise<string> {
  const coll = collection(db, "users", uid, "goals");
  const docId = data.id || `goal-${Date.now()}`;
  const now = new Date().toISOString();
  const cleaned = cleanFirestoreData({
    ...data,
    id: docId,
    savedAmount: typeof data.savedAmount === "number" ? data.savedAmount : 0,
    contributions: Array.isArray(data.contributions) ? data.contributions : [],
    createdAt: (data as any).createdAt || now,
    updatedAt: now,
  });
  await setDoc(doc(coll, docId), cleaned, { merge: true });
  return docId;
}

export async function updateGoal(uid: string, id: string, data: Partial<Goal>): Promise<void> {
  const now = new Date().toISOString();
  const cleaned = cleanFirestoreData({
    ...data,
    updatedAt: now,
  });
  delete (cleaned as any).id;
  await setDoc(doc(db, "users", uid, "goals", id), cleaned, { merge: true });
}

export async function depositToGoal(
  uid: string,
  goal: Goal,
  amount: number,
  note?: string
): Promise<void> {
  const deposit: BountyDeposit = {
    id: `dep-${Date.now()}`,
    goldAmount: amount,
    depositedAt: getTodayLocalDate(),
    hunterLog: note || "Deposit contribution",
    timestamp: Date.now(),
  };

  const newContributions = cleanFirestoreData([...(goal.contributions || []), deposit]);
  const newSaved = (Number(goal.savedAmount) || 0) + amount;
  const now = new Date().toISOString();

  await setDoc(
    doc(db, "users", uid, "goals", goal.id),
    {
      savedAmount: newSaved,
      contributions: newContributions,
      updatedAt: now,
    },
    { merge: true }
  );
}

export async function deleteGoal(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "goals", id));
}

export function watchGoals(uid: string, callback: (goals: Goal[]) => void): () => void {
  const coll = collection(db, "users", uid, "goals");
  return onSnapshot(
    coll,
    (snap) => {
      const goals: Goal[] = [];
      snap.forEach((d: any) => {
        const item = d.data();
        if (item) {
          goals.push({ id: d.id, ...item });
        }
      });
      callback(goals);
    },
    (err) => console.error("[watchGoals]", err)
  );
}

// ── 3. Mana Runes (Budgets) ───────────────────────────────────
export async function saveBudgetRune(
  uid: string,
  rune: Partial<CategoryBudgetRune>
): Promise<string> {
  const coll = collection(db, "users", uid, "budgets");
  const docId = rune.id || `rune-${Date.now()}`;
  const now = new Date().toISOString();
  const cleaned = cleanFirestoreData({
    ...rune,
    id: docId,
    updatedAt: now,
  });
  const { id, ...rest } = cleaned as any;
  await setDoc(doc(coll, docId), rest, { merge: true });
  return docId;
}

export async function deleteBudgetRune(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "budgets", id));
}

export function watchBudgetRunes(
  uid: string,
  callback: (runes: CategoryBudgetRune[]) => void
): () => void {
  return onSnapshot(
    collection(db, "users", uid, "budgets"),
    (snap) => {
      const runes: CategoryBudgetRune[] = [];
      snap.forEach((d: any) => {
        const data = d.data() as any;
        if (data && typeof data.category === "string") {
          runes.push({ id: d.id, ...data });
        }
      });
      callback(runes);
    },
    (err) => console.error("[watchBudgetRunes]", err)
  );
}

export async function setBudgetRune(
  uid: string,
  ym: string,
  data: Partial<ManaRune> & { totalBudget?: number; currency?: string; updatedAt?: any }
): Promise<void> {
  const cleaned = cleanFirestoreData({
    ...data,
    monthYear: ym,
    updatedAt: data.updatedAt || new Date().toISOString(),
  });
  await setDoc(doc(db, "users", uid, "budgets", ym), cleaned, { merge: true });
}

export async function deleteMonthlyBudget(uid: string, ym: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "budgets", ym));
}

export async function getBudgetRune(
  uid: string,
  ym: string
): Promise<(ManaRune & { totalBudget?: number }) | null> {
  const snap = await getDoc(doc(db, "users", uid, "budgets", ym));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as any) : null;
}

export function watchBudgetRune(
  uid: string,
  ym: string,
  callback: (budget: (ManaRune & { totalBudget?: number }) | null) => void
): () => void {
  return onSnapshot(
    doc(db, "users", uid, "budgets", ym),
    (snap) => {
      callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as any) : null);
    },
    (err) => console.error("[watchBudgetRune]", err)
  );
}

// ── 4. Perpetual Pacts (Recurring Bills) ───────────────────────
export async function savePerpetualPact(uid: string, pact: Partial<PerpetualPact>): Promise<string> {
  const coll = collection(db, "users", uid, "recurring");
  const docId = pact.id || `pact-${Date.now()}`;
  const now = new Date().toISOString();
  const cleaned = cleanFirestoreData({
    ...pact,
    id: docId,
    uid,
    updatedAt: now,
  });
  const { id, ...rest } = cleaned as any;
  await setDoc(doc(coll, docId), rest, { merge: true });
  return docId;
}

export async function deletePerpetualPact(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "recurring", id));
}

export function watchPerpetualPacts(
  uid: string,
  callback: (pacts: PerpetualPact[]) => void
): () => void {
  return onSnapshot(
    collection(db, "users", uid, "recurring"),
    (snap) => {
      const pacts: PerpetualPact[] = [];
      snap.forEach((d: any) => {
        const item = d.data();
        if (item) pacts.push({ id: d.id, ...(item as any) });
      });
      callback(pacts);
    },
    (err) => console.error("[watchPerpetualPacts]", err)
  );
}

// ── 5. Category Spheres ───────────────────────────────────────
export async function saveCategorySphere(uid: string, cat: Partial<CategorySphere>): Promise<string> {
  const coll = collection(db, "users", uid, "categories");
  const docId = cat.id || `cat-${Date.now()}`;
  const now = new Date().toISOString();
  const cleaned = cleanFirestoreData({
    ...cat,
    id: docId,
    updatedAt: now,
  });
  const { id, ...rest } = cleaned as any;
  await setDoc(doc(coll, docId), rest, { merge: true });
  return docId;
}

export async function deleteCategorySphere(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "categories", id));
}

export function watchCategorySpheres(
  uid: string,
  callback: (cats: CategorySphere[]) => void
): () => void {
  return onSnapshot(
    collection(db, "users", uid, "categories"),
    (snap) => {
      const cats: CategorySphere[] = [];
      snap.forEach((d: any) => {
        const item = d.data();
        if (item) cats.push({ id: d.id, ...(item as any) });
      });
      callback(cats);
    },
    (err) => console.error("[watchCategorySpheres]", err)
  );
}

// ── 6. Hunter Stats & Profile ─────────────────────────────────
export async function getHunterStats(uid: string): Promise<HunterStats | null> {
  const snap = await getDoc(doc(db, "users", uid, "stats", "gamification"));
  return snap.exists() ? (snap.data() as HunterStats) : null;
}

export async function updateHunterStats(uid: string, stats: Partial<HunterStats>): Promise<void> {
  const now = new Date().toISOString();
  const cleaned = cleanFirestoreData({
    ...stats,
    updatedAt: now,
  });
  await setDoc(doc(db, "users", uid, "stats", "gamification"), cleaned, { merge: true });
}
