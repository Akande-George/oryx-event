"use client";

import Link from "next/link";
import {
  Calendar,
  Ticket,
  User,
  Settings,
  ChevronRight,
  LogOut,
  Shield,
  BedDouble,
  Download,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import TicketCard from "@/components/dashboard/TicketCard";
import RouteGuard from "@/components/auth/RouteGuard";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDate, formatPrice } from "@/lib/utils";
import { HotelBooking, Order } from "@/types";

function DashboardContent() {
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();

  const fullName = user?.full_name ?? user?.email ?? "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const joinDate = user
    ? new Date(user.created_at).toLocaleDateString("en-QA", {
        month: "long",
        year: "numeric",
      })
    : "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [stays, setStays] = useState<HotelBooking[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    const supabase = createClient();

    async function loadData() {
      const [ordersRes, staysRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*, ticket_package:ticket_packages(*), event:events(*)")
          .eq("user_id", user!.id)
          .eq("status", "confirmed")
          .order("created_at", { ascending: false }),
        supabase
          .from("hotel_bookings")
          .select("*, hotel:hotels(*), room_type:room_types(*)")
          .eq("user_id", user!.id)
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false }),
      ]);

      if (!mounted) return;
      if (ordersRes.data?.length) setOrders(ordersRes.data as Order[]);
      if (staysRes.data?.length) setStays(staysRes.data as HotelBooking[]);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const upcoming = orders.filter(
    (o) => o.event && new Date((o.event as { date: string }).date) > new Date(),
  );
  const past = orders.filter(
    (o) =>
      o.event && new Date((o.event as { date: string }).date) <= new Date(),
  );

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully.");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <Card className="border-border/50">
              <CardContent className="p-5 text-center">
                <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-primary/30">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-heading font-semibold text-foreground">
                  {fullName}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Member since {joinDate}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Orders",
                  value: orders.length,
                  icon: Ticket,
                  color: "text-primary",
                },
                {
                  label: "Events",
                  value: new Set(orders.map((o) => o.event_id)).size,
                  icon: Calendar,
                  color: "text-secondary",
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="border-border/50">
                  <CardContent className="p-4 text-center">
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                    <p className="font-heading font-bold text-2xl text-foreground">
                      {value}
                    </p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-border/50">
              <CardContent className="p-2">
                {[
                  { icon: User, label: "Profile", href: "/dashboard/profile" },
                  {
                    icon: Settings,
                    label: "Settings",
                    href: "/dashboard/settings",
                  },
                  ...(isAdmin
                    ? [{ icon: Shield, label: "Admin Panel", href: "/admin" }]
                    : []),
                ].map(({ icon: Icon, label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <Icon className="w-4 h-4" /> {label}
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                  </Link>
                ))}
                <Separator className="my-1 opacity-30" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </CardContent>
            </Card>
          </aside>

          {/* Main */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-heading font-bold text-2xl text-foreground">
                  My Tickets
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage all your event tickets in one place.
                </p>
              </div>
              <Button
                asChild
                className="gradient-primary border-0 text-white gap-2"
              >
                <Link href="/events">
                  <Calendar className="w-4 h-4" /> Find Events
                </Link>
              </Button>
            </div>

            <Tabs defaultValue="upcoming">
              <TabsList className="mb-6 bg-muted/30 border border-border/50">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcoming.length})
                </TabsTrigger>
                <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
                <TabsTrigger value="stays">Stays ({stays.length})</TabsTrigger>
              </TabsList>

              {(["upcoming", "past"] as const).map((tab) => {
                const tickets = tab === "upcoming" ? upcoming : past;
                return (
                  <TabsContent key={tab} value={tab} className="space-y-4">
                    {tickets.length === 0 ? (
                      <div className="text-center py-16 bg-muted/20 rounded-2xl border border-border/50">
                        <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                        <h3 className="font-heading font-semibold mb-2">
                          No {tab} events
                        </h3>
                        <p className="text-sm text-muted-foreground mb-5">
                          {tab === "upcoming"
                            ? "Book tickets to upcoming events to see them here."
                            : "Your past events will appear here."}
                        </p>
                        {tab === "upcoming" && (
                          <Button
                            asChild
                            size="sm"
                            className="gradient-primary border-0 text-white"
                          >
                            <Link href="/events">Browse Events</Link>
                          </Button>
                        )}
                      </div>
                    ) : (
                      tickets.map((order) => (
                        <TicketCard key={order.id} order={order} />
                      ))
                    )}
                  </TabsContent>
                );
              })}

              <TabsContent value="stays" className="space-y-4">
                {stays.length === 0 ? (
                  <div className="text-center py-16 bg-muted/20 rounded-2xl border border-border/50">
                    <BedDouble className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                    <h3 className="font-heading font-semibold mb-2">
                      No hotel stays
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5">
                      Your paid hotel bookings will appear here.
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className="gradient-primary border-0 text-white"
                    >
                      <Link href="/hotels">Browse Hotels</Link>
                    </Button>
                  </div>
                ) : (
                  stays.map((booking) => {
                    const hotel = booking.hotel as
                      | { name?: string; city?: string }
                      | undefined;
                    const room = booking.room_type as
                      | { name?: string }
                      | undefined;
                    return (
                      <Card
                        key={booking.id}
                        className="border-border/50 hover:border-primary/30 transition-all"
                      >
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-heading font-semibold text-foreground truncate">
                                  {hotel?.name ?? "Hotel"}
                                </h3>
                                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                                  Paid
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                                <MapPin className="w-3 h-3" />
                                {hotel?.city ?? ""} · {room?.name ?? "Room"}
                              </p>
                              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-primary" />
                                  {formatDate(booking.check_in)} →{" "}
                                  {formatDate(booking.check_out)}
                                </span>
                                <span>
                                  {booking.nights} night
                                  {booking.nights > 1 ? "s" : ""}
                                </span>
                                <span className="font-semibold text-foreground">
                                  {formatPrice(booking.estimated_total)}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 border-border/50 text-xs h-8 shrink-0"
                              asChild
                            >
                              <a
                                href={`/api/tickets/booking/${booking.id}`}
                                download
                              >
                                <Download className="w-3.5 h-3.5" /> Download Pass
                              </a>
                            </Button>
                          </div>
                          {booking.payment_reference && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Ref:{" "}
                              <span className="font-mono text-foreground">
                                {booking.payment_reference}
                              </span>
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RouteGuard>
      <DashboardContent />
    </RouteGuard>
  );
}
