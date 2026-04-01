"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Calendar, MapPin, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventCard from "@/components/events/EventCard";
import { mockEvents } from "@/lib/mock-data";
import { EventCategory } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORIES: EventCategory[] = [
  "Music", "Sports", "Arts", "Food & Drink", "Business", "Technology", "Comedy", "Fashion", "Other",
];

const LOCATIONS = ["Doha", "Lusail", "Al Wakrah", "Al Khor", "Dukhan"];

const SORT_OPTIONS = [
  { value: "date-asc", label: "Date: Soonest" },
  { value: "date-desc", label: "Date: Latest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [sort, setSort] = useState("date-asc");

  const filtered = useMemo(() => {
    let events = [...mockEvents];

    if (search.trim()) {
      const q = search.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }

    if (category !== "all") {
      events = events.filter((e) => e.category === category);
    }

    if (location !== "all") {
      events = events.filter((e) => e.location.includes(location));
    }

    events.sort((a, b) => {
      if (sort === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });

    return events;
  }, [search, category, location, sort]);

  const hasFilters = category !== "all" || location !== "all" || search.trim();

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setLocation("all");
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-heading font-semibold text-sm mb-3">Category</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              category === "all"
                ? "bg-primary text-white border-primary"
                : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                category === cat
                  ? "bg-primary text-white border-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <Separator className="opacity-30" />

      <div>
        <h4 className="font-heading font-semibold text-sm mb-3">Location</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLocation("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              location === "all"
                ? "bg-secondary text-white border-secondary"
                : "border-border/50 text-muted-foreground hover:border-secondary/30 hover:text-foreground"
            )}
          >
            All Cities
          </button>
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                location === loc
                  ? "bg-secondary text-white border-secondary"
                  : "border-border/50 text-muted-foreground hover:border-secondary/30 hover:text-foreground"
              )}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Page header */}
      <div className="pt-28 pb-10 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-primary text-sm font-medium mb-2 uppercase tracking-widest">Discover</p>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl text-foreground mb-4">All Events</h1>
          <p className="text-muted-foreground max-w-xl">
            Explore hand-picked experiences across Qatar. Filter by category, location or date to find your perfect event.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events, venues, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Select value={sort} onValueChange={(v) => v && setSort(v)}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mobile filter trigger */}
          <Sheet>
            <SheetTrigger render={<Button variant="outline" className="sm:hidden border-border/50 gap-2" />}>
              <SlidersHorizontal className="w-4 h-4" /> Filters
              {hasFilters && (
                <Badge className="ml-1 bg-primary text-white border-0 px-1.5 py-0.5 text-xs">•</Badge>
              )}
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader className="mb-6">
                <SheetTitle>Filter Events</SheetTitle>
              </SheetHeader>
              <FilterPanel />
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full mt-6 gap-2">
                  <X className="w-4 h-4" /> Clear All Filters
                </Button>
              )}
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-semibold text-foreground">Filters</h3>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Events grid */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-5">
                {search && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    <Search className="w-3 h-3" /> &ldquo;{search}&rdquo;
                    <button onClick={() => setSearch("")} className="ml-1 hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {category !== "all" && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    {category}
                    <button onClick={() => setCategory("all")} className="ml-1 hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {location !== "all" && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    <MapPin className="w-3 h-3" /> {location}
                    <button onClick={() => setLocation("all")} className="ml-1 hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-6">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> events
            </p>

            {filtered.length > 0 ? (
              <motion.div
                className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              >
                <AnimatePresence>
                  {filtered.map((event) => (
                    <motion.div
                      key={event.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
                      }}
                      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                      layout
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">No events found</h3>
                <p className="text-muted-foreground text-sm mb-5">Try adjusting your filters or search term.</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
