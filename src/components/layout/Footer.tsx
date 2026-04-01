import Link from "next/link";
import { Ticket, Mail, MapPin, Phone, Share2, MessageSquare, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const SocialIcon = ({ children }: { children: React.ReactNode }) => (
  <a
    href="#"
    className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
  >
    {children}
  </a>
);

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="Logo" width={32} height={32} />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The bridge between elegance and experience. Discover, book, and manage premium events across Nigeria.
            </p>
            <div className="flex items-center gap-3">
              <SocialIcon><Share2 className="w-3.5 h-3.5" /></SocialIcon>
              <SocialIcon><MessageSquare className="w-3.5 h-3.5" /></SocialIcon>
              <SocialIcon><Globe className="w-3.5 h-3.5" /></SocialIcon>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4 text-foreground">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: "All Events", href: "/events" },
                { label: "Music", href: "/events?category=Music" },
                { label: "Technology", href: "/events?category=Technology" },
                { label: "Arts", href: "/events?category=Arts" },
                { label: "Food & Drink", href: "/events?category=Food+%26+Drink" },
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
            <h4 className="font-heading font-semibold text-sm mb-4 text-foreground">Account</h4>
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
            <h4 className="font-heading font-semibold text-sm mb-4 text-foreground">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                Victoria Island, Lagos, Nigeria
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-3.5 h-3.5 shrink-0 text-primary" />
                hello@oryxevent.com
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5 shrink-0 text-primary" />
                +234 800 000 0000
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 opacity-30" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Oryx Event. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
