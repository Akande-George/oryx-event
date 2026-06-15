"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, ArrowUpRight, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types";
import { formatDate, formatTime, formatPrice } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export default function EventCard({ event, featured = false }: EventCardProps) {
  const packages = event.ticket_packages ?? [];
  const lowestPrice =
    packages.length > 0 ? Math.min(...packages.map((p) => p.price)) : 0;
  const totalAvailable = packages.reduce(
    (sum, p) => sum + p.available_slots,
    0,
  );
  const isSoldOut = totalAvailable === 0;
  const isLowStock = !isSoldOut && totalAvailable < 30;

  return (
    <Link href={`/events/${event.id}`} className="block group h-full">
      <motion.div
        className="relative flex h-full flex-col gap-3 overflow-hidden rounded-3xl border border-border bg-card p-2.5 shadow-xl shadow-primary/10 hover:border-primary/35"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        {/* Maroon corner glow */}
        <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-2 pt-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
            <Ticket className="w-3.5 h-3.5 text-primary" /> {event.category}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border text-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
          </span>
        </div>

        {/* Image with blurred backdrop glow */}
        <div className="relative h-48 overflow-hidden rounded-2xl">
          <Image
            src={event.image_url}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="scale-150 object-cover opacity-25 blur-xl"
          />
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="relative object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

          {event.is_featured && (
            <div className="absolute top-3 left-3">
              <Badge className="border-0 bg-primary text-primary-foreground text-xs font-semibold">
                Featured
              </Badge>
            </div>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Badge variant="destructive" className="px-4 py-1.5 text-sm">
                Sold Out
              </Badge>
            </div>
          )}
          {isLowStock && (
            <div className="absolute bottom-3 right-3">
              <Badge className="border-0 bg-secondary text-secondary-foreground text-xs">
                {totalAvailable} left
              </Badge>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-1 flex-col px-2 pb-2">
          <h3 className="mb-3 font-heading text-lg font-semibold leading-snug text-foreground line-clamp-2">
            {event.title}
          </h3>

          {featured && (
            <p className="mb-3 line-clamp-2 text-sm text-foreground/75">
              {event.description}
            </p>
          )}

          <div className="mb-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-foreground/75">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/75">
              <Clock className="w-3.5 h-3.5 shrink-0 text-secondary" />
              <span>{formatTime(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/75">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-accent" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
            <div>
              <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                From
              </p>
              <p className="font-heading text-sm font-bold text-foreground">
                {lowestPrice === 0 ? "Free" : formatPrice(lowestPrice)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-foreground opacity-100">
              View event <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
