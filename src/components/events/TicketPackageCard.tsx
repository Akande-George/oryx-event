"use client";

import { useState } from "react";
import { Check, Minus, Plus, Sparkles, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { TicketPackage } from "@/types";

interface TicketPackageCardProps {
  pkg: TicketPackage;
  onSelect: (pkg: TicketPackage, qty: number) => void;
}

const tierConfig = {
  Regular: {
    icon: null,
    gradient: "from-muted/50 to-muted/20",
    border: "border-border/50",
    badge: "secondary" as const,
    accentColor: "text-muted-foreground",
  },
  VIP: {
    icon: Star,
    gradient: "from-primary/10 to-primary/5",
    border: "border-primary/30",
    badge: "default" as const,
    accentColor: "text-primary",
  },
  Table: {
    icon: Sparkles,
    gradient: "from-yellow-500/10 to-yellow-500/5",
    border: "border-yellow-500/30",
    badge: "outline" as const,
    accentColor: "text-yellow-500",
  },
};

export default function TicketPackageCard({ pkg, onSelect }: TicketPackageCardProps) {
  const [qty, setQty] = useState(1);
  const config = tierConfig[pkg.tier];
  const Icon = config.icon;
  const isSoldOut = !pkg.is_available || pkg.available_slots === 0;
  const availabilityPct = (pkg.available_slots / pkg.total_slots) * 100;

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300",
        config.gradient,
        config.border,
        !isSoldOut && "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
      )}
    >
      {/* Tier badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={cn("w-4 h-4", config.accentColor)} />}
          <span className={cn("font-heading font-semibold text-sm", config.accentColor)}>
            {pkg.tier}
          </span>
        </div>
        {isSoldOut ? (
          <Badge variant="destructive" className="text-xs">Sold Out</Badge>
        ) : availabilityPct < 20 ? (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
            {pkg.available_slots} left
          </Badge>
        ) : null}
      </div>

      {/* Package name & price */}
      <h3 className="font-heading font-bold text-xl text-foreground mb-1">{pkg.name}</h3>
      <div className="mb-5">
        <span className="text-2xl font-bold text-foreground">{formatPrice(pkg.price)}</span>
        <span className="text-sm text-muted-foreground ml-1">per ticket</span>
      </div>

      {/* Perks */}
      <ul className="space-y-2 mb-6">
        {pkg.perks.map((perk, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className={cn("w-4 h-4 mt-0.5 shrink-0", config.accentColor)} />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      {/* Availability bar */}
      {!isSoldOut && (
        <div className="mb-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> Availability
            </span>
            <span>{pkg.available_slots} / {pkg.total_slots}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                availabilityPct > 50 ? "bg-secondary" : availabilityPct > 20 ? "bg-yellow-500" : "bg-destructive"
              )}
              style={{ width: `${availabilityPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Quantity selector & CTA */}
      {!isSoldOut && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Quantity:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-7 h-7 rounded-lg"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="font-semibold text-sm w-4 text-center">{qty}</span>
              <Button
                variant="outline"
                size="icon"
                className="w-7 h-7 rounded-lg"
                onClick={() => setQty(Math.min(10, qty + 1))}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <span className="ml-auto text-sm font-semibold text-foreground">
              {formatPrice(pkg.price * qty)}
            </span>
          </div>

          <Button
            className="w-full gradient-primary border-0 text-white shadow-lg shadow-primary/20 hover:opacity-90"
            onClick={() => onSelect(pkg, qty)}
          >
            Select {pkg.name} × {qty}
          </Button>
        </div>
      )}
    </div>
  );
}
