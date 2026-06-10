"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, ArrowUpRight, Wifi, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Hotel } from "@/types";
import { formatPrice } from "@/lib/utils";
import { mockRoomTypes } from "@/lib/mock-data";

interface HotelCardProps {
  hotel: Hotel;
  featured?: boolean;
}

export default function HotelCard({ hotel, featured = false }: HotelCardProps) {
  const rooms = mockRoomTypes[hotel.id] ?? [];
  const lowestPrice =
    rooms.length > 0 ? Math.min(...rooms.map((r) => r.price_per_night)) : 0;

  return (
    <Link href={`/hotels/${hotel.id}`} className="block group h-full">
      <motion.div
        className="relative flex h-full flex-col gap-3 overflow-hidden rounded-3xl border border-white/10 bg-[#140a0d] p-2.5 shadow-[0_24px_50px_-18px_rgba(0,0,0,0.6)]"
        whileHover={{ y: -5, borderColor: "rgba(255,205,117,0.35)" }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        {/* Maroon corner glow */}
        <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-[#a81540]/25 blur-3xl" />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-2 pt-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/55">
            <Building2 className="w-3.5 h-3.5 text-[#ffcd75]" /> {hotel.city}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 text-white transition-colors duration-300 group-hover:bg-[#ffcd75] group-hover:text-[#140a0d]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#140a0d] via-transparent to-transparent" />

          {hotel.is_featured && (
            <div className="absolute top-3 left-3">
              <Badge className="border-0 bg-[#ffcd75] text-[#140a0d] text-xs font-semibold">
                Featured
              </Badge>
            </div>
          )}

          {/* Star rating */}
          <div className="absolute bottom-3 left-3 flex items-center gap-0.5 rounded-full bg-black/55 px-2 py-1 backdrop-blur-sm">
            {Array.from({ length: hotel.star_rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 text-[#ffcd75] fill-[#ffcd75]" />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-1 flex-col px-2 pb-2">
          <h3 className="text-gradient-gold mb-2 font-heading text-lg font-semibold leading-snug line-clamp-2">
            {hotel.name}
          </h3>

          <div className="mb-4 flex items-center gap-2 text-xs text-white/50">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#e8607a]" />
            <span className="line-clamp-1">{hotel.address}</span>
          </div>

          {/* Amenity chips */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, featured ? 5 : 3).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-white/55 ring-1 ring-white/10"
              >
                {amenity === "Free Wi-Fi" && <Wifi className="w-3 h-3" />}
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > (featured ? 5 : 3) && (
              <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs text-white/55 ring-1 ring-white/10">
                +{hotel.amenities.length - (featured ? 5 : 3)} more
              </span>
            )}
          </div>

          {featured && (
            <p className="mb-4 line-clamp-2 text-sm text-white/45">
              {hotel.description}
            </p>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
            <div>
              <p className="mb-0.5 text-[10px] uppercase tracking-wider text-white/40">
                From
              </p>
              <p className="font-heading text-sm font-bold text-white">
                {lowestPrice === 0 ? "On request" : formatPrice(lowestPrice)}
                {lowestPrice > 0 && (
                  <span className="text-xs font-normal text-white/40"> / night</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-[#ffcd75] opacity-0 transition-opacity group-hover:opacity-100">
              View hotel <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
