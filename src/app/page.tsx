import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, ChevronRight, Shield, Star, Ticket, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnimatedEventGrid from "@/components/events/AnimatedEventGrid";
import { mockEvents } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const stats = [
  { label: "Events Hosted", value: "500+", icon: Calendar },
  { label: "Happy Attendees", value: "50K+", icon: Users },
  { label: "Verified Organizers", value: "120+", icon: Shield },
  { label: "Cities Covered", value: "12", icon: Zap },
];

const categories = [
  { label: "Music", emoji: "🎵", count: 24, color: "from-primary/20 to-primary/5" },
  { label: "Technology", emoji: "💻", count: 18, color: "from-blue-500/20 to-blue-500/5" },
  { label: "Arts", emoji: "🎨", count: 15, color: "from-purple-500/20 to-purple-500/5" },
  { label: "Food & Drink", emoji: "🍽️", count: 21, color: "from-secondary/20 to-secondary/5" },
  { label: "Sports", emoji: "⚽", count: 9, color: "from-orange-500/20 to-orange-500/5" },
  { label: "Fashion", emoji: "👗", count: 11, color: "from-pink-500/20 to-pink-500/5" },
];

const featuredEvent = mockEvents[0];
const upcomingEvents = mockEvents.slice(1, 4);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden gradient-hero pt-16">
        {/* Decorative blobs */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-secondary/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left — Copy */}
          <div>
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-3 py-1.5 text-sm font-medium">
              <Star className="w-3.5 h-3.5 mr-1.5" /> Premium Event Management
            </Badge>
            <h1 className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[1.06] mb-6">
              Where Great{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">Moments</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-primary/15 -rotate-1 rounded" />
              </span>{" "}
              Begin.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-8">
              Discover Nigeria's finest events — from exclusive jazz nights to tech summits. Book your tickets in seconds and arrive in style.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gradient-primary border-0 text-white shadow-xl shadow-primary/30 hover:opacity-90 px-7" asChild>
                <Link href="/events">Explore Events <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-border/50 bg-background/50 backdrop-blur-sm">
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </div>

            {/* Avatars */}
            <div className="flex items-center gap-3 mt-8">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-secondary"
                    style={{ zIndex: 4 - i }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">2,400+</span> tickets booked this week
              </p>
            </div>
          </div>

          {/* Right — Featured event card */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl blur-xl" />
              <div className="relative glass-card overflow-hidden rounded-3xl border-black/8">
                <div className="relative h-64">
                  <Image
                    src={featuredEvent.image_url}
                    alt={featuredEvent.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-primary/90 text-white border-0 mb-2 text-xs">Featured Event</Badge>
                    <h3 className="font-heading font-bold text-white text-lg leading-snug">{featuredEvent.title}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {formatDate(featuredEvent.date)}
                    </div>
                  </div>
                  <Button className="w-full gradient-primary border-0 text-white" asChild>
                    <Link href={`/events/${featuredEvent.id}`}>
                      Get Tickets <Ticket className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl px-3 py-2 border border-black/8 shadow-md">
                <div className="flex items-center gap-1.5 text-xs text-foreground">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">4.9</span>
                  <span className="text-muted-foreground">rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="py-16 border-y border-border bg-slate-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-heading font-bold text-3xl text-foreground">{value}</p>
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
              <p className="text-primary text-sm font-medium mb-2 uppercase tracking-widest">Discover</p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground">Browse by Category</h2>
            </div>
            <Link href="/events" className="hidden sm:flex items-center gap-1 text-sm text-primary hover:underline">
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
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.emoji}</div>
                <p className="font-heading font-semibold text-sm text-foreground">{cat.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{cat.count} events</p>
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
              <p className="text-primary text-sm font-medium mb-2 uppercase tracking-widest">Coming Soon</p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground">Upcoming Events</h2>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex border-border/50 gap-1">
              <Link href="/events">View all <ArrowRight className="w-4 h-4" /></Link>
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
                Reach thousands of eager attendees. Create your event page in minutes.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-xl" asChild>
                  <Link href="/admin">Create Event</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
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
