"use client";

import { Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Two provider-agnostic ways to email a guest, instead of a single mailto:
// link that forces whatever default mail app is installed (e.g. Outlook).
export default function EmailGuestButtons({
  email,
  subject,
  label = "Email",
}: {
  email: string;
  subject: string;
  label?: string;
}) {
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    email,
  )}&su=${encodeURIComponent(subject)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email address copied.");
    } catch {
      toast.error("Couldn't copy. Email: " + email);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <Button
        variant="outline"
        className="flex-1 min-w-0 gap-2"
        onClick={copy}
        title={email}
      >
        <Copy className="w-4 h-4 shrink-0" />
        <span className="truncate">Copy {label}</span>
      </Button>
      <Button variant="outline" className="flex-1 min-w-0 gap-2" asChild>
        <a href={gmailUrl} target="_blank" rel="noopener noreferrer">
          <Mail className="w-4 h-4 shrink-0" />
          <span className="truncate">Open in Gmail</span>
        </a>
      </Button>
    </div>
  );
}
