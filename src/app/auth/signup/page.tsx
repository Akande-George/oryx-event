import Link from "next/link";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Create Account | Oryx Event",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      {/* Left — Branding */}
      <div className="hidden lg:flex bg-primary border-r border-primary/20 flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-1/3 -left-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        <div className="relative max-w-sm">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-xl shadow-primary/30">
            <Ticket className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-heading font-bold text-4xl text-white mb-4 leading-tight">
            Your next experience awaits.
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            Join thousands of event-goers discovering and booking Nigeria&apos;s finest experiences.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "500+", label: "Events" },
              { value: "50K+", label: "Attendees" },
              { value: "4.9★", label: "Rating" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3">
                <p className="font-heading font-bold text-white text-lg">{value}</p>
                <p className="text-white/50 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Image src="/logo.png" alt="Logo" width={32} height={32} />
            </div>
            <span className="font-heading font-bold text-lg">Oryx<span className="text-primary">.</span></span>
          </div>

          <h1 className="font-heading font-bold text-2xl text-foreground mb-2">Create account</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <form className="space-y-4" action="/api/auth/signup" method="POST">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <Input id="signup-name" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" name="password" type="password" placeholder="Min. 8 characters" required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-confirm">Confirm Password</Label>
              <Input id="signup-confirm" name="confirm" type="password" placeholder="Re-type your password" required />
            </div>

            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>

            <Button type="submit" className="w-full gradient-primary border-0 text-white shadow-lg shadow-primary/20 hover:opacity-90 mt-1">
              Create Account
            </Button>
          </form>

          <div className="relative my-6">
            <Separator className="opacity-30" />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-background text-xs text-muted-foreground">or</span>
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
