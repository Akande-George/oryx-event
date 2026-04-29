"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search as SearchIcon, X, Calendar, MapPin, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventCard from "@/components/events/EventCard";
import { mockEvents } from "@/lib/mock-data";

const SUGGESTED = ["Music", "Doha", "Tech", "Food", "Fashion", "Lusail"];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return mockEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="text-center mb-10">
          <p className="text-primary text-sm font-medium mb-2 uppercase tracking-widest">
            Search
          </p>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl text-foreground mb-4">
            Find your next experience
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Search across all events by title, venue, city, or category.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, venues, categories…"
            autoFocus
            className="pl-12 pr-12 h-14 text-base rounded-2xl border-border/60 shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {!query && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mr-1">
              Try searching for:
            </span>
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-muted/40 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {query && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"} for{" "}
              <span className="font-medium text-foreground">
                &ldquo;{query}&rdquo;
              </span>
            </p>
            {results.length === 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/events">Browse all events</Link>
              </Button>
            )}
          </div>
        )}

        {query && results.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border/50">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">
              No matches found
            </h3>
            <p className="text-muted-foreground text-sm mb-5">
              We couldn&apos;t find any events matching &ldquo;{query}&rdquo;.
              Try a different keyword.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" onClick={() => setQuery("")}>
                Clear search
              </Button>
              <Button asChild className="gradient-primary border-0 text-white">
                <Link href="/events">
                  <Calendar className="w-4 h-4 mr-1" /> Browse all events
                </Link>
              </Button>
            </div>
          </div>
        )}

        {!query && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents
              .filter((e) => e.is_featured)
              .slice(0, 3)
              .map((event) => (
                <div key={event.id} className="relative">
                  <Badge className="absolute top-3 right-3 z-10 bg-primary/90 text-white border-0 gap-1">
                    <MapPin className="w-3 h-3" />
                    Featured
                  </Badge>
                  <EventCard event={event} />
                </div>
              ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
