"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, ArrowUpRight, Wifi, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Hotel } from "@/types";
import { formatPrice } from "@/lib/utils";

interface HotelCardProps {
  hotel: Hotel;
  featured?: boolean;
}

export default function HotelCard({ hotel, featured = false }: HotelCardProps) {
  const rooms = hotel.room_types ?? [];
  const lowestPrice =
    rooms.length > 0 ? Math.min(...rooms.map((r) => r.price_per_night)) : 0;

  return (
    <Link href={`/hotels/${hotel.id}`} className="block group h-full">
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
            <Building2 className="w-3.5 h-3.5 text-primary" /> {hotel.city}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border text-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" />
          </span>
        </div>

        {/* Image with blurred backdrop glow */}
        <div className="relative h-48 overflow-hidden rounded-2xl">
          <Image
            src={hotel.image_url}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="scale-150 object-cover opacity-25 blur-xl"
          />
          <Image
            src={hotel.image_url}
            alt={hotel.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="relative object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

          {hotel.is_featured && (
            <div className="absolute top-3 left-3">
              <Badge className="border-0 bg-primary text-primary-foreground text-xs font-semibold">
                Featured
              </Badge>
            </div>
          )}

          {/* Star rating */}
          <div className="absolute bottom-3 left-3 flex items-center gap-0.5 rounded-full bg-background/70 px-2 py-1 backdrop-blur-sm">
            {Array.from({ length: hotel.star_rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 text-primary fill-primary" />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-1 flex-col px-2 pb-2">
          <h3 className="mb-2 font-heading text-lg font-semibold leading-snug text-foreground line-clamp-2">
            {hotel.name}
          </h3>

          <div className="mb-4 flex items-center gap-2 text-xs text-foreground/75">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-accent" />
            <span className="line-clamp-1">{hotel.address}</span>
          </div>

          {/* Amenity chips */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, featured ? 5 : 3).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-2 py-1 text-xs text-foreground/75 ring-1 ring-border"
              >
                {amenity === "Free Wi-Fi" && <Wifi className="w-3 h-3" />}
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > (featured ? 5 : 3) && (
              <span className="inline-flex items-center rounded-md bg-muted/70 px-2 py-1 text-xs text-foreground/75 ring-1 ring-border">
                +{hotel.amenities.length - (featured ? 5 : 3)} more
              </span>
            )}
          </div>

          {featured && (
            <p className="mb-4 line-clamp-2 text-sm text-foreground/75">
              {hotel.description}
            </p>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
            <div>
              <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                From
              </p>
              <p className="font-heading text-sm font-bold text-foreground">
                {lowestPrice === 0 ? "On request" : formatPrice(lowestPrice)}
                {lowestPrice > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    / night
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-foreground opacity-100">
              View hotel <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
