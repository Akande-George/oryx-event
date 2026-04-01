import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Event } from "@/types";
import { formatDate, formatTime, formatPrice, cn } from "@/lib/utils";
import { mockPackages } from "@/lib/mock-data";

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export default function EventCard({ event, featured = false }: EventCardProps) {
  const packages = mockPackages[event.id] ?? [];
  const lowestPrice = packages.length > 0 ? Math.min(...packages.map((p) => p.price)) : 0;
  const totalAvailable = packages.reduce((sum, p) => sum + p.available_slots, 0);
  const isSoldOut = totalAvailable === 0;
  const isLowStock = !isSoldOut && totalAvailable < 30;

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <Card className={cn(
        "overflow-hidden border-border/50 bg-card hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10",
        featured && "md:flex"
      )}>
        {/* Image */}
        <div className={cn(
          "relative overflow-hidden bg-muted",
          featured ? "md:w-1/2 h-56 md:h-auto" : "h-48"
        )}>
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge variant="secondary" className="bg-black/60 text-white border-0 backdrop-blur-sm text-xs">
              {event.category}
            </Badge>
            {event.is_featured && (
              <Badge className="bg-primary/90 text-white border-0 text-xs">Featured</Badge>
            )}
          </div>

          {/* Stock badge */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm px-4 py-1.5">Sold Out</Badge>
            </div>
          )}
          {isLowStock && !isSoldOut && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-yellow-500/90 text-black border-0 text-xs">
                {totalAvailable} left
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className={cn("p-5", featured && "md:p-7 flex flex-col justify-between")}>
          <div>
            <h3 className="font-heading font-semibold text-base leading-snug mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {event.title}
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0 text-secondary" />
                <span>{formatTime(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-accent" />
                <span className="line-clamp-1">{event.venue}</span>
              </div>
            </div>

            {featured && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {event.description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">From</p>
              <p className="font-heading font-bold text-sm text-foreground">
                {lowestPrice === 0 ? "Free" : formatPrice(lowestPrice)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View event <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
