"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3, Calendar, Edit, Eye, LayoutDashboard,
  Package, Plus, Settings, Ticket, Trash2, TrendingUp, Users, CheckCircle2, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { mockEvents, mockPackages, mockOrders } from "@/lib/mock-data";
import { formatDate, formatPrice } from "@/lib/utils";
import { EventCategory } from "@/types";
import Image from "next/image";

const CATEGORIES: EventCategory[] = [
  "Music", "Sports", "Arts", "Food & Drink", "Business", "Technology", "Comedy", "Fashion", "Other",
];

type Section = "dashboard" | "events" | "packages" | "orders" | "attendees" | "analytics";

const navItems: { id: Section; icon: React.ElementType; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "events", icon: Calendar, label: "Events" },
  { id: "packages", icon: Package, label: "Packages" },
  { id: "orders", icon: Ticket, label: "Orders" },
  { id: "attendees", icon: Users, label: "Attendees" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
];

const sectionTitles: Record<Section, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of your events and sales" },
  events: { title: "Events", subtitle: "Create, edit and manage events" },
  packages: { title: "Packages", subtitle: "Ticket tiers across all events" },
  orders: { title: "Orders", subtitle: "All ticket purchase records" },
  attendees: { title: "Attendees", subtitle: "People who have booked tickets" },
  analytics: { title: "Analytics", subtitle: "Sales and revenue breakdowns" },
};

