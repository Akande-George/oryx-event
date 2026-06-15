import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Star,
  Ticket,
  Crown,
  Landmark,
  Hotel,
  Music,
  Sparkles,
  Theater,
  Trophy,
} from "lucide-react";

// Venues / partners surfaced in the trust marquee.
const PARTNERS = [
  { name: "Waldorf Astoria", icon: Hotel },
  { name: "The St. Regis", icon: Crown },
  { name: "Lusail Stadium", icon: Trophy },
  { name: "Katara Village", icon: Landmark },
  { name: "QNCC", icon: Theater },
  { name: "Mondrian Doha", icon: Sparkles },
  { name: "Gulf Live", icon: Music },
];

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-0.5 cursor-default">
      <span className="font-heading text-xl font-bold text-foreground sm:text-2xl">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full items-center overflow-hidden bg-background text-foreground">
      {/* Light ambient background accents */}
      <div className="pointer-events-none absolute -top-40 -left-24 z-0 h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute top-16 right-0 z-0 h-[24rem] w-[24rem] rounded-full bg-secondary/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 z-0 h-40 bg-gradient-to-b from-transparent to-background" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-28 pb-20 sm:px-6 md:pt-32 md:pb-24 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10 items-start">
          {/* ── Left ── */}
          <div className="lg:col-span-7 flex flex-col space-y-8 lg:pt-6">
            {/* Badge */}
            <div className="animate-fade-up [animation-delay:0.1s]">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 backdrop-blur-md transition-colors hover:bg-muted/70">
                <span className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-foreground/80">
                  Premium Events &amp; Stays
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="animate-fade-up [animation-delay:0.2s] font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.92]">
              Where Great
              <br />
              <span className="text-primary">Moments</span>
              <br />
              Begin.
            </h1>

            {/* Description */}
            <p className="animate-fade-up [animation-delay:0.3s] max-w-xl text-lg text-muted-foreground leading-relaxed">
              From exclusive galas to landmark stadium nights — discover the
              finest events across Qatar and Africa, and let us arrange the
              perfect stay to match.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up [animation-delay:0.4s] flex flex-col sm:flex-row gap-4">
              <Link
                href="/events"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
              >
                Explore Events
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/hotels"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-muted/60 hover:border-primary/30"
              >
                <Building2 className="w-4 h-4" />
                Browse Hotels
              </Link>
            </div>
          </div>

          {/* ── Right ── */}
          <div className="lg:col-span-5 space-y-6 lg:mt-2">
            {/* Stats card */}
            <div className="animate-fade-up [animation-delay:0.5s] relative overflow-hidden rounded-3xl border border-border bg-card p-8 backdrop-blur-xl shadow-xl shadow-primary/10">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                    <Ticket className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-heading text-3xl font-bold tracking-tight text-foreground">
                      500+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Events Hosted
                    </div>
                  </div>
                </div>

                {/* Satisfaction bar */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Guest Satisfaction
                    </span>
                    <span className="text-foreground font-medium">98%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-primary to-secondary" />
                  </div>
                </div>

                <div className="h-px w-full bg-border mb-6" />

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <StatItem value="12" label="Cities" />
                  <div className="w-px h-full bg-border mx-auto" />
                  <StatItem value="50K+" label="Guests" />
                  <div className="w-px h-full bg-border mx-auto" />
                  <StatItem value="24/7" label="Concierge" />
                </div>

                {/* Pills */}
                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                    </span>
                    BOOKING OPEN
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground">
                    <Crown className="w-3 h-3 text-primary" />
                    VIP ACCESS
                  </div>
                </div>
              </div>
            </div>

            {/* Marquee card */}
            <div className="animate-fade-up [animation-delay:0.5s] relative overflow-hidden rounded-3xl border border-border bg-card py-8 backdrop-blur-xl shadow-lg shadow-primary/5">
              <h3 className="mb-6 px-8 text-sm font-medium text-muted-foreground">
                Trusted by leading venues
              </h3>
              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage:
                    "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
                }}
              >
                <div className="animate-marquee flex gap-12 whitespace-nowrap px-4">
                  {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 opacity-45 transition-all hover:opacity-100 hover:scale-105 cursor-default"
                    >
                      <partner.icon className="h-5 w-5 text-primary" />
                      <span className="font-heading text-lg font-bold text-foreground tracking-tight">
                        {partner.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
