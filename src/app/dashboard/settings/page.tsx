"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/Navbar";
import RouteGuard from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/context";
import { toast } from "sonner";

function SettingsContent() {
  const { user, updatePassword, signOut } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    const result = updatePassword(password);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess("Password updated successfully.");
    setPassword("");
    setConfirm("");
    toast.success("Password updated");
  };

  const handleSignOut = () => {
    signOut();
    toast.success("Signed out of all devices.");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="font-heading font-bold text-2xl text-foreground mb-1">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Manage your account security.
        </p>

        {error && (
          <div className="flex items-center gap-2.5 p-3 mb-6 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2.5 p-3 mb-6 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        <Card className="border-border/50 mb-6">
          <CardHeader className="p-6 pb-0">
            <h2 className="font-heading font-semibold text-base">
              Change Password
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a strong password of at least 8 characters.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    name="confirm"
                    type="password"
                    placeholder="Re-type your password"
                    autoComplete="new-password"
                    className="pl-9"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Separator className="opacity-30" />

              <Button
                type="submit"
                className="gradient-primary border-0 text-white shadow-sm"
                disabled={saving}
              >
                {saving ? "Updating…" : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="p-6 pb-0">
            <h2 className="font-heading font-semibold text-base">Session</h2>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Signed in as{" "}
              <span className="font-medium text-foreground">{user.email}</span>
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RouteGuard>
      <SettingsContent />
    </RouteGuard>
  );
}
