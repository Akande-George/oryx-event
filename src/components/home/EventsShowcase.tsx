"use client";

import { useMemo, useState } from "react";
import { Event } from "@/types";
import EventCard from "@/components/events/EventCard";

type TabKey = "week" | "weekend" | "other";

const TABS: { key: TabKey; label: string }[] = [
  { key: "week", label: "Events this week" },
  { key: "weekend", label: "Events this weekend" },
  { key: "other", label: "Other events" },
];

export default function EventsShowcase({ events }: { events: Event[] }) {
  const [tab, setTab] = useState<TabKey>("week");

  const buckets = useMemo(() => {
    const now = new Date();
    const week = new Date(now);
    week.setDate(now.getDate() + 7);

    // Coming weekend (next Sat 00:00 → Sun 23:59).
    const sat = new Date(now);
    sat.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7));
    sat.setHours(0, 0, 0, 0);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    sun.setHours(23, 59, 59, 999);

    const future = events.filter((e) => new Date(e.date) >= now);
    return {
      week: future.filter((e) => new Date(e.date) <= week),
      weekend: future.filter((e) => {
        const d = new Date(e.date);
        return d >= sat && d <= sun;
      }),
      other: future,
    };
  }, [events]);

  const list = buckets[tab];

  return (
    <div>
      {/* Tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {tab === t.key && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No events in this window yet — check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 6).map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
