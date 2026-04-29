import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Oryx Group",
};

const SECTIONS = [
  {
    title: "1. Information we collect",
    body: "We collect information you provide directly such as your name, email address, phone number, billing details, and the events you attend. We also collect device information, usage analytics, and cookies that help us improve your booking experience.",
  },
  {
    title: "2. How we use your information",
    body: "Your information is used to deliver tickets, process payments, share event updates, prevent fraud, and personalise our services. We do not sell your personal data to third parties under any circumstances.",
  },
  {
    title: "3. Sharing with event organisers",
    body: "When you purchase a ticket, we share the necessary attendee details (full name, email, ticket type, quantity) with the event organiser so they can fulfil your booking and contact you about the event.",
  },
  {
    title: "4. Payments",
    body: "Card and bank details are processed by our PCI-DSS compliant payment partners. Oryx Group does not store full card numbers on our servers.",
  },
  {
    title: "5. Cookies",
    body: "We use essential cookies to keep you signed in and remember your preferences, and analytics cookies to understand how the platform is used. You can control cookies through your browser settings at any time.",
  },
  {
    title: "6. Your rights",
    body: "You may access, correct, export, or request the deletion of your personal data at any time by contacting info@oryxgp.com. We will respond within 30 days of your request.",
  },
  {
    title: "7. Contact",
    body: "Questions about this policy can be sent to info@oryxgp.com or to our Global HQ in Doha, Qatar.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-foreground">
            Privacy Policy
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: 28 April 2026
        </p>

        <p className="text-base text-muted-foreground leading-relaxed mb-10">
          At Oryx Group, your privacy matters. This policy explains what
          information we collect when you use our event-management platform, how
          we use it, and the choices you have.
        </p>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-heading font-semibold text-lg text-foreground mb-2">
                {section.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
