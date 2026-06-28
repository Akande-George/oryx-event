"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

// Background slideshow — photos from public/homeslides.
const SLIDES = [
  {
    src: "/homeslides/world-cup-festival-2022-doha-corniche.jpg",
    caption: "Festivals on the Doha Corniche",
  },
  {
    src: "/homeslides/Music-event-concert.jpg",
    caption: "Live music & concerts",
  },
  {
    src: "/homeslides/p1.jpg",
    caption: "Curated experiences across Qatar",
  },
  {
    src: "/homeslides/p3.jpg",
    caption: "Premium events & gatherings",
  },
  {
    src: "/homeslides/Screenshot-2024-10-24-at-10.29.41%20AM.jpg",
    caption: "Unforgettable moments",
  },
];

const AUTO_MS = 6000;

export default function HeroMonochrome() {
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (dir: number) =>
      setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length),
    [],
  );

  // Auto-advance.
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTO_MS);
    return () => clearInterval(id);
  }, [index]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0d0708] font-sans text-white">
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.src}
            alt={slide.caption}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* Overlays for legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* Brand colour washes */}
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pt-28 pb-28 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-md">
            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/85 sm:text-xs">
              Qatar&apos;s Leading Events &amp; Tourism Company
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            </span>
          </div>

          <h1 className="mt-6 font-heading text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Crafting Unforgettable
            <br />
            <span className="bg-gradient-to-br from-white via-white to-secondary bg-clip-text text-transparent">
              Experiences
            </span>{" "}
            Across Qatar
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            From premium events to curated stays, we deliver experiences aligned
            with Qatar National Vision 2030 — designed to delight every guest and
            elevate every moment.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/events"
              className="group inline-flex items-center justify-center gap-2 rounded-full gradient-primary px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Events
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/hotels"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <Building2 className="h-4 w-4" />
              Browse Hotels
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 sm:left-6"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 sm:right-6"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Caption + dots */}
      <div className="absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          {SLIDES[index].caption}
        </p>
        <div className="flex items-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rotating accent ring */}
      <div className="pointer-events-none absolute bottom-8 right-6 z-20 hidden h-20 w-20 items-center justify-center sm:flex">
        <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-secondary" />
        <motion.svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <defs>
            <path
              id="oryx-ring"
              d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
            />
          </defs>
          <text className="fill-white/70 text-[8px] uppercase tracking-[0.2em]">
            <textPath href="#oryx-ring" startOffset="0%">
              Oryx Group · Est. 2019 · Doha · Qatar ·
            </textPath>
          </text>
        </motion.svg>
      </div>
    </section>
  );
}
