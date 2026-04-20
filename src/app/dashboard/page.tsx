import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar, Ticket, User,
  Settings, ChevronRight, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import TicketCard from "@/components/dashboard/TicketCard";
import { formatDate } from "@/lib/utils";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/actions";

export const metadata: Metadata = {
  title: "My Dashboard | Oryx Event",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "User";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const joinDate = new Date(user.created_at).toLocaleDateString("en-QA", {
    month: "long",
    year: "numeric",
  });

  // Fetch real orders from Supabase
  const { data: ordersData } = await supabase
    .from("orders")
    .select("*, ticket_package:ticket_packages(*), event:events(*)")
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false });

  const orders = ordersData ?? [];

  const upcoming = orders.filter(
    (o: any) => o.event && new Date(o.event.date) > new Date()
  );
  const past = orders.filter(
    (o: any) => o.event && new Date(o.event.date) <= new Date()
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
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
                <h2 className="font-heading font-semibold text-foreground">{fullName}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Member since {joinDate}</p>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Orders", value: orders.length, icon: Ticket, color: "text-primary" },
                { label: "Events", value: new Set(orders.map((o: any) => o.event_id)).size, icon: Calendar, color: "text-secondary" },
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
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </form>
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
                      tickets.map((order: any) => (
                        <TicketCard key={order.id} order={order} />
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
