"use client";

import { notFound, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Share2,
  Heart,
  Star,
  Wifi,
  CalendarDays,
  Users,
  Minus,
  Plus,
  Info,
  BedDouble,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RoomCard from "@/components/hotels/RoomCard";
import GalleryCollage from "@/components/ui/GalleryCollage";
import { createClient } from "@/lib/supabase/client";
import { Hotel, RoomType } from "@/types";
import { cn, nightsBetween, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

// Today, as the minimum selectable check-in date.
const TODAY = new Date().toISOString().slice(0, 10);

export default function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function loadHotel() {
      const { data: liveHotel } = await supabase
        .from("hotels")
        .select("*, room_types(*)")
        .eq("id", id)
        .maybeSingle();

      if (!mounted) return;

      if (liveHotel) {
        setHotel(liveHotel as Hotel);
        setRoomTypes((liveHotel as Hotel).room_types ?? []);
      }
      setLoading(false);
    }

    loadHotel();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="animate-pulse rounded-3xl border border-border/50 bg-card h-96" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    notFound();
  }

  // Main image first, then the gallery extras, de-duplicated.
  const gallery = Array.from(
    new Set([hotel.image_url, ...(hotel.images ?? [])].filter(Boolean)),
  );
  const nights = nightsBetween(checkIn, checkOut);

  const handleSelectRoom = (room: RoomType) => {
    if (!checkIn || !checkOut) {
      toast.error("Please choose your check-in and check-out dates first.");
      return;
    }
    if (nights <= 0) {
      toast.error("Check-out must be after check-in.");
      return;
    }
    if (guests > room.capacity * rooms) {
      toast.error(
        `${room.name} fits up to ${room.capacity} guests per room. Add a room or pick a larger room type.`,
      );
      return;
    }
    const query = new URLSearchParams({
      hotelId: hotel.id,
      roomId: room.id,
      checkIn,
      checkOut,
      rooms: String(rooms),
      guests: String(guests),
    });
    router.push(`/hotel-booking?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero gallery */}
      <div className="relative h-[50vh] min-h-[360px] max-h-[520px] overflow-hidden">
        <Image
          src={gallery[0]}
          alt={hotel.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />

        {/* Back button */}
        <div className="absolute top-20 left-4 sm:left-8">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="bg-black/40 border-white/20 text-white hover:bg-black/60 gap-2 backdrop-blur-sm"
          >
            <Link href="/hotels">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </Button>
        </div>

        {/* Action buttons */}
        <div className="absolute top-20 right-4 sm:right-8 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-black/40 border-white/20 text-white hover:bg-black/60 backdrop-blur-sm"
            onClick={() =>
              navigator.share?.({
                title: hotel.name,
                url: window.location.href,
              })
            }
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "border-white/20 backdrop-blur-sm",
              liked
                ? "bg-primary/80 text-white"
                : "bg-black/40 text-white hover:bg-black/60",
            )}
            onClick={() => setLiked(!liked)}
          >
            <Heart className={cn("w-4 h-4", liked && "fill-white")} />
          </Button>
        </div>

      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 pb-16 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                  <MapPin className="w-3 h-3" /> {hotel.city}
                </Badge>
                <div className="flex items-center gap-0.5 rounded-full bg-yellow-500/10 px-2 py-1">
                  {Array.from({ length: hotel.star_rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
                {hotel.is_featured && (
                  <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-3 leading-tight">
                {hotel.name}
              </h1>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-accent shrink-0" />{" "}
                {hotel.address}
              </p>
            </div>

            {gallery.length > 1 && (
              <div className="mb-8">
                <h2 className="font-heading font-bold text-lg text-foreground mb-3">
                  Photos
                </h2>
                <GalleryCollage images={gallery} alt={hotel.name} />
              </div>
            )}

            <Tabs defaultValue="about">
              <TabsList className="mb-6 bg-muted/30 border border-border/50">
                <TabsTrigger value="about">Overview</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {hotel.description}
                </p>
                <div className="flex items-start gap-2 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Submitting a request does not confirm a reservation. Our
                    team will check live availability and confirm your booking
                    by email.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="amenities">
                <div className="grid sm:grid-cols-2 gap-3">
                  {hotel.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
                    >
                      {amenity === "Free Wi-Fi" ? (
                        <Wifi className="w-4 h-4 text-secondary shrink-0" />
                      ) : (
                        <Check className="w-4 h-4 text-secondary shrink-0" />
                      )}
                      <span className="text-sm text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="location">
                <div className="rounded-xl overflow-hidden border border-border/50 aspect-video bg-muted/50 flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
                    <p className="font-heading font-semibold text-lg mb-1">
                      {hotel.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hotel.address}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 gap-2"
                      asChild
                    >
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${hotel.name} ${hotel.location}`)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open in Maps <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Rooms */}
            <div className="mt-10">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-1">
                Choose your room
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                {nights > 0
                  ? `Prices shown for ${nights} night${nights > 1 ? "s" : ""}.`
                  : "Select your dates to see total prices."}
              </p>
              {roomTypes.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-2xl border border-border/50">
                  <p className="text-muted-foreground text-sm">
                    No rooms listed yet. Contact us for availability.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {roomTypes.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      nights={nights}
                      rooms={rooms}
                      onSelect={handleSelectRoom}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <h2 className="font-heading font-bold text-xl text-foreground mb-1">
                  Plan your stay
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Pick your dates and party size.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="check-in"
                      className="flex items-center gap-1.5"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-primary" />{" "}
                      Check-in
                    </Label>
                    <Input
                      id="check-in"
                      type="date"
                      min={TODAY}
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (checkOut && e.target.value >= checkOut)
                          setCheckOut("");
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="check-out"
                      className="flex items-center gap-1.5"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-secondary" />{" "}
                      Check-out
                    </Label>
                    <Input
                      id="check-out"
                      type="date"
                      min={checkIn || TODAY}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>

                {/* Rooms stepper */}
                <div className="flex items-center justify-between py-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm">
                    <BedDouble className="w-4 h-4 text-muted-foreground" />{" "}
                    Rooms
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-7 h-7 rounded-lg"
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="font-semibold text-sm w-4 text-center">
                      {rooms}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-7 h-7 rounded-lg"
                      onClick={() => setRooms(Math.min(9, rooms + 1))}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Guests stepper */}
                <div className="flex items-center justify-between py-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" /> Guests
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-7 h-7 rounded-lg"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="font-semibold text-sm w-4 text-center">
                      {guests}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-7 h-7 rounded-lg"
                      onClick={() => setGuests(Math.min(20, guests + 1))}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {nights > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-muted/40 text-sm flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Length of stay
                    </span>
                    <span className="font-semibold text-foreground">
                      {nights} night{nights > 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                  Choose a room below to send your booking request. No payment
                  is taken now.
                </p>
              </div>

              {roomTypes.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Rooms from
                  </p>
                  <p className="font-heading font-bold text-lg text-foreground">
                    {formatPrice(
                      Math.min(...roomTypes.map((r) => r.price_per_night)),
                    )}
                    <span className="text-xs font-normal text-muted-foreground">
                      {" "}
                      / night
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
