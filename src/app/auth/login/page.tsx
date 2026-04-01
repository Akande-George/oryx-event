import Link from "next/link";
import { Ticket, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Metadata } from "next";
import Image from "next/image";
import { signIn } from "@/lib/supabase/actions";

export const metadata: Metadata = {
  title: "Sign In | Oryx Event",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex bg-primary border-r border-primary/20 flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-1/4 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="relative text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
          </div>
          <h2 className="font-heading font-bold text-4xl text-white mb-4">Welcome back.</h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Sign in to access your tickets, manage bookings, and discover new events.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">Oryx<span className="text-primary">.</span></span>
          </div>

          <h1 className="font-heading font-bold text-2xl text-foreground mb-2">Sign in</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
              Create one free
            </Link>
          </p>

          {error && (
            <div className="flex items-center gap-2.5 p-3 mb-5 rounded-lg bg-destructive/8 border border-destructive/20 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {decodeURIComponent(error)}
            </div>
          )}

          <form className="space-y-5" action={signIn}>
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="login-password" name="password" type="password" placeholder="••••••••" required />
            </div>

            <Button type="submit" className="w-full gradient-primary border-0 text-white shadow-lg shadow-primary/20 hover:opacity-90 mt-2">
              Sign in
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}
