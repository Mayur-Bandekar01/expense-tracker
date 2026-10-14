import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDiX_-tlEEfLReDE1Sn7UfwMUETRZY-NmQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "paisa-pulse-285ee.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "paisa-pulse-285ee",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "paisa-pulse-285ee.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "372749541687",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:372749541687:web:7bc90c4df758f92f613ab2",
};

// Singleton initialization for Next.js (SSR / Client safe)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

function initDb() {
  if (typeof window === "undefined") {
    return getFirestore(app);
  }
  try {
    return initializeFirestore(app, {
      ignoreUndefinedProperties: true,
    });
  } catch (_e) {
    // If already initialized or settings cannot be modified, return active instance
    return getFirestore(app);
  }
}

export const db = initDb();
