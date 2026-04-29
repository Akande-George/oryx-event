import Link from "next/link";
import { Mail, MapPin, Phone, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

type IconProps = { className?: string };

const LinkedInIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const InstagramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0-2.16C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.85 5.85 0 0 0-2.13 1.38 5.85 5.85 0 0 0-1.38 2.13c-.3.76-.5 1.64-.56 2.91C0 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.32.79.74 1.46 1.38 2.13a5.85 5.85 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 24 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.85 5.85 0 0 0 2.13-1.38 5.85 5.85 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.85 5.85 0 0 0-1.38-2.13A5.85 5.85 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.84a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
  </svg>
);

const TikTokIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.09z" />
  </svg>
);

const FacebookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.95.93-1.95 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/oryx-group-events-and-tourisim/",
    Icon: LinkedInIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/oryxeventsandtourism",
    Icon: InstagramIcon,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@oryxeventsandtourisim",
    Icon: TikTokIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1Ay2i79n3f/",
    Icon: FacebookIcon,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="Oryx Group" width={32} height={32} />
              <span className="font-heading font-bold text-lg">
                Oryx<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The bridge between elegance and experience. Discover, book, and
              manage premium events across Qatar and Africa.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4 text-foreground">
              Explore
            </h4>
            <ul className="space-y-3">
              {[
                { label: "All Events", href: "/events" },
                { label: "Music", href: "/events?category=Music" },
                { label: "Technology", href: "/events?category=Technology" },
                { label: "Arts", href: "/events?category=Arts" },
                {
                  label: "Food & Drink",
                  href: "/events?category=Food+%26+Drink",
                },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4 text-foreground">
              Account
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Sign In", href: "/auth/login" },
                { label: "Create Account", href: "/auth/signup" },
                { label: "My Tickets", href: "/dashboard" },
                { label: "Organizer Portal", href: "/admin" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4 text-foreground">
              Visit Us
            </h4>
            <a
              href="https://www.oryxgp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-4"
            >
              <Globe className="w-3.5 h-3.5" />
              www.oryxgp.com
            </a>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground mb-1.5">
                  Global HQ — Doha
                </p>
                <p className="flex items-start gap-2 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-primary mt-0.5" />
                  Office 705, 7th Floor, Building 8, Emrair Street, Zone 18, Old
                  Salata - Corniche, Doha, Qatar.
                </p>
                <p className="flex items-center gap-2 mt-1.5">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <a
                    href="mailto:info@oryxgp.com"
                    className="hover:text-foreground"
                  >
                    info@oryxgp.com
                  </a>
                </p>
                <p className="flex items-center gap-2 mt-1.5">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <a
                    href="tel:+97444931726"
                    className="hover:text-foreground"
                  >
                    +974 4493 1726
                  </a>
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground mb-1.5">
                  Africa HQ — Abuja
                </p>
                <p className="flex items-start gap-2 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-secondary mt-0.5" />
                  Office D02, 3rd Floor, The Statement Hotel, 1002 First Avenue,
                  Off Ahmadu Bello Way, Central Business District, FCT, Abuja,
                  Nigeria.
                </p>
                <p className="flex items-center gap-2 mt-1.5">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-secondary" />
                  <a
                    href="mailto:Oryx_africa@oryxgp.com"
                    className="hover:text-foreground"
                  >
                    Oryx_africa@oryxgp.com
                  </a>
                </p>
                <p className="flex items-center gap-2 mt-1.5">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-secondary" />
                  <a
                    href="tel:+2347072342929"
                    className="hover:text-foreground"
                  >
                    +234 707 234 2929
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 opacity-30" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Oryx Group. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
