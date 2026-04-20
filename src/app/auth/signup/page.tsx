import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Metadata } from "next";
import Image from "next/image";
import { signUp } from "@/lib/supabase/actions";

export const metadata: Metadata = {
  title: "Create Account | Oryx Event",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      {/* Left — Branding */}
      <div className="hidden lg:flex bg-primary border-r border-primary/20 flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-1/3 -left-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        <div className="relative max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 shadow-xl">
            <Image src="/logo.png" alt="Oryx Event Logo" width={40} height={40} />
          </div>
          <h2 className="font-heading font-bold text-4xl text-white mb-4 leading-tight">
            Your next experience awaits.
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            Join thousands of event-goers discovering and booking Qatar&apos;s finest experiences.
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

          {error && (
            <div className="flex items-center gap-2.5 p-3 mb-5 rounded-lg bg-destructive/8 border border-destructive/20 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {decodeURIComponent(error)}
            </div>
          )}

          <form className="space-y-4" action={signUp}>
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

        </div>
      </div>
    </div>
  );
}
