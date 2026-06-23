"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [status, setStatus] = useState<"checking" | "ready" | "invalid">(
    "checking",
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Establish the recovery session from the URL hash that Supabase appended to
  // the reset link (#access_token=…&refresh_token=…&type=recovery).
  useEffect(() => {
    let active = true;
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : "";
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    async function init() {
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (!active) return;
        setStatus(error ? "invalid" : "ready");
      } else {
        // The SSR client may have already consumed the hash; fall back to it.
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        setStatus(data.session ? "ready" : "invalid");
      }
      // Clean the tokens out of the address bar.
      window.history.replaceState(null, "", window.location.pathname);
    }
    init();
    return () => {
      active = false;
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1800);
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
            Almost there.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Choose a new password and you&apos;ll be back to your events in
            seconds.
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

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>

          <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
            Set a new password
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Enter a new password for your account.
          </p>

          {status === "checking" && (
            <p className="text-sm text-muted-foreground">Verifying link…</p>
          )}

          {status === "invalid" && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">
                <p className="font-semibold mb-1">Link expired or invalid</p>
                <p>
                  Reset links can only be used once and expire after an hour.{" "}
                  <Link
                    href="/auth/forgot-password"
                    className="underline font-medium"
                  >
                    Request a new one
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}

          {status === "ready" && done && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">Password updated</p>
                <p>Signing you in…</p>
              </div>
            </div>
          )}

          {status === "ready" && !done && (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={show ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={show ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {show ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={show ? "text" : "password"}
                  placeholder="Re-type your password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                loading={loading}
                className="w-full gradient-primary border-0 text-white shadow-lg shadow-primary/20 hover:opacity-90"
              >
                Update password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
