import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroMonochrome from "@/components/ui/hero-monochrome";
import EventsShowcase from "@/components/home/EventsShowcase";
import PlanYourVisit from "@/components/home/PlanYourVisit";
import { DestinationCard } from "@/components/ui/card-21";
import { getEvents } from "@/lib/supabase/queries";
import { formatDate, formatTime, stripHtml } from "@/lib/utils";

// "Trending now" destination cards (themeColor = HSL triplet, on-brand).
const TRENDING = [
  {
    location: "Live Events",
    flag: "🎤",
    href: "/events",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    themeColor: "345 65% 26%", // brand maroon
  },
  {
    location: "Hotels & Stays",
    flag: "🏨",
    href: "/hotels",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    themeColor: "150 45% 24%", // brand green
  },
  {
    location: "Explore Qatar",
    flag: "🇶🇦",
    href: "/events",
    image:
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80",
    themeColor: "35 55% 30%", // warm desert gold
  },
];


export default async function HomePage() {
  let allEvents: Awaited<ReturnType<typeof getEvents>> = [];
  try {
    allEvents = await getEvents();
  } catch {
    // Supabase not reachable.
  }

  const featured =
    allEvents.find((e) => e.is_featured) ?? allEvents[0] ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <HeroMonochrome />

      {/* ── Featured spotlight ───────────────────────────── */}
      {featured && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <Link
                href={`/events/${featured.id}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-3xl"
              >
                <Image
                  src={featured.image_url}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>

              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-secondary">
                  Featured Experience
                </p>
                <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground line-clamp-3">
                  {stripHtml(featured.description)}
                </p>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {[
                    {
                      icon: MapPin,
                      label: featured.venue,
                      sub: featured.location,
                    },
                    {
                      icon: CalendarDays,
                      label: formatDate(featured.date),
                      sub: "Date",
                    },
                    {
                      icon: Clock,
                      label: formatTime(featured.date),
                      sub: "Doors open",
                    },
                  ].map(({ icon: Icon, label, sub }, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {label}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild className="gradient-primary border-0 text-white gap-2">
                    <Link href={`/events/${featured.id}`}>
                      Book now <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="gap-2">
                    <a href="tel:+97444931726">
                      <Phone className="h-4 w-4" /> +974 4493 1726
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Trending now (arch cards) ────────────────────── */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
              Trending now in Qatar
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              Discover Qatar&apos;s latest events, premium stays and curated
              experiences across the country.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TRENDING.map((card) => (
              <div key={card.location} className="h-96">
                <DestinationCard
                  imageUrl={card.image}
                  location={card.location}
                  flag={card.flag}
                  href={card.href}
                  themeColor={card.themeColor}
                  stats={
                    card.location === "Live Events"
                      ? `${allEvents.length} events available`
                      : card.location === "Hotels & Stays"
                        ? "Premium hotels & curated stays"
                        : "Tours, concierge & experiences"
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Events grid (tabbed) ─────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-secondary sm:text-4xl">
              Events to keep you at the edge of your seat
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Our events calendar is bursting with surprises — whatever your
              interest, you don&apos;t want to miss out.
            </p>
          </div>

          <EventsShowcase events={allEvents} />

          <div className="mt-10 flex justify-center">
            <Button variant="outline" asChild className="gap-2">
              <Link href="/events">
                See all events <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Plan your visit ──────────────────────────────── */}
      <PlanYourVisit />

      {/* ── CTA banner ───────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="mb-4 font-heading text-4xl font-bold text-white">
                Ready to experience Qatar?
              </h2>
              <p className="mx-auto mb-8 max-w-md text-white/80">
                Browse events, book premium stays, and let Oryx handle the
                details.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="bg-white font-semibold text-primary shadow-xl hover:bg-white/90"
                  asChild
                >
                  <Link href="/events">Browse Events</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 gap-2"
                  asChild
                >
                  <Link href="/hotels">
                    <Building2 className="h-4 w-4" /> Find Hotels
                  </Link>
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
