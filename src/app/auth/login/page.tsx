"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Ticket, AlertCircle, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useAuth } from "@/lib/auth/context";
import { toast } from "sonner";

const DEMO_ACCOUNTS = [
  {
    label: "Customer",
    email: "customer@oryxgp.com",
    password: "Customer@2026",
    description: "Browse events, book tickets and view your dashboard.",
  },
  {
    label: "Admin",
    email: "admin@oryxgp.com",
    password: "Admin@2026",
    description: "Full access to events, packages, orders & analytics.",
  },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const queryError = params.get("error");

  const { signIn, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) router.replace(next);
  }, [authLoading, user, router, next]);

  useEffect(() => {
    if (queryError) setError(decodeURIComponent(queryError));
  }, [queryError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = signIn(email, password);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    toast.success(`Welcome back, ${result.user.full_name.split(" ")[0]}!`);
    const target =
      result.user.role === "admin" && next === "/dashboard" ? "/admin" : next;
    router.replace(target);
  };

  const useDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-primary border-r border-primary/20 flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-1/4 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="relative text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Image src="/logo.png" alt="Oryx Group" width={40} height={40} />
          </div>
          <h2 className="font-heading font-bold text-4xl text-white mb-4">
            Welcome back.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Sign in to access your tickets, manage bookings, and discover new
            events across Qatar and Africa.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">
              Oryx<span className="text-primary">.</span>
            </span>
          </div>

          <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
            Sign in
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary hover:underline font-medium"
            >
              Create one free
            </Link>
          </p>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Demo accounts
              </p>
            </div>
            <div className="space-y-2.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <div
                  key={acc.email}
                  className="flex items-start gap-2 rounded-lg bg-background/60 border border-border/50 p-2.5 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{acc.label}</p>
                    <p className="text-muted-foreground truncate">
                      {acc.email}
                    </p>
                    <p className="text-muted-foreground font-mono text-[11px]">
                      {acc.password}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => useDemo(acc.email, acc.password)}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Use
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText(`${acc.email} / ${acc.password}`)}
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      {copied === `${acc.email} / ${acc.password}` ? (
                        <>
                          <Check className="w-3 h-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3 mb-5 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary border-0 text-white shadow-lg shadow-primary/20 hover:opacity-90 mt-2"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
