"use client";

import { Check, Users, BedDouble, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { RoomType } from "@/types";

interface RoomCardProps {
  room: RoomType;
  nights: number;
  rooms: number;
  onSelect: (room: RoomType) => void;
}

export default function RoomCard({ room, nights, rooms, onSelect }: RoomCardProps) {
  const isSoldOut = !room.is_available;
  const subtotal = room.price_per_night * Math.max(nights, 0) * Math.max(rooms, 1);

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-gradient-to-br from-muted/40 to-muted/10 p-6 transition-all duration-300",
        "border-border/50",
        !isSoldOut && "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-heading font-bold text-lg text-foreground">
            {room.name}
          </h3>
          {room.description && (
            <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
          )}
        </div>
        {isSoldOut && (
          <Badge variant="destructive" className="text-xs shrink-0">
            Unavailable
          </Badge>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-secondary" /> Up to {room.capacity}{" "}
          guests
        </span>
        <span className="flex items-center gap-1.5">
          <BedDouble className="w-3.5 h-3.5 text-secondary" /> {room.beds}
        </span>
      </div>

      {/* Amenities */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5">
        {room.amenities.map((amenity, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <Check className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
            <span>{amenity}</span>
          </li>
        ))}
      </ul>

      {/* Price + CTA */}
      <div className="flex items-end justify-between gap-3 pt-4 border-t border-border/50">
        <div>
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(room.price_per_night)}
          </span>
          <span className="text-sm text-muted-foreground ml-1">/ night</span>
          {nights > 0 && !isSoldOut && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatPrice(subtotal)} for {nights} night{nights > 1 ? "s" : ""}
              {rooms > 1 ? ` · ${rooms} rooms` : ""}
            </p>
          )}
        </div>
        <Button
          disabled={isSoldOut}
          className="gradient-primary border-0 text-white shadow-lg shadow-primary/20 hover:opacity-90 gap-1.5 shrink-0"
          onClick={() => onSelect(room)}
        >
          Select <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