export default function AdminDashboard() {
  const [section, setSection] = useState<Section>("dashboard");
  const [events, setEvents] = useState(mockEvents);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "", description: "", location: "", venue: "",
    date: "", category: "" as EventCategory | "", image_url: "",
  });

  const totalTicketsSold = mockOrders
    .filter((o) => o.status === "confirmed")
    .reduce((s, o) => s + o.quantity, 0);
  const totalRevenue = mockOrders
    .filter((o) => o.status === "confirmed")
    .reduce((s, o) => s + o.total_price, 0);

  const stats = [
    { label: "Total Events", value: events.length, icon: Calendar, trend: "+2 this month", color: "text-primary", bg: "bg-primary/10" },
    { label: "Tickets Sold", value: totalTicketsSold.toLocaleString(), icon: Ticket, trend: "+186 this week", color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, trend: "+12% vs last month", color: "text-green-600", bg: "bg-green-50" },
    { label: "Attendees", value: totalTicketsSold.toLocaleString(), icon: Users, trend: "+340 this week", color: "text-blue-600", bg: "bg-blue-50" },
  ];

  const handleCreate = () => {
    if (!newEvent.title || !newEvent.category) return;
    setEvents((prev) => [
      {
        ...newEvent,
        id: Date.now().toString(),
        category: newEvent.category as EventCategory,
        organizer: "Admin",
        is_featured: false,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url: newEvent.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      },
      ...prev,
    ]);
    setCreateOpen(false);
    setNewEvent({ title: "", description: "", location: "", venue: "", date: "", category: "", image_url: "" });
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setDeleteId(null);
  };

  // Derive attendees from orders
  const attendees = mockOrders
    .filter((o) => o.status === "confirmed")
    .map((o) => {
      const event = mockEvents.find((e) => e.id === o.event_id);
      const pkgList = mockPackages[o.event_id] ?? [];
      const pkg = pkgList.find((p) => p.id === o.package_id);
      return { ...o, event, pkg };
    });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-white shrink-0">
        <Link href="/" className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <Image src={`/logo.png`} alt="Logo" width={32} height={32} />
          <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0.5">Admin</Badge>
        </Link>

        <nav className="flex-1 p-3 space-y-0.5 pt-4">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                section === id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {id === "orders" && (
                <span className="ml-auto text-xs bg-primary text-white rounded-full px-1.5 py-0.5 leading-none">
                  {mockOrders.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            <Settings className="w-4 h-4" /> Settings
          </button>
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all mt-0.5">
            <Eye className="w-4 h-4" /> View Site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">{sectionTitles[section].title}</h1>
            <p className="text-xs text-muted-foreground">{sectionTitles[section].subtitle}</p>
          </div>
          {section === "events" && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger render={<Button className="gradient-primary border-0 text-white shadow-sm gap-2" />}>
                <Plus className="w-4 h-4" /> Create Event
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-heading">Create New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="admin-title">Event Title</Label>
                    <Input id="admin-title" placeholder="Lagos Jazz Night" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="admin-date">Date & Time</Label>
                      <Input id="admin-date" type="datetime-local" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-category">Category</Label>
                      <Select value={newEvent.category} onValueChange={(v) => v && setNewEvent({ ...newEvent, category: v as EventCategory })}>
                        <SelectTrigger id="admin-category"><SelectValue placeholder="Choose…" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-venue">Venue</Label>
                    <Input id="admin-venue" placeholder="Eko Hotels & Suites" value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-location">City</Label>
                    <Input id="admin-location" placeholder="Lagos, Nigeria" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-desc">Description</Label>
                    <Textarea id="admin-desc" placeholder="Describe your event…" rows={3} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-image">Image URL</Label>
                    <Input id="admin-image" placeholder="https://…" value={newEvent.image_url} onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} className="gradient-primary border-0 text-white">Create Event</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="p-6 space-y-6">

          {/* ── Dashboard ─────────────────────────────────────── */}
          {section === "dashboard" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, trend, color, bg }) => (
                  <Card key={label} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                        <Icon className={`w-4.5 h-4.5 ${color}`} />
                      </div>
                      <p className="font-heading font-bold text-2xl text-foreground mb-0.5">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-xs text-secondary mt-1.5">{trend}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent orders */}
              <Card className="border-border">
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                  <h2 className="font-heading font-semibold text-base">Recent Orders</h2>
                  <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => setSection("orders")}>
                    View all
                  </Button>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Order ID", "Customer", "Event", "Amount", "Status"].map((h) => (
                          <th key={h} className="text-left text-xs text-muted-foreground font-medium px-5 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mockOrders.slice(0, 5).map((order) => {
                        const event = mockEvents.find((e) => e.id === order.event_id);
                        return (
                          <tr key={order.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                            <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{order.id}</td>
                            <td className="px-5 py-3">
                              <p className="font-medium text-sm">{order.guest_name}</p>
                              <p className="text-xs text-muted-foreground">{order.guest_email}</p>
                            </td>
                            <td className="px-5 py-3 text-sm text-muted-foreground truncate max-w-[160px]">{event?.title ?? "—"}</td>
                            <td className="px-5 py-3 text-sm font-medium">{formatPrice(order.total_price)}</td>
                            <td className="px-5 py-3">
                              <Badge className={order.status === "confirmed"
                                ? "bg-green-50 text-green-700 border-green-200 text-xs gap-1"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs gap-1"
                              }>
                                {order.status === "confirmed"
                                  ? <CheckCircle2 className="w-3 h-3" />
                                  : <Clock className="w-3 h-3" />
                                }
                                {order.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* ── Events ────────────────────────────────────────── */}
          {section === "events" && (
            <Card className="border-border">
              <CardHeader className="p-5 pb-3">
                <h2 className="font-heading font-semibold text-base">All Events ({events.length})</h2>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Event", "Category", "Date", "Tickets", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left text-xs text-muted-foreground font-medium px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => {
                      const pkgs = mockPackages[event.id] ?? [];
                      const sold = pkgs.reduce((s, p) => s + (p.total_slots - p.available_slots), 0);
                      const total = pkgs.reduce((s, p) => s + p.total_slots, 0);
                      return (
                        <tr key={event.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate max-w-[160px]">{event.title}</p>
                                <p className="text-xs text-muted-foreground">{event.venue}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                          </td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(event.date)}</td>
                          <td className="px-5 py-4">
                            <p className="text-xs font-medium">{sold} / {total}</p>
                            <Progress value={total > 0 ? (sold / total) * 100 : 0} className="h-1 mt-1 w-16" />
                          </td>
                          <td className="px-5 py-4">
                            <Badge className={event.is_published
                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                              : "bg-muted text-muted-foreground text-xs"
                            }>
                              {event.is_published ? "Live" : "Draft"}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground" asChild>
                                <Link href={`/events/${event.id}`}><Eye className="w-3.5 h-3.5" /></Link>
                              </Button>
                              <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary">
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Dialog open={deleteId === event.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                                <DialogTrigger render={
                                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(event.id)} />
                                }>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Event?</DialogTitle>
                                  </DialogHeader>
                                  <p className="text-sm text-muted-foreground">
                                    Are you sure you want to delete <strong>{event.title}</strong>? This action cannot be undone.
                                  </p>
                                  <DialogFooter className="mt-4">
                                    <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                                    <Button variant="destructive" onClick={() => handleDelete(event.id)}>Delete</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── Packages ──────────────────────────────────────── */}
          {section === "packages" && (
            <div className="space-y-6">
              {events.map((event) => {
                const pkgs = mockPackages[event.id] ?? [];
                if (!pkgs.length) return null;
                return (
                  <Card key={event.id} className="border-border">
                    <CardHeader className="p-5 pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-muted shrink-0">
                          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold text-sm">{event.title}</h3>
                          <p className="text-xs text-muted-foreground">{formatDate(event.date)} · {event.venue}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-y border-border">
                            {["Package", "Tier", "Price", "Sold", "Available", "Status"].map((h) => (
                              <th key={h} className="text-left text-xs text-muted-foreground font-medium px-5 py-2.5">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pkgs.map((pkg) => {
                            const sold = pkg.total_slots - pkg.available_slots;
                            return (
                              <tr key={pkg.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                                <td className="px-5 py-3 font-medium">{pkg.name}</td>
                                <td className="px-5 py-3">
                                  <Badge variant="secondary" className="text-xs">{pkg.tier}</Badge>
                                </td>
                                <td className="px-5 py-3 font-medium">{formatPrice(pkg.price)}</td>
                                <td className="px-5 py-3 text-muted-foreground">{sold}</td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className={pkg.available_slots < 20 ? "text-destructive font-medium" : "text-foreground"}>
                                      {pkg.available_slots}
                                    </span>
                                    <Progress
                                      value={(sold / pkg.total_slots) * 100}
                                      className="h-1 w-16"
                                    />
                                  </div>
                                </td>
                                <td className="px-5 py-3">
                                  <Badge className={pkg.is_available
                                    ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                    : "bg-red-50 text-red-700 border-red-200 text-xs"
                                  }>
                                    {pkg.is_available ? "On Sale" : "Closed"}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* ── Orders ────────────────────────────────────────── */}
          {section === "orders" && (
            <Card className="border-border">
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                <h2 className="font-heading font-semibold text-base">All Orders ({mockOrders.length})</h2>
                <div className="flex gap-2">
                  <Badge className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {mockOrders.filter((o) => o.status === "confirmed").length} confirmed
                  </Badge>
                  <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs gap-1">
                    <Clock className="w-3 h-3" />
                    {mockOrders.filter((o) => o.status === "pending").length} pending
                  </Badge>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Order", "Customer", "Event", "Package", "Qty", "Total", "Date", "Status"].map((h) => (
                        <th key={h} className="text-left text-xs text-muted-foreground font-medium px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map((order) => {
                      const event = mockEvents.find((e) => e.id === order.event_id);
                      const pkgList = mockPackages[order.event_id] ?? [];
                      const pkg = pkgList.find((p) => p.id === order.package_id);
                      return (
                        <tr key={order.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{order.id}</td>
                          <td className="px-5 py-3">
                            <p className="font-medium text-sm">{order.guest_name}</p>
                            <p className="text-xs text-muted-foreground">{order.guest_email}</p>
                          </td>
                          <td className="px-5 py-3 text-xs text-muted-foreground max-w-[140px]">
                            <span className="truncate block">{event?.title ?? "—"}</span>
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant="secondary" className="text-xs">{pkg?.name ?? "—"}</Badge>
                          </td>
                          <td className="px-5 py-3 text-center text-sm font-medium">× {order.quantity}</td>
                          <td className="px-5 py-3 font-medium text-sm">{formatPrice(order.total_price)}</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </td>
                          <td className="px-5 py-3">
                            <Badge className={order.status === "confirmed"
                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                            }>
                              {order.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── Attendees ─────────────────────────────────────── */}
          {section === "attendees" && (
            <Card className="border-border">
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                <h2 className="font-heading font-semibold text-base">Attendees ({attendees.length})</h2>
                <p className="text-xs text-muted-foreground">Confirmed ticket holders</p>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["#", "Name", "Email", "Event", "Package", "Tickets", "Paid"].map((h) => (
                        <th key={h} className="text-left text-xs text-muted-foreground font-medium px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((a, i) => (
                      <tr key={a.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3 text-xs text-muted-foreground">{i + 1}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {a.guest_name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{a.guest_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{a.guest_email}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground max-w-[160px]">
                          <span className="truncate block">{a.event?.title ?? "—"}</span>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant="secondary" className="text-xs">{a.pkg?.name ?? "—"}</Badge>
                        </td>
                        <td className="px-5 py-3 text-center text-sm font-medium">{a.quantity}</td>
                        <td className="px-5 py-3 font-medium text-sm text-foreground">{formatPrice(a.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── Analytics ─────────────────────────────────────── */}
          {section === "analytics" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                {stats.map(({ label, value, icon: Icon, color, bg }) => (
                  <Card key={label} className="border-border">
                    <CardContent className="p-5">
                      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                        <Icon className={`w-4.5 h-4.5 ${color}`} />
                      </div>
                      <p className="font-heading font-bold text-2xl text-foreground mb-0.5">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardHeader className="p-5 pb-3">
                    <h3 className="font-heading font-semibold text-sm">Ticket Sales by Event</h3>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-4">
                    {events.slice(0, 5).map((event) => {
                      const pkgs = mockPackages[event.id] ?? [];
                      const sold = pkgs.reduce((s, p) => s + (p.total_slots - p.available_slots), 0);
                      const total = pkgs.reduce((s, p) => s + p.total_slots, 0);
                      const pct = total > 0 ? (sold / total) * 100 : 0;
                      return (
                        <div key={event.id}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground truncate max-w-[200px]">{event.title}</span>
                            <span className="font-medium text-foreground shrink-0 ml-2">{sold} / {total}</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="p-5 pb-3">
                    <h3 className="font-heading font-semibold text-sm">Revenue by Category</h3>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-3">
                    {[
                      { label: "Music", value: 2100000, pct: 50 },
                      { label: "Technology", value: 1050000, pct: 25 },
                      { label: "Food & Drink", value: 630000, pct: 15 },
                      { label: "Arts", value: 420000, pct: 10 },
                    ].map(({ label, value, pct }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-24 text-xs text-muted-foreground shrink-0">{label}</div>
                        <Progress value={pct} className="flex-1 h-1.5" />
                        <div className="text-xs font-medium text-foreground shrink-0 w-20 text-right">{formatPrice(value)}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border md:col-span-2">
                  <CardHeader className="p-5 pb-3">
                    <h3 className="font-heading font-semibold text-sm">Revenue Summary</h3>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                        <p className="font-heading font-bold text-xl text-foreground">{formatPrice(totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Avg. Order Value</p>
                        <p className="font-heading font-bold text-xl text-foreground">
                          {formatPrice(Math.round(totalRevenue / (mockOrders.filter(o => o.status === "confirmed").length || 1)))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Confirmed Orders</p>
                        <p className="font-heading font-bold text-xl text-foreground">
                          {mockOrders.filter((o) => o.status === "confirmed").length}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4 opacity-30" />
                    <div className="space-y-2">
                      {mockOrders.filter((o) => o.status === "confirmed").slice(0, 4).map((order) => {
                        const event = mockEvents.find((e) => e.id === order.event_id);
                        return (
                          <div key={order.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span className="text-muted-foreground truncate max-w-[220px]">{order.guest_name} · {event?.title}</span>
                            </div>
                            <span className="font-medium text-foreground shrink-0">{formatPrice(order.total_price)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
