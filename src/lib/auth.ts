import { auth } from "./firebase";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";

let _currentUser: User | null = null;

export function getCurrentUser(): User | null {
  return auth.currentUser || _currentUser;
}

export function watchAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    _currentUser = user;
    callback(user);
  });
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  const res = await signInWithPopup(auth, provider);
  _currentUser = res.user;
  return res.user;
}

export async function signOutUser(): Promise<void> {
  _currentUser = null;
  try {
    await signOut(auth);
  } finally {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }
}


export function formatAuthError(err: any): string {
  if (!err) return "An unexpected error occurred.";
  const code = err.code || "";
  switch (code) {
    case "auth/popup-closed-by-user":
      return "The Google sign-in window was closed before completing. Please try again.";
    case "auth/popup-blocked":
      return "The sign-in popup was blocked by your browser. Please allow popups for this site and try again.";
    case "auth/cancelled-popup-request":
      return "A sign-in request is already in progress. Please complete or close it.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Google Sign-In in the Firebase Console.";
    case "auth/user-disabled":
      return "This user account has been disabled. Please contact support.";
    default:
      return err.message || "Failed to sign in with Google. Please try again.";
  }
}
