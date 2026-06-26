"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    // TODO: wire to a real mailing list (Resend audience / provider).
    setDone(true);
    toast.success("You're subscribed — welcome to Oryx.");
    setEmail("");
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <div className="flex items-center rounded-full border border-white/15 bg-white/5 p-1.5 backdrop-blur-sm transition-colors focus-within:border-secondary/50">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:outline-none"
          aria-label="Email address"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-primary text-white transition-transform hover:scale-105 active:scale-95"
        >
          {done ? (
            <Check className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );
}
