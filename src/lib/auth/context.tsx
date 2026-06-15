"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";

type AuthResult = { ok: true; user: AuthUser } | { ok: false; error: string };

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
  created_at: string;
  avatar_url?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (patch: { full_name: string }) => Promise<AuthUser | null>;
  updatePassword: (
    newPassword: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapProfile(
  profile: Partial<Profile> & { id: string; email: string },
): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name?.trim() || profile.email,
    role: (profile.role as "user" | "admin") || "user",
    created_at: profile.created_at || new Date().toISOString(),
    avatar_url: profile.avatar_url || undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    let mounted = true;

    const syncUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!authUser?.id || !authUser.email) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, role, created_at")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!mounted) return;

      setUser(
        mapProfile({
          id: authUser.id,
          email: authUser.email,
          full_name:
            profile?.full_name ||
            (typeof authUser.user_metadata?.full_name === "string"
              ? authUser.user_metadata.full_name
              : authUser.email),
          avatar_url: profile?.avatar_url || undefined,
          role: profile?.role || "user",
          created_at: profile?.created_at || authUser.created_at,
        }),
      );
      setLoading(false);
    };

    syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      syncUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) return { ok: false, error: error.message };

      const authUser = data.user;
      if (!authUser?.id || !authUser.email) {
        return { ok: false, error: "Could not start a session." };
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, role, created_at")
        .eq("id", authUser.id)
        .maybeSingle();

      const next = mapProfile({
        id: authUser.id,
        email: authUser.email,
        full_name:
          profile?.full_name ||
          (typeof authUser.user_metadata?.full_name === "string"
            ? authUser.user_metadata.full_name
            : authUser.email),
        avatar_url: profile?.avatar_url || undefined,
        role: profile?.role || "user",
        created_at: profile?.created_at || authUser.created_at,
      });

      setUser(next);
      return { ok: true, user: next };
    },
    [supabase],
  );

  const signOut = useCallback(() => {
    return supabase.auth.signOut().then(() => {
      setUser(null);
    });
  }, [supabase]);

  const signUp = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
    ): Promise<AuthResult> => {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/api/auth/callback?next=/dashboard`
          : undefined;

      const { error, data } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) return { ok: false, error: error.message };

      const authUser = data.user;
      if (!authUser?.id || !authUser.email) {
        return {
          ok: false,
          error: "Account created, but email confirmation is still required.",
        };
      }

      const next = mapProfile({
        id: authUser.id,
        email: authUser.email,
        full_name: fullName.trim() || authUser.email,
        role: "user",
        created_at: authUser.created_at,
      });

      setUser(next);
      return { ok: true, user: next };
    },
    [supabase],
  );

  const updateProfile = useCallback(
    async (patch: { full_name: string }) => {
      if (!user) return null;

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: patch.full_name.trim() })
        .eq("id", user.id);

      if (error) return null;

      await supabase.auth.updateUser({
        data: { full_name: patch.full_name.trim() },
      });

      const next = { ...user, full_name: patch.full_name.trim() };
      setUser(next);
      return next;
    },
    [supabase, user],
  );

  const updatePassword = useCallback(
    async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) return { ok: false as const, error: error.message };
      return { ok: true as const };
    },
    [supabase],
  );

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
