"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3, Calendar, Edit, Eye, LayoutDashboard,
  Package, Plus, Settings, Ticket, Trash2, TrendingUp, Users, CheckCircle2, Clock,
  XCircle, Download, Mail, X
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
import { EventCategory, TicketPackage, Order } from "@/types";
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
  const [packages, setPackages] = useState<Record<string, TicketPackage[]>>({ ...mockPackages });
  const [orders, setOrders] = useState<Order[]>([...mockOrders]);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "", description: "", location: "", venue: "",
    date: "", category: "" as EventCategory | "", image_url: "",
  });

  // Package creation
  const [addPkgOpen, setAddPkgOpen] = useState(false);
  const [newPkg, setNewPkg] = useState({
    event_id: "", name: "", tier: "" as "Regular" | "VIP" | "Table" | "",
    price: "", total_slots: "", perks: "",
  });

  // Order / Attendee detail dialogs
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedAttendee, setSelectedAttendee] = useState<ReturnType<typeof buildAttendees>[number] | null>(null);

  const totalTicketsSold = orders
    .filter((o) => o.status === "confirmed")
    .reduce((s, o) => s + o.quantity, 0);
  const totalRevenue = orders
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

  const handleAddPackage = () => {
    if (!newPkg.event_id || !newPkg.name || !newPkg.tier || !newPkg.price || !newPkg.total_slots) return;
    const slots = parseInt(newPkg.total_slots, 10);
    const pkg: TicketPackage = {
      id: Date.now().toString(),
      event_id: newPkg.event_id,
      name: newPkg.name,
      tier: newPkg.tier as "Regular" | "VIP" | "Table",
      price: parseFloat(newPkg.price),
      perks: newPkg.perks ? newPkg.perks.split(",").map((s) => s.trim()).filter(Boolean) : [],
      total_slots: slots,
      available_slots: slots,
      is_available: true,
      created_at: new Date().toISOString(),
    };
    setPackages((prev) => ({
      ...prev,
      [newPkg.event_id]: [...(prev[newPkg.event_id] ?? []), pkg],
    }));
    setAddPkgOpen(false);
    setNewPkg({ event_id: "", name: "", tier: "", price: "", total_slots: "", perks: "" });
  };

  const handleConfirmOrder = (id: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "confirmed" as const } : o));
    if (selectedOrder?.id === id) setSelectedOrder((o) => o ? { ...o, status: "confirmed" } : o);
  };

  const handleCancelOrder = (id: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "cancelled" as const } : o));
    if (selectedOrder?.id === id) setSelectedOrder((o) => o ? { ...o, status: "cancelled" } : o);
  };

  const exportAttendeesCSV = () => {
    const rows = [
      ["Name", "Email", "Event", "Package", "Qty", "Total", "Order Date"],
      ...buildAttendees().map((a) => [
        a.guest_name ?? "",
        a.guest_email ?? "",
        a.event?.title ?? "",
        a.pkg?.name ?? "",
        String(a.quantity),
        String(a.total_price),
        new Date(a.created_at).toLocaleDateString("en-GB"),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "attendees.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  function buildAttendees() {
    return orders
      .filter((o) => o.status === "confirmed")
      .map((o) => {
        const event = events.find((e) => e.id === o.event_id);
        const pkgList = packages[o.event_id] ?? [];
        const pkg = pkgList.find((p) => p.id === o.package_id);
        return { ...o, event, pkg };
      });
  }

  // Derive attendees from orders
  const attendees = buildAttendees();

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
                  {orders.length}
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
          {section === "packages" && (
            <Dialog open={addPkgOpen} onOpenChange={setAddPkgOpen}>
              <DialogTrigger render={<Button className="gradient-primary border-0 text-white shadow-sm gap-2" />}>
                <Plus className="w-4 h-4" /> Add Package
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-heading">Add Ticket Package</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Event</Label>
                    <Select value={newPkg.event_id} onValueChange={(v) => v && setNewPkg({ ...newPkg, event_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select event…" /></SelectTrigger>
                      <SelectContent>
                        {events.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="pkg-name">Package Name</Label>
                      <Input id="pkg-name" placeholder="Early Bird" value={newPkg.name} onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tier</Label>
                      <Select value={newPkg.tier} onValueChange={(v) => v && setNewPkg({ ...newPkg, tier: v as "Regular" | "VIP" | "Table" })}>
                        <SelectTrigger><SelectValue placeholder="Tier…" /></SelectTrigger>
                        <SelectContent>
                          {(["Regular", "VIP", "Table"] as const).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="pkg-price">Price (QAR)</Label>
                      <Input id="pkg-price" type="number" min="0" placeholder="450" value={newPkg.price} onChange={(e) => setNewPkg({ ...newPkg, price: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pkg-slots">Total Slots</Label>
                      <Input id="pkg-slots" type="number" min="1" placeholder="100" value={newPkg.total_slots} onChange={(e) => setNewPkg({ ...newPkg, total_slots: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pkg-perks">Perks (comma-separated)</Label>
                    <Input id="pkg-perks" placeholder="Welcome drink, Name badge, Reserved seating" value={newPkg.perks} onChange={(e) => setNewPkg({ ...newPkg, perks: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddPkgOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddPackage} className="gradient-primary border-0 text-white">Add Package</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {section === "attendees" && (
            <Button variant="outline" className="gap-2 border-border/50" onClick={exportAttendeesCSV}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          )}
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
                    <Input id="admin-title" placeholder="Doha Jazz Gala" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
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
                    <Input id="admin-location" placeholder="Doha, Qatar" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
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
                      {orders.slice(0, 5).map((order) => {
                        const event = events.find((e) => e.id === order.event_id);
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
                      const pkgs = packages[event.id] ?? [];
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
                const pkgs = packages[event.id] ?? [];
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
                            {["Package", "Tier", "Price", "Sold", "Available", "Status", ""].map((h) => (
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
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary"
                                      onClick={() => setPackages((prev) => ({
                                        ...prev,
                                        [event.id]: (prev[event.id] ?? []).map((p) =>
                                          p.id === pkg.id ? { ...p, is_available: !p.is_available } : p
                                        ),
                                      }))}
                                      title={pkg.is_available ? "Close sales" : "Open sales"}
                                    >
                                      {pkg.is_available ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    </Button>
                                    <Button
                                      variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => setPackages((prev) => ({
                                        ...prev,
                                        [event.id]: (prev[event.id] ?? []).filter((p) => p.id !== pkg.id),
                                      }))}
                                      title="Delete package"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
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
            <>
              <Card className="border-border">
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                  <h2 className="font-heading font-semibold text-base">All Orders ({orders.length})</h2>
                  <div className="flex gap-2">
                    <Badge className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {orders.filter((o) => o.status === "confirmed").length} confirmed
                    </Badge>
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs gap-1">
                      <Clock className="w-3 h-3" />
                      {orders.filter((o) => o.status === "pending").length} pending
                    </Badge>
                    <Badge className="bg-red-50 text-red-700 border-red-200 text-xs gap-1">
                      <XCircle className="w-3 h-3" />
                      {orders.filter((o) => o.status === "cancelled").length} cancelled
                    </Badge>
                  </div>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Order", "Customer", "Event", "Package", "Qty", "Total", "Date", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left text-xs text-muted-foreground font-medium px-5 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const event = events.find((e) => e.id === order.event_id);
                        const pkgList = packages[order.event_id] ?? [];
                        const pkg = pkgList.find((p) => p.id === order.package_id);
                        return (
                          <tr
                            key={order.id}
                            className="border-b border-border/40 hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => setSelectedOrder(order)}
                          >
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
                              <Badge className={
                                order.status === "confirmed" ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                : order.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200 text-xs"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                              }>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                {order.status !== "confirmed" && (
                                  <Button
                                    variant="ghost" size="sm"
                                    className="h-7 px-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-50"
                                    onClick={() => handleConfirmOrder(order.id)}
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm
                                  </Button>
                                )}
                                {order.status !== "cancelled" && (
                                  <Button
                                    variant="ghost" size="sm"
                                    className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-red-50"
                                    onClick={() => handleCancelOrder(order.id)}
                                  >
                                    <X className="w-3 h-3 mr-1" /> Cancel
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Order Detail Dialog */}
              <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Order Details</DialogTitle>
                  </DialogHeader>
                  {selectedOrder && (() => {
                    const event = events.find((e) => e.id === selectedOrder.event_id);
                    const pkgList = packages[selectedOrder.event_id] ?? [];
                    const pkg = pkgList.find((p) => p.id === selectedOrder.package_id);
                    return (
                      <div className="space-y-4 py-1">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {selectedOrder.guest_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{selectedOrder.guest_name}</p>
                            <p className="text-xs text-muted-foreground">{selectedOrder.guest_email}</p>
                          </div>
                          <Badge className={
                            selectedOrder.status === "confirmed" ? "ml-auto bg-green-50 text-green-700 border-green-200 text-xs"
                            : selectedOrder.status === "cancelled" ? "ml-auto bg-red-50 text-red-700 border-red-200 text-xs"
                            : "ml-auto bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                          }>
                            {selectedOrder.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Order ID</p>
                            <p className="font-mono text-xs">{selectedOrder.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Order Date</p>
                            <p>{new Date(selectedOrder.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground mb-0.5">Event</p>
                            <p className="font-medium">{event?.title ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">{event?.venue} · {event ? formatDate(event.date) : ""}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Package</p>
                            <p>{pkg?.name ?? "—"} <span className="text-muted-foreground">({pkg?.tier})</span></p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Quantity</p>
                            <p>{selectedOrder.quantity} ticket{selectedOrder.quantity > 1 ? "s" : ""}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Unit Price</p>
                            <p>{pkg ? formatPrice(pkg.price) : "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Total Paid</p>
                            <p className="font-heading font-bold text-foreground">{formatPrice(selectedOrder.total_price)}</p>
                          </div>
                          {selectedOrder.payment_reference && (
                            <div className="col-span-2">
                              <p className="text-xs text-muted-foreground mb-0.5">Payment Ref</p>
                              <p className="font-mono text-xs">{selectedOrder.payment_reference}</p>
                            </div>
                          )}
                        </div>
                        <Separator className="opacity-30" />
                        <div className="flex gap-2">
                          {selectedOrder.status !== "confirmed" && (
                            <Button
                              className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white border-0"
                              onClick={() => handleConfirmOrder(selectedOrder.id)}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Confirm Order
                            </Button>
                          )}
                          {selectedOrder.status !== "cancelled" && (
                            <Button
                              variant="outline"
                              className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-red-50"
                              onClick={() => handleCancelOrder(selectedOrder.id)}
                            >
                              <X className="w-4 h-4" /> Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* ── Attendees ─────────────────────────────────────── */}
          {section === "attendees" && (
            <>
              <Card className="border-border">
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                  <h2 className="font-heading font-semibold text-base">Attendees ({attendees.length})</h2>
                  <p className="text-xs text-muted-foreground">Confirmed ticket holders</p>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["#", "Name", "Email", "Event", "Package", "Tickets", "Paid", ""].map((h) => (
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
                          <td className="px-5 py-3">
                            <Button
                              variant="ghost" size="sm"
                              className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => setSelectedAttendee(a)}
                            >
                              <Eye className="w-3 h-3 mr-1" /> View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Attendee Detail Dialog */}
              <Dialog open={!!selectedAttendee} onOpenChange={(open) => !open && setSelectedAttendee(null)}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Attendee Details</DialogTitle>
                  </DialogHeader>
                  {selectedAttendee && (
                    <div className="space-y-4 py-1">
                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white text-lg font-bold shrink-0">
                          {selectedAttendee.guest_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-heading font-semibold text-base">{selectedAttendee.guest_name}</p>
                          <p className="text-sm text-muted-foreground">{selectedAttendee.guest_email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground mb-0.5">Event</p>
                          <p className="font-medium">{selectedAttendee.event?.title ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{selectedAttendee.event?.venue} · {selectedAttendee.event ? formatDate(selectedAttendee.event.date) : ""}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Package</p>
                          <p>{selectedAttendee.pkg?.name ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Tier</p>
                          <Badge variant="secondary" className="text-xs">{selectedAttendee.pkg?.tier ?? "—"}</Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Tickets</p>
                          <p>{selectedAttendee.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Total Paid</p>
                          <p className="font-heading font-bold">{formatPrice(selectedAttendee.total_price)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground mb-0.5">Order ID</p>
                          <p className="font-mono text-xs">{selectedAttendee.id}</p>
                        </div>
                        {selectedAttendee.pkg?.perks && selectedAttendee.pkg.perks.length > 0 && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground mb-1.5">Perks Included</p>
                            <ul className="space-y-1">
                              {selectedAttendee.pkg.perks.map((perk) => (
                                <li key={perk} className="flex items-center gap-2 text-xs">
                                  <CheckCircle2 className="w-3 h-3 text-secondary shrink-0" /> {perk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <Separator className="opacity-30" />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => window.open(`mailto:${selectedAttendee.guest_email}?subject=Your ticket for ${selectedAttendee.event?.title ?? "the event"}`)}
                        >
                          <Mail className="w-4 h-4" /> Email Attendee
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            const row = [
                              selectedAttendee.guest_name ?? "",
                              selectedAttendee.guest_email ?? "",
                              selectedAttendee.event?.title ?? "",
                              selectedAttendee.pkg?.name ?? "",
                              String(selectedAttendee.quantity),
                              String(selectedAttendee.total_price),
                            ];
                            const csv = row.map((c) => `"${c.replace(/"/g, '""')}"`).join(",");
                            navigator.clipboard.writeText(csv);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>
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
                      const pkgs = packages[event.id] ?? [];
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
                          {formatPrice(Math.round(totalRevenue / (orders.filter(o => o.status === "confirmed").length || 1)))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Confirmed Orders</p>
                        <p className="font-heading font-bold text-xl text-foreground">
                          {orders.filter((o) => o.status === "confirmed").length}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4 opacity-30" />
                    <div className="space-y-2">
                      {orders.filter((o) => o.status === "confirmed").slice(0, 4).map((order) => {
                        const event = events.find((e) => e.id === order.event_id);
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
