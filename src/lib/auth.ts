import { auth } from "./firebase";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  signOut,
  User,
} from "firebase/auth";

let _currentUser: User | null = null;

function createGoogleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export function getCurrentUser(): User | null {
  return auth.currentUser || _currentUser;
}

export function watchAuth(callback: (user: User | null) => void): () => void {
  if (typeof window !== "undefined") {
    // Resolve any pending mobile redirect sign-in
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          _currentUser = res.user;
          callback(res.user);
        }
      })
      .catch((err) => {
        console.warn("[Auth] Redirect check:", err?.code || err);
      });
  }

  return onAuthStateChanged(auth, (user) => {
    _currentUser = user;
    callback(user);
  });
}

/**
 * Signs in with Google across Desktop & Mobile.
 * Uses Popup first for speed; automatically falls back to Redirect if blocked on mobile.
 */
export async function signInWithGoogle(forceRedirect = false): Promise<User | null> {
  const provider = createGoogleProvider();

  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (_e) {}

  if (forceRedirect) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  try {
    const res = await signInWithPopup(auth, provider);
    _currentUser = res.user;
    return res.user;
  } catch (err: any) {
    const code = err?.code || "";
    // Auto-fallback to redirect on mobile browsers that block popups or webviews
    if (
      code === "auth/popup-blocked" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw err;
  }
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
      return "The sign-in window was closed before completing. Tap 'Continue with Google' or try 'Mobile Redirect' below.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Tap 'Use Mobile Redirect Sign-In' below to continue.";
    case "auth/cancelled-popup-request":
      return "A sign-in request is already open. Please complete it or try again.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not yet authorized in Firebase Console → Authentication → Settings → Authorized domains.";
    case "auth/user-disabled":
      return "This user account has been disabled.";
    default:
      return err.message || "Failed to sign in with Google. Please try again.";
  }
}
