"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  User,
  Mail,
  Phone,
  MessageSquare,
  CalendarDays,
  BedDouble,
  Users,
  MapPin,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import { createHotelBooking } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/client";
import { Hotel, RoomType } from "@/types";
import { formatPrice, formatDateShort, nightsBetween, cn } from "@/lib/utils";
import { toast } from "sonner";

function HotelBookingContent() {
  const params = useSearchParams();
  const hotelId = params.get("hotelId") ?? "";
  const roomId = params.get("roomId") ?? "";
  const checkIn = params.get("checkIn") ?? "";
  const checkOut = params.get("checkOut") ?? "";
  const rooms = parseInt(params.get("rooms") ?? "1", 10);
  const guests = parseInt(params.get("guests") ?? "1", 10);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [room, setRoom] = useState<RoomType | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const nights = nightsBetween(checkIn, checkOut);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    requests: "",
  });

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function loadBookingData() {
      setLoadingSession(true);

      const [{ data: liveHotel }, { data: liveRoom }, { data: authUser }] =
        await Promise.all([
          supabase.from("hotels").select("*").eq("id", hotelId).maybeSingle(),
          supabase
            .from("room_types")
            .select("*")
            .eq("id", roomId)
            .maybeSingle(),
          supabase.auth.getUser(),
        ]);

      if (!mounted) return;

      if (liveHotel) setHotel(liveHotel as Hotel);
      if (liveRoom) setRoom(liveRoom as RoomType);

      if (authUser.user?.email) {
        setForm((current) => ({
          ...current,
          email: current.email || authUser.user?.email || "",
          name:
            current.name ||
            (typeof authUser.user?.user_metadata?.full_name === "string"
              ? authUser.user.user_metadata.full_name
              : ""),
        }));
      }

      setLoadingSession(false);
    }

    loadBookingData();

    return () => {
      mounted = false;
    };
  }, [hotelId, roomId]);

  const estimatedTotal = (room?.price_per_night ?? 0) * nights * rooms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!hotel || !room) {
      toast.error("This room is no longer available.");
      setLoading(false);
      return;
    }

    const result = await createHotelBooking({
      hotelId: hotel.id,
      roomTypeId: room.id,
      guestName: form.name,
      guestEmail: form.email,
      guestPhone: form.phone,
      checkIn,
      checkOut,
      nights,
      rooms,
      guests,
      estimatedTotal,
      specialRequests: form.requests,
    });

    if (result.error || !result.booking) {
      toast.error(result.error ?? "Could not start checkout.");
      setLoading(false);
      return;
    }

    const initiate = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "booking", id: result.booking.id }),
    });

    if (!initiate.ok) {
      const { error } = await initiate.json().catch(() => ({
        error: "Payment provider failed to start the session.",
      }));
      toast.error(error ?? "Payment provider failed to start the session.");
      setLoading(false);
      return;
    }

    const { paymentUrl } = (await initiate.json()) as { paymentUrl: string };
    window.location.href = paymentUrl;
  };

  if (!loadingSession && (!hotel || !room || nights <= 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Invalid booking request.</p>
          <Button asChild>
            <Link href="/hotels">Back to Hotels</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loadingSession || !hotel || !room) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="animate-pulse rounded-3xl border border-border/50 bg-card h-72" />
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-secondary/20 border-2 border-secondary flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 18,
              delay: 0.15,
            }}
          >
            <Check className="w-10 h-10 text-secondary" />
          </motion.div>
          <h1 className="font-heading font-bold text-3xl text-foreground mb-3">
            Request received!
          </h1>
          <p className="text-muted-foreground mb-2">
            Thanks {form.name.split(" ")[0] || "there"} — your request to stay
            at <span className="text-foreground font-medium">{hotel.name}</span>{" "}
            is with our team.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            We&apos;ll confirm availability and complete the booking on your
            behalf, then email{" "}
            <span className="text-foreground">{form.email}</span> with the
            details — usually within 24 hours.
          </p>

          <Card className="mb-6 border-border/50 text-left">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Room</span>
                <span className="font-medium">{room.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dates</span>
                <span className="font-medium">
                  {formatDateShort(checkIn)} → {formatDateShort(checkOut)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rooms / Guests</span>
                <span className="font-medium">
                  {rooms} room{rooms > 1 ? "s" : ""} · {guests} guest
                  {guests > 1 ? "s" : ""}
                </span>
              </div>
              <Separator className="opacity-30" />
              <div className="flex justify-between font-semibold">
                <span>Estimated total</span>
                <span className="text-primary">
                  {formatPrice(estimatedTotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Estimate only — final pricing is confirmed by our team.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              className="gradient-primary border-0 text-white w-full gap-2"
              asChild
            >
              <Link href="/hotels">
                <MapPin className="w-4 h-4" /> Browse More Hotels
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/hotels/${hotelId}`}>
            <ArrowLeft className="w-4 h-4" /> Back to hotel
          </Link>
        </Button>

        <div className="mb-8">
          <p className="text-primary text-sm font-medium mb-1 uppercase tracking-widest">
            Booking Request
          </p>
          <h1 className="font-heading font-bold text-3xl text-foreground">
            Request your stay
          </h1>
          <p className="text-muted-foreground mt-1">
            Confirm your stay details, then pay securely to lock in your
            reservation.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-border/50">
              <CardHeader className="p-6 pb-4">
                <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Your Details
                </h2>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll use these to confirm your booking.
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="booking-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="booking-name"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="booking-email"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="booking-phone"
                        type="tel"
                        placeholder="+974 0000 0000"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-requests">
                      Special Requests{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea
                        id="booking-requests"
                        placeholder="Airport transfer, high floor, dietary needs, connecting rooms…"
                        rows={3}
                        value={form.requests}
                        onChange={(e) =>
                          setForm({ ...form, requests: e.target.value })
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full gradient-primary border-0 text-white shadow-lg shadow-primary/20 hover:opacity-90 gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit Booking Request
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    By submitting, you agree to be contacted about this booking.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 sticky top-24 overflow-hidden">
              <div className="relative h-32">
                <img
                  src={hotel.image_url}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="font-heading font-bold text-white text-sm leading-snug line-clamp-2">
                    {hotel.name}
                  </p>
                  <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {hotel.city}
                  </p>
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2.5">
                    <BedDouble className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{room.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {room.beds}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CalendarDays className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">
                        {formatDateShort(checkIn)} → {formatDateShort(checkOut)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {nights} night{nights > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <p className="font-medium">
                      {rooms} room{rooms > 1 ? "s" : ""} · {guests} guest
                      {guests > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <Separator className="opacity-30" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {formatPrice(room.price_per_night)} × {nights} × {rooms}
                    </span>
                    <span>{formatPrice(estimatedTotal)}</span>
                  </div>
                </div>
                <Separator className="opacity-30" />
                <div className="flex justify-between font-bold">
                  <span>Estimated total</span>
                  <span className="text-primary">
                    {formatPrice(estimatedTotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Charged in full at checkout. We&apos;ll confirm your room
                  immediately after payment.
                </p>
                <Badge
                  variant="secondary"
                  className={cn("w-full justify-center gap-1.5 py-2")}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                  Secure payment via MyFatoorah
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HotelBookingPage() {
  return (
    <Suspense>
      <HotelBookingContent />
    </Suspense>
  );
}
