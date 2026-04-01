import Link from "next/link";
import { Eye, EyeOff, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign In | Oryx Event",
};

export default function LoginPage() {
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

          <form className="space-y-5" action="/api/auth/login" method="POST">
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

          <div className="relative my-6">
            <Separator className="opacity-30" />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-background text-xs text-muted-foreground">
              or
            </span>
          </div>

          <Button variant="outline" className="w-full border-border/50 gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
