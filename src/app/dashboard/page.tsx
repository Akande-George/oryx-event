import Link from "next/link";
import {
  Calendar, Download, QrCode, Ticket, User,
  LogOut, Settings, Clock, MapPin, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import { mockEvents, mockPackages } from "@/lib/mock-data";
import { formatDate, formatPrice } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Dashboard | Oryx Event",
};

// Mock purchased tickets for demo
const mockPurchasedTickets = [
  {
    id: "order-1",
    eventId: "1",
    packageId: "pkg-1-vip",
    qty: 2,
    total: 90000,
    status: "confirmed" as const,
    date: "2026-01-15",
    confirmationCode: "ORX-2024-001",
  },
  {
    id: "order-2",
    eventId: "3",
    packageId: "pkg-3-regular",
    qty: 1,
    total: 25000,
    status: "confirmed" as const,
    date: "2026-01-20",
    confirmationCode: "ORX-2024-002",
  },
];

export default function DashboardPage() {
  const user = { name: "John Doe", email: "john@example.com", joinDate: "January 2026" };

  const enrichedTickets = mockPurchasedTickets.map((order) => {
    const event = mockEvents.find((e) => e.id === order.eventId);
    const pkgs = mockPackages[order.eventId] ?? [];
    const pkg = pkgs.find((p) => p.id === order.packageId);
    return { ...order, event, pkg };
  });

  const upcoming = enrichedTickets.filter(
    (t) => t.event && new Date(t.event.date) > new Date()
  );
  const past = enrichedTickets.filter(
    (t) => t.event && new Date(t.event.date) <= new Date()
  );

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
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-heading font-semibold text-foreground">{user.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Member since {user.joinDate}</p>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tickets", value: enrichedTickets.length, icon: Ticket, color: "text-primary" },
                { label: "Events", value: new Set(enrichedTickets.map((t) => t.eventId)).size, icon: Calendar, color: "text-secondary" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="border-border/50">
                  <CardContent className="p-4 text-center">
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                    <p className="font-heading font-bold text-2xl text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Nav */}
            <Card className="border-border/50">
              <CardContent className="p-2">
                {[
                  { icon: User, label: "Profile", href: "/dashboard/profile" },
                  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
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
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </CardContent>
            </Card>
          </aside>

          {/* Main */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-heading font-bold text-2xl text-foreground">My Tickets</h1>
                <p className="text-sm text-muted-foreground">Manage all your event tickets in one place.</p>
              </div>
              <Button asChild className="gradient-primary border-0 text-white gap-2">
                <Link href="/events"><Calendar className="w-4 h-4" /> Find Events</Link>
              </Button>
            </div>

            <Tabs defaultValue="upcoming">
              <TabsList className="mb-6 bg-muted/30 border border-border/50">
                <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
                <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
              </TabsList>

              {(["upcoming", "past"] as const).map((tab) => {
                const tickets = tab === "upcoming" ? upcoming : past;
                return (
                  <TabsContent key={tab} value={tab} className="space-y-4">
                    {tickets.length === 0 ? (
                      <div className="text-center py-16 bg-muted/20 rounded-2xl border border-border/50">
                        <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                        <h3 className="font-heading font-semibold mb-2">No {tab} events</h3>
                        <p className="text-sm text-muted-foreground mb-5">
                          {tab === "upcoming"
                            ? "Book tickets to upcoming events to see them here."
                            : "Your past events will appear here."}
                        </p>
                        {tab === "upcoming" && (
                          <Button asChild size="sm" className="gradient-primary border-0 text-white">
                            <Link href="/events">Browse Events</Link>
                          </Button>
                        )}
                      </div>
                    ) : (
                      tickets.map(({ id, event, pkg, qty, total, status, confirmationCode, date }) => (
                        <Card key={id} className="border-border/50 hover:border-primary/30 transition-all">
                          <CardContent className="p-5">
                            <div className="flex flex-col sm:flex-row gap-4">
                              {/* Event image */}
                              {event?.image_url && (
                                <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                                  <img
                                    src={event.image_url}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h3 className="font-heading font-semibold text-base text-foreground leading-snug">
                                    {event?.title}
                                  </h3>
                                  <Badge
                                    variant={status === "confirmed" ? "default" : "secondary"}
                                    className={status === "confirmed" ? "bg-secondary/20 text-secondary border-secondary/30 shrink-0" : "shrink-0"}
                                  >
                                    {status}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                                  {event?.date && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-primary" /> {formatDate(event.date)}
                                    </span>
                                  )}
                                  {event?.venue && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-secondary" /> {event.venue}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">{pkg?.name}</span> × {qty} ·{" "}
                                    <span className="font-semibold text-foreground">{formatPrice(total)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="gap-1.5 border-border/50 text-xs h-8">
                                      <QrCode className="w-3.5 h-3.5" /> Show QR
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-1.5 border-border/50 text-xs h-8">
                                      <Download className="w-3.5 h-3.5" /> PDF
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Booking ref: <span className="font-mono text-foreground">{confirmationCode}</span>
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
