"use client";

import { BedDouble, Compass, Plane, Ticket } from "lucide-react";
import { ServiceCarousel, type Service } from "@/components/ui/services-card";

// Icons live in this client module so they're never passed across the
// server→client boundary (which Next.js disallows).
const PLAN_SERVICES: Service[] = [
  {
    number: "001",
    icon: Plane,
    title: "Getting Here",
    description:
      "Plan your trip to Qatar and discover how to get around with ease.",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    number: "002",
    icon: Ticket,
    title: "Events & Tickets",
    description: "Browse upcoming events and secure your tickets in minutes.",
    gradient: "from-primary/20 to-primary/5",
    href: "/events",
  },
  {
    number: "003",
    icon: BedDouble,
    title: "Where to Stay",
    description: "Find the right hotel for your visit, from luxury to boutique.",
    gradient: "from-secondary/20 to-secondary/5",
    href: "/hotels",
  },
  {
    number: "004",
    icon: Compass,
    title: "Things to Do",
    description: "Curated experiences, tours and concierge across the country.",
    gradient: "from-primary/20 to-primary/5",
    href: "/events",
  },
];

export default function PlanYourVisit() {
  return (
    <section className="border-t border-border bg-muted/20 py-16 sm:py-20">
      <div className="mx-auto mb-10 max-w-6xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
          Plan your visit
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Everything you need to make the most of your time in Qatar.
        </p>
      </div>
      <ServiceCarousel services={PLAN_SERVICES} />
    </section>
  );
}
