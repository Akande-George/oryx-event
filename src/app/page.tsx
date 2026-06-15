import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnimatedEventGrid from "@/components/events/AnimatedEventGrid";
import HeroMonochrome from "@/components/ui/hero-monochrome";
import { getEvents } from "@/lib/supabase/queries";

const stats = [
  { label: "Events Hosted", value: "500+", icon: Calendar },
  { label: "Happy Attendees", value: "50K+", icon: Users },
  { label: "Verified Organizers", value: "120+", icon: Shield },
  { label: "Cities Covered", value: "12", icon: Zap },
];

const categories = [
  {
    label: "Music",
    emoji: "🎵",
    count: 24,
    color: "from-primary/20 to-primary/5",
  },
  {
    label: "Technology",
    emoji: "💻",
    count: 18,
    color: "from-secondary/20 to-secondary/5",
  },
  {
    label: "Arts",
    emoji: "🎨",
    count: 15,
    color: "from-accent/30 to-accent/10",
  },
  {
    label: "Food & Drink",
    emoji: "🍽️",
    count: 21,
    color: "from-primary/15 to-primary/5",
  },
  {
    label: "Sports",
    emoji: "⚽",
    count: 9,
    color: "from-secondary/15 to-secondary/5",
  },
  {
    label: "Fashion",
    emoji: "👗",
    count: 11,
    color: "from-accent/20 to-accent/5",
  },
];

export default async function HomePage() {
  let upcomingEvents: Awaited<ReturnType<typeof getEvents>> = [];

  try {
    upcomingEvents = (await getEvents()).slice(0, 3);
  } catch {
    // Supabase not reachable.
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <HeroMonochrome />

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="py-16 border-y border-border bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-heading font-bold text-3xl text-foreground">
                  {value}
                </p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by Category ─────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary text-sm font-medium mb-2 uppercase tracking-widest">
                Discover
              </p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground">
                Browse by Category
              </h2>
            </div>
            <Link
              href="/events"
              className="hidden sm:flex items-center gap-1 text-sm text-primary hover:underline"
            >
              All events <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={`/events?category=${encodeURIComponent(cat.label)}`}
                className={`bg-gradient-to-br ${cat.color} border border-border/50 rounded-2xl p-5 text-center hover:border-primary/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group`}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </div>
                <p className="font-heading font-semibold text-sm text-foreground">
                  {cat.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cat.count} events
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ────────────────────────────────── */}
      <section className="py-20 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary text-sm font-medium mb-2 uppercase tracking-widest">
                Coming Soon
              </p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground">
                Upcoming Events
              </h2>
            </div>
            <Button
              variant="outline"
              asChild
              className="hidden sm:flex border-border/50 gap-1"
            >
              <Link href="/events">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <AnimatedEventGrid
            events={upcomingEvents}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          />
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="font-heading font-bold text-4xl text-white mb-4">
                Ready to host your event?
              </h2>
              <p className="text-white/80 mb-8 max-w-md mx-auto">
                Reach thousands of eager attendees. Create your event page in
                minutes.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold shadow-xl"
                  asChild
                >
                  <Link href="/admin">Create Event</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
