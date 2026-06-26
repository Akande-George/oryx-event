"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, BedDouble } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Hotel } from "@/types";
import { formatPrice, stripHtml } from "@/lib/utils";

interface HotelCardProps {
  hotel: Hotel;
  featured?: boolean;
}

export default function HotelCard({ hotel, featured = false }: HotelCardProps) {
  const rooms = hotel.room_types ?? [];
  const lowestPrice =
    rooms.length > 0 ? Math.min(...rooms.map((r) => r.price_per_night)) : 0;

  return (
    <Link href={`/hotels/${hotel.id}`} className="block h-full">
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
            src={hotel.image_url}
            alt={hotel.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

          {/* Tags */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="gap-1 bg-background/50 backdrop-blur-sm"
            >
              <MapPin className="h-3 w-3" />
              {hotel.city}
            </Badge>
            <Badge className="gap-0.5 border-0 bg-background/50 text-foreground backdrop-blur-sm">
              {hotel.star_rating}
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </Badge>
          </div>

          {hotel.is_featured && (
            <div className="absolute top-3 left-3">
              <Badge className="border-0 bg-primary text-primary-foreground text-xs font-semibold">
                Featured
              </Badge>
            </div>
          )}

          {/* Hover CTA */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25">
              <BedDouble className="h-4 w-4" />
              View Hotel
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="space-y-2">
            <h3 className="font-heading text-lg font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
              {hotel.name}
            </h3>
            {featured ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {stripHtml(hotel.description)}
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground line-clamp-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" /> {hotel.address}
              </p>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {hotel.amenities.slice(0, 2).map((a) => (
                <span
                  key={a}
                  className="rounded-md bg-muted/70 px-2 py-1 text-[11px] text-muted-foreground"
                >
                  {a}
                </span>
              ))}
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                From
              </p>
              <p className="font-heading text-sm font-bold text-foreground">
                {lowestPrice === 0 ? "On request" : formatPrice(lowestPrice)}
                {lowestPrice > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    /night
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
