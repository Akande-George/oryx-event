"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types";
import { formatDate, formatPrice, stripHtml } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export default function EventCard({ event, featured = false }: EventCardProps) {
  const packages = event.ticket_packages ?? [];
  const lowestPrice =
    packages.length > 0 ? Math.min(...packages.map((p) => p.price)) : 0;
  const totalAvailable = packages.reduce((s, p) => s + p.available_slots, 0);
  const isSoldOut = packages.length > 0 && totalAvailable === 0;
  const isLowStock = !isSoldOut && totalAvailable > 0 && totalAvailable < 30;

  return (
    <Link href={`/events/${event.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
      >
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

          {/* Tags */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-background/50 backdrop-blur-sm"
            >
              {event.category}
            </Badge>
            {isLowStock && (
              <Badge className="border-0 bg-secondary text-secondary-foreground backdrop-blur-sm">
                {totalAvailable} left
              </Badge>
            )}
          </div>

          {event.is_featured && (
            <div className="absolute top-3 left-3">
              <Badge className="border-0 bg-primary text-primary-foreground text-xs font-semibold">
                Featured
              </Badge>
            </div>
          )}

          {/* Hover CTA */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
            <span
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium shadow-lg ${
                isSoldOut
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground shadow-primary/25"
              }`}
            >
              <Ticket className="h-4 w-4" />
              {isSoldOut ? "Sold Out" : "Book Tickets"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="space-y-2">
            <h3 className="font-heading text-lg font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
              {event.title}
            </h3>
            {featured ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {stripHtml(event.description)}
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground line-clamp-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" /> {event.venue}
              </p>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                From
              </p>
              <p className="font-heading text-sm font-bold text-foreground">
                {lowestPrice === 0 ? "Free" : formatPrice(lowestPrice)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
