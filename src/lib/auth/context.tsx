"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthUser,
  getSession,
  signInWithCredentials,
  signUpWithCredentials,
  signOut as storeSignOut,
  updateCurrentUser,
  updateCurrentPassword,
} from "./store";

type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => AuthResult;
  signUp: (fullName: string, email: string, password: string) => AuthResult;
  signOut: () => void;
  updateProfile: (patch: { full_name: string }) => AuthUser | null;
  updatePassword: (
    newPassword: string,
  ) => { ok: true } | { ok: false; error: string };
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getSession());
    setLoading(false);

    const sync = () => setUser(getSession());
    window.addEventListener("oryx-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("oryx-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    const result = signInWithCredentials(email, password);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const signUp = useCallback(
    (fullName: string, email: string, password: string) => {
      const result = signUpWithCredentials(fullName, email, password);
      if (result.ok) setUser(result.user);
      return result;
    },
    [],
  );

  const signOut = useCallback(() => {
    storeSignOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback((patch: { full_name: string }) => {
    const next = updateCurrentUser(patch);
    if (next) setUser(next);
    return next;
  }, []);

  const updatePassword = useCallback((newPassword: string) => {
    return updateCurrentPassword(newPassword);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      signIn,
      signUp,
      signOut,
      updateProfile,
      updatePassword,
    }),
    [user, loading, signIn, signUp, signOut, updateProfile, updatePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
