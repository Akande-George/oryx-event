import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Lock, CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/Navbar";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { updatePassword, signOut } from "@/lib/supabase/actions";

export const metadata: Metadata = {
  title: "Settings | Oryx Event",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { error, success } = await searchParams;

  const isOAuth = (user.app_metadata?.provider ?? "email") !== "email";

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="font-heading font-bold text-2xl text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground mb-8">Manage your account security.</p>

        {error && (
          <div className="flex items-center gap-2.5 p-3 mb-6 rounded-lg bg-destructive/8 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {decodeURIComponent(error)}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2.5 p-3 mb-6 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {decodeURIComponent(success)}
          </div>
        )}

        {/* Password */}
        <Card className="border-border/50 mb-6">
          <CardHeader className="p-6 pb-0">
            <h2 className="font-heading font-semibold text-base">Change Password</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isOAuth
                ? "You signed in with a social provider. Password changes are not available."
                : "Choose a strong password of at least 8 characters."}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {isOAuth ? (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-sm text-muted-foreground">
                Password management is handled by your sign-in provider.
              </div>
            ) : (
              <form action={updatePassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      className="pl-9"
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
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <Separator className="opacity-30" />

                <Button type="submit" className="gradient-primary border-0 text-white shadow-sm">
                  Update Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Sign out */}
        <Card className="border-border/50">
          <CardHeader className="p-6 pb-0">
            <h2 className="font-heading font-semibold text-base">Session</h2>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Signed in as <span className="font-medium text-foreground">{user.email}</span>
            </p>
            <form action={signOut}>
              <Button
                type="submit"
                variant="outline"
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" /> Sign out of all devices
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
