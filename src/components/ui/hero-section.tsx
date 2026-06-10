import Link from "next/link";
import {
  ArrowRight, Building2, Star, Ticket, Crown,
  Landmark, Hotel, Music, Sparkles, Theater, Trophy,
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
      <span className="font-heading text-xl font-bold text-white sm:text-2xl">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-white/45 font-medium sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full items-center overflow-hidden gradient-hero-dark text-white">
      {/* Background image with gradient mask */}
      <div
        className="absolute inset-0 z-0 bg-[url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80)] bg-cover bg-center opacity-20"
        style={{
          maskImage:
            "linear-gradient(180deg, transparent, black 8%, black 58%, transparent)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent, black 8%, black 58%, transparent)",
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,transparent_45%,rgba(0,0,0,0.65))]" />
      {/* Film grain */}
      <div className="hero-grain pointer-events-none absolute inset-0 z-0 opacity-[0.10]" />
      {/* Bottom fade into deep black so the dark hero settles before the page */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-b from-transparent to-[#080304]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-28 pb-20 sm:px-6 md:pt-32 md:pb-24 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10 items-start">
          {/* ── Left ── */}
          <div className="lg:col-span-7 flex flex-col space-y-8 lg:pt-6">
            {/* Badge */}
            <div className="animate-fade-up [animation-delay:0.1s]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md transition-colors hover:bg-white/10">
                <span className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-white/80">
                  Premium Events &amp; Stays
                  <Star className="w-3.5 h-3.5 text-[#ffcd75] fill-[#ffcd75]" />
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1
              className="animate-fade-up [animation-delay:0.2s] font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.92]"
              style={{
                maskImage:
                  "linear-gradient(180deg, black 0%, black 82%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(180deg, black 0%, black 82%, transparent 100%)",
              }}
            >
              Where Great
              <br />
              <span className="text-gradient-gold">Moments</span>
              <br />
              Begin.
            </h1>

            {/* Description */}
            <p className="animate-fade-up [animation-delay:0.3s] max-w-xl text-lg text-white/55 leading-relaxed">
              From exclusive galas to landmark stadium nights — discover the
              finest events across Qatar and Africa, and let us arrange the
              perfect stay to match.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up [animation-delay:0.4s] flex flex-col sm:flex-row gap-4">
              <Link
                href="/events"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#120608] transition-all hover:scale-[1.02] hover:bg-[#ffcd75] active:scale-[0.98]"
              >
                Explore Events
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/hotels"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-white/25"
              >
                <Building2 className="w-4 h-4" />
                Browse Hotels
              </Link>
            </div>
          </div>

          {/* ── Right ── */}
          <div className="lg:col-span-5 space-y-6 lg:mt-2">
            {/* Stats card */}
            <div className="animate-fade-up [animation-delay:0.5s] relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#a81540]/30 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <Ticket className="h-6 w-6 text-[#ffcd75]" />
                  </div>
                  <div>
                    <div className="font-heading text-3xl font-bold tracking-tight text-white">
                      500+
                    </div>
                    <div className="text-sm text-white/50">Events Hosted</div>
                  </div>
                </div>

                {/* Satisfaction bar */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Guest Satisfaction</span>
                    <span className="text-white font-medium">98%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-[#ffcd75] to-[#a81540]" />
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-6" />

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <StatItem value="12" label="Cities" />
                  <div className="w-px h-full bg-white/10 mx-auto" />
                  <StatItem value="50K+" label="Guests" />
                  <div className="w-px h-full bg-white/10 mx-auto" />
                  <StatItem value="24/7" label="Concierge" />
                </div>

                {/* Pills */}
                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-white/70">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6FBF8F] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3F8F63]" />
                    </span>
                    BOOKING OPEN
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-white/70">
                    <Crown className="w-3 h-3 text-[#ffcd75]" />
                    VIP ACCESS
                  </div>
                </div>
              </div>
            </div>

            {/* Marquee card */}
            <div className="animate-fade-up [animation-delay:0.5s] relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-8 backdrop-blur-xl">
              <h3 className="mb-6 px-8 text-sm font-medium text-white/50">
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
                      <partner.icon className="h-5 w-5 text-[#ffcd75]" />
                      <span className="font-heading text-lg font-bold text-white tracking-tight">
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
