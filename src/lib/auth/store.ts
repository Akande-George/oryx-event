"use client";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
  created_at: string;
};

type StoredUser = AuthUser & { password: string };

const USERS_KEY = "oryx_demo_users";
const SESSION_KEY = "oryx_demo_session";

const SEED_USERS: StoredUser[] = [
  {
    id: "admin-001",
    email: "admin@oryxgp.com",
    password: "Admin@2026",
    full_name: "Oryx Administrator",
    role: "admin",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "customer-001",
    email: "customer@oryxgp.com",
    password: "Customer@2026",
    full_name: "Demo Customer",
    role: "user",
    created_at: "2026-02-15T00:00:00.000Z",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function readUsers(): StoredUser[] {
  if (!isBrowser()) return [...SEED_USERS];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) {
      window.localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
      return [...SEED_USERS];
    }
    const parsed = JSON.parse(raw) as StoredUser[];
    // Make sure seed accounts always exist (even after manual clears or signup overwrites)
    const merged = [...parsed];
    for (const seed of SEED_USERS) {
      if (!merged.some((u) => u.email.toLowerCase() === seed.email.toLowerCase())) {
        merged.push(seed);
      }
    }
    if (merged.length !== parsed.length) {
      window.localStorage.setItem(USERS_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return [...SEED_USERS];
  }
}

function writeUsers(users: StoredUser[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublic(user: StoredUser): AuthUser {
  const { password: _password, ...rest } = user;
  return rest;
}

export function getSession(): AuthUser | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function setSession(user: AuthUser | null) {
  if (!isBrowser()) return;
  if (!user) {
    window.localStorage.removeItem(SESSION_KEY);
  } else {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new CustomEvent("oryx-auth-change"));
}

export function signInWithCredentials(
  email: string,
  password: string,
): { ok: true; user: AuthUser } | { ok: false; error: string } {
  const users = readUsers();
  const match = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!match) {
    return { ok: false, error: "No account found with that email." };
  }
  if (match.password !== password) {
    return { ok: false, error: "Incorrect password. Please try again." };
  }
  const publicUser = toPublic(match);
  setSession(publicUser);
  return { ok: true, user: publicUser };
}

export function signUpWithCredentials(
  fullName: string,
  email: string,
  password: string,
): { ok: true; user: AuthUser } | { ok: false; error: string } {
  const users = readUsers();
  const trimmedEmail = email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
    return { ok: false, error: "An account with that email already exists." };
  }
  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    email: email.trim(),
    password,
    full_name: fullName.trim() || email.trim(),
    role: "user",
    created_at: new Date().toISOString(),
  };
  writeUsers([...users, newUser]);
  const publicUser = toPublic(newUser);
  setSession(publicUser);
  return { ok: true, user: publicUser };
}

export function signOut() {
  setSession(null);
}

export function updateCurrentUser(
  patch: Partial<Pick<AuthUser, "full_name">>,
): AuthUser | null {
  const session = getSession();
  if (!session) return null;
  const users = readUsers();
  const updated = users.map((u) =>
    u.id === session.id ? { ...u, ...patch } : u,
  );
  writeUsers(updated);
  const next = { ...session, ...patch };
  setSession(next);
  return next;
}

export function updateCurrentPassword(
  newPassword: string,
): { ok: true } | { ok: false; error: string } {
  const session = getSession();
  if (!session) return { ok: false, error: "You must be signed in." };
  const users = readUsers();
  const updated = users.map((u) =>
    u.id === session.id ? { ...u, password: newPassword } : u,
  );
  writeUsers(updated);
  return { ok: true };
}
