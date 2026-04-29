import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Oryx Group",
};

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: "By accessing or using the Oryx Group platform you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.",
  },
  {
    title: "2. Eligibility",
    body: "You must be at least 18 years old to purchase tickets or create an account. By using the platform you confirm that the information you provide is accurate and that you have the legal capacity to enter into binding agreements.",
  },
  {
    title: "3. Ticket sales",
    body: "All ticket sales are final unless the event is cancelled or rescheduled by the organiser. Refunds, where applicable, will be processed using the original payment method within 14 business days.",
  },
  {
    title: "4. Conduct at events",
    body: "Attendees must comply with the venue and organiser rules including dress code, security checks, and age restrictions. Oryx Group reserves the right to deny entry where these rules are not met.",
  },
  {
    title: "5. Account responsibility",
    body: "You are responsible for keeping your account credentials secure. Notify us immediately if you suspect unauthorised access to your account.",
  },
  {
    title: "6. Intellectual property",
    body: "All branding, designs, content and trademarks on the platform are owned by Oryx Group or our licensors. You may not copy, modify or distribute them without prior written permission.",
  },
  {
    title: "7. Limitation of liability",
    body: "Oryx Group provides the platform on an 'as is' basis. To the fullest extent permitted by law, we are not liable for indirect, incidental or consequential damages arising from your use of the platform or attendance at any event.",
  },
  {
    title: "8. Governing law",
    body: "These terms are governed by the laws of the State of Qatar. Disputes shall be resolved by the competent courts of Doha, Qatar, without prejudice to mandatory consumer-protection rights in your country of residence.",
  },
  {
    title: "9. Contact",
    body: "Questions about these terms? Reach our Global HQ at info@oryxgp.com or our Africa HQ at Oryx_africa@oryxgp.com.",
  },
];

export default function TermsPage() {
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
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-foreground">
            Terms of Service
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: 28 April 2026
        </p>

        <p className="text-base text-muted-foreground leading-relaxed mb-10">
          These Terms of Service govern your use of the Oryx Group event
          platform. Please read them carefully — together with our Privacy
          Policy they form the agreement between you and Oryx Group.
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
