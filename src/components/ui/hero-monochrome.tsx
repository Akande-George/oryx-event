"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, Calendar } from "lucide-react";

const STYLE_ID = "oryx-hero-monochrome-animations";

function AnimatedGlyph() {
  return (
    <svg viewBox="0 0 120 120" className="h-14 w-14" aria-hidden>
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="motion-safe:animate-[oryx-hero-orbit_8s_linear_infinite] motion-reduce:animate-none"
        style={{ strokeDasharray: "12 10" }}
      />
      <circle cx="60" cy="60" r="30" fill="currentColor" opacity="0.08" />
      <path
        d="M60 38v44"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="motion-safe:animate-[oryx-hero-trace_6s_ease-in-out_infinite] motion-reduce:animate-none"
      />
      <path
        d="M42 60h36"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="motion-safe:animate-[oryx-hero-trace_6s_ease-in-out_infinite] motion-reduce:animate-none"
        style={{ animationDelay: "0.45s" }}
      />
      <circle
        cx="60"
        cy="12"
        r="6"
        fill="currentColor"
        className="motion-safe:animate-[oryx-hero-node_2.8s_ease-in-out_infinite] motion-reduce:animate-none"
      />
    </svg>
  );
}

export default function HeroMonochrome() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.innerHTML = `
      @keyframes oryx-hero-intro {
        0% { opacity: 0; transform: translate3d(0, 40px, 0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes oryx-hero-card {
        0% { opacity: 0; transform: translate3d(0, 24px, 0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes oryx-hero-orbit {
        0% { stroke-dashoffset: 0; transform: rotate(0deg); }
        100% { stroke-dashoffset: -44; transform: rotate(360deg); }
      }
      @keyframes oryx-hero-node {
        0%, 100% { transform: translateY(0); opacity: 1; }
        50% { transform: translateY(6px); opacity: 0.55; }
      }
      @keyframes oryx-hero-trace {
        0%, 30% { stroke-dasharray: 0 160; opacity: 0; }
        45%, 65% { stroke-dasharray: 160 0; opacity: 1; }
        100% { stroke-dasharray: 0 160; opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current || typeof window === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_65%_90%_at_12%_-10%,rgba(122,15,43,0.07),transparent_62%),radial-gradient(ellipse_45%_65%_at_88%_-20%,rgba(63,143,99,0.08),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 [background-image:radial-gradient(circle_at_25%_25%,rgba(17,17,17,0.10)_0.7px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(17,17,17,0.06)_0.7px,transparent_1px)] [background-size:12px_12px]" />

      <div className="pointer-events-none absolute -left-20 top-10 -z-10 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-28 -z-10 h-80 w-80 rounded-full bg-secondary/8 blur-3xl" />

      <section
        ref={sectionRef}
        className={`relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-14 px-4 py-24 sm:px-6 lg:px-8 ${
          visible
            ? "motion-safe:animate-[oryx-hero-intro_0.9s_cubic-bezier(.25,.9,.3,1)_forwards]"
            : "opacity-0"
        }`}
      >
        <header className="grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-end">
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.35em]">
              <span className="rounded-full border border-border bg-card/80 px-4 py-1 text-foreground/80 backdrop-blur-sm">
                Premium Events & Stays
              </span>
              <span className="text-muted-foreground">Hero / Monochrome</span>
            </div>

            <div className="space-y-6">
              <h1 className="font-heading text-5xl font-semibold leading-[0.96] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-8xl">
                Where great
                <br />
                moments begin
                <br />
                with clarity.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                Discover refined event experiences, premium hotel stays, and a
                calmer booking flow designed to feel editorial, trustworthy, and
                unmistakably modern.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Explore events
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/hotels"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card/80 px-6 py-3 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card"
              >
                <Building2 className="h-4 w-4" />
                Browse hotels
              </Link>
            </div>
          </div>

          <div className="relative flex w-full items-stretch overflow-hidden rounded-[2rem] border border-border bg-card/90 shadow-[0_40px_120px_-60px_rgba(15,15,15,0.22)] backdrop-blur-xl">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-muted/40" />
            <figure className="relative flex w-full flex-col">
              <div className="relative w-full overflow-hidden rounded-t-[2rem]">
                <div className="relative w-full pb-[110%] md:pb-[82%] lg:pb-[112%]">
                  <div
                    className="absolute inset-0 bg-cover bg-center grayscale"
                    style={{
                      backgroundImage:
                        "url(https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80)",
                    }}
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/8" />
                  <div className="pointer-events-none absolute inset-0 border border-black/5" />

                  <div className="absolute left-6 top-6 flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white/70 text-foreground shadow-sm backdrop-blur-sm">
                    <AnimatedGlyph />
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/60 bg-white/72 p-5 shadow-lg backdrop-blur-md">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-heading text-2xl font-bold text-foreground">
                          500+
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Events hosted
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Guest satisfaction
                        </span>
                        <span className="font-medium text-foreground">98%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-primary to-secondary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <figcaption className="flex items-center justify-between px-6 py-5 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span>Editorial booking</span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Oryx launch canvas
                </span>
              </figcaption>
            </figure>
          </div>
        </header>
      </section>
    </section>
  );
}
