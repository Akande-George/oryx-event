"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3, Calendar, Edit, Eye, LayoutDashboard,
  Package, Plus, Settings, Ticket, Trash2, TrendingUp, Users, CheckCircle2, Clock,
  XCircle, Download, Mail, X, Building2, BedDouble, MapPin, Star, CalendarDays, Phone
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
import { mockEvents, mockPackages, mockOrders, mockHotels, mockRoomTypes, mockHotelBookings } from "@/lib/mock-data";
import { formatDate, formatPrice, formatDateShort } from "@/lib/utils";
import { EventCategory, TicketPackage, Order, Hotel, RoomType, HotelBooking } from "@/types";
import Image from "next/image";
import RouteGuard from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CATEGORIES: EventCategory[] = [
  "Music", "Sports", "Arts", "Food & Drink", "Business", "Technology", "Comedy", "Fashion", "Other",
];

type Section =
  | "dashboard" | "events" | "packages" | "orders" | "attendees" | "analytics"
  | "hotels" | "bookings";

const navItems: { id: Section; icon: React.ElementType; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "events", icon: Calendar, label: "Events" },
  { id: "packages", icon: Package, label: "Packages" },
  { id: "orders", icon: Ticket, label: "Orders" },
  { id: "attendees", icon: Users, label: "Attendees" },
  { id: "hotels", icon: Building2, label: "Hotels" },
  { id: "bookings", icon: BedDouble, label: "Bookings" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
];

const sectionTitles: Record<Section, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of your events and sales" },
  events: { title: "Events", subtitle: "Create, edit and manage events" },
  packages: { title: "Packages", subtitle: "Ticket tiers across all events" },
  orders: { title: "Orders", subtitle: "All ticket purchase records" },
  attendees: { title: "Attendees", subtitle: "People who have booked tickets" },
  hotels: { title: "Hotels", subtitle: "Manage hotel listings and rooms" },
  bookings: { title: "Hotel Bookings", subtitle: "Incoming stay requests to fulfil" },
  analytics: { title: "Analytics", subtitle: "Sales and revenue breakdowns" },
};

const STAR_OPTIONS = ["5", "4", "3", "2", "1"];

function AdminDashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const handleSignOut = () => {
    signOut();
    toast.success("Signed out successfully.");
    router.push("/");
  };
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

  // ── Hotels state ──
  const [hotels, setHotels] = useState<Hotel[]>(mockHotels);
  const [hotelRooms, setHotelRooms] = useState<Record<string, RoomType[]>>({ ...mockRoomTypes });
  const [bookings, setBookings] = useState<HotelBooking[]>([...mockHotelBookings]);

  const [createHotelOpen, setCreateHotelOpen] = useState(false);
  const [newHotel, setNewHotel] = useState({
    name: "", city: "", location: "", address: "",
    star_rating: "5", description: "", image_url: "", amenities: "",
  });

  const [deleteHotelId, setDeleteHotelId] = useState<string | null>(null);

  const [editHotelId, setEditHotelId] = useState<string | null>(null);
  const [editHotel, setEditHotel] = useState({
    name: "", city: "", location: "", address: "",
    star_rating: "5", description: "", image_url: "", amenities: "",
  });

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    hotel_id: "", name: "", price_per_night: "", capacity: "", beds: "", amenities: "",
  });

  const [selectedBooking, setSelectedBooking] = useState<HotelBooking | null>(null);

  const handleCreateHotel = () => {
    if (!newHotel.name || !newHotel.city) return;
    const id = `h-${Date.now()}`;
    setHotels((prev) => [
      {
        id,
        name: newHotel.name,
        description: newHotel.description,
        location: newHotel.location || `${newHotel.city}`,
        city: newHotel.city,
        address: newHotel.address,
        image_url: newHotel.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80",
        star_rating: parseInt(newHotel.star_rating, 10),
        amenities: newHotel.amenities ? newHotel.amenities.split(",").map((s) => s.trim()).filter(Boolean) : [],
        is_featured: false,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setHotelRooms((prev) => ({ ...prev, [id]: [] }));
    setCreateHotelOpen(false);
    setNewHotel({ name: "", city: "", location: "", address: "", star_rating: "5", description: "", image_url: "", amenities: "" });
  };

  const handleEditHotelOpen = (hotel: Hotel) => {
    setEditHotelId(hotel.id);
    setEditHotel({
      name: hotel.name,
      city: hotel.city,
      location: hotel.location,
      address: hotel.address,
      star_rating: String(hotel.star_rating),
      description: hotel.description,
      image_url: hotel.image_url,
      amenities: hotel.amenities.join(", "),
    });
  };

  const handleEditHotelSave = () => {
    if (!editHotelId || !editHotel.name) return;
    setHotels((prev) => prev.map((h) =>
      h.id === editHotelId
        ? {
            ...h,
            name: editHotel.name,
            city: editHotel.city,
            location: editHotel.location,
            address: editHotel.address,
            star_rating: parseInt(editHotel.star_rating, 10),
            description: editHotel.description,
            image_url: editHotel.image_url,
            amenities: editHotel.amenities ? editHotel.amenities.split(",").map((s) => s.trim()).filter(Boolean) : [],
            updated_at: new Date().toISOString(),
          }
        : h
    ));
    setEditHotelId(null);
  };

  const handleDeleteHotel = (id: string) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
    setHotelRooms((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setDeleteHotelId(null);
  };

  const handleAddRoom = () => {
    if (!newRoom.hotel_id || !newRoom.name || !newRoom.price_per_night || !newRoom.capacity) return;
    const room: RoomType = {
      id: `rm-${Date.now()}`,
      hotel_id: newRoom.hotel_id,
      name: newRoom.name,
      price_per_night: parseFloat(newRoom.price_per_night),
      capacity: parseInt(newRoom.capacity, 10),
      beds: newRoom.beds || "1 King",
      amenities: newRoom.amenities ? newRoom.amenities.split(",").map((s) => s.trim()).filter(Boolean) : [],
      is_available: true,
      created_at: new Date().toISOString(),
    };
    setHotelRooms((prev) => ({
      ...prev,
      [newRoom.hotel_id]: [...(prev[newRoom.hotel_id] ?? []), room],
    }));
    setAddRoomOpen(false);
    setNewRoom({ hotel_id: "", name: "", price_per_night: "", capacity: "", beds: "", amenities: "" });
  };

  const handleConfirmBooking = (id: string) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "confirmed" as const } : b));
    if (selectedBooking?.id === id) setSelectedBooking((b) => b ? { ...b, status: "confirmed" } : b);
  };

  const handleCancelBooking = (id: string) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" as const } : b));
    if (selectedBooking?.id === id) setSelectedBooking((b) => b ? { ...b, status: "cancelled" } : b);
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  // Edit event
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState({
    title: "", description: "", location: "", venue: "",
    date: "", category: "" as EventCategory | "", image_url: "",
  });

  const handleEditOpen = (event: typeof events[number]) => {
    setEditEventId(event.id);
    setEditEvent({
      title: event.title,
      description: event.description,
      location: event.location,
      venue: event.venue,
      date: event.date ? event.date.replace(" ", "T").slice(0, 16) : "",
      category: event.category,
      image_url: event.image_url,
    });
  };

  const handleEditSave = () => {
    if (!editEventId || !editEvent.title) return;
    setEvents((prev) => prev.map((e) =>
      e.id === editEventId
        ? { ...e, ...editEvent, category: editEvent.category as EventCategory, updated_at: new Date().toISOString() }
        : e
    ));
    setEditEventId(null);
  };

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Sidebar */}
      <div className="flex flex-1 overflow-hidden">
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
              {id === "bookings" && pendingBookings > 0 && (
                <span className="ml-auto text-xs bg-secondary text-white rounded-full px-1.5 py-0.5 leading-none">
                  {pendingBookings}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-0.5">
          {user && (
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-foreground truncate">{user.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <Link href="/dashboard/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            <Settings className="w-4 h-4" /> Settings
          </Link>
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
            <Eye className="w-4 h-4" /> View Site
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto pb-16 md:pb-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-border px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="md:hidden flex items-center gap-2 shrink-0">
              <Image src="/logo.png" alt="Logo" width={28} height={28} />
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">Admin</Badge>
            </Link>
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-base sm:text-lg text-foreground truncate">{sectionTitles[section].title}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">{sectionTitles[section].subtitle}</p>
            </div>
          </div>
          {section === "packages" && (
            <Dialog open={addPkgOpen} onOpenChange={setAddPkgOpen}>
              <DialogTrigger render={<Button className="gradient-primary border-0 text-white shadow-sm gap-2 shrink-0" />}>
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Package</span>
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
            <Button variant="outline" className="gap-2 border-border/50 shrink-0" onClick={exportAttendeesCSV}>
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export CSV</span>
            </Button>
          )}
          {section === "events" && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger render={<Button className="gradient-primary border-0 text-white shadow-sm gap-2 shrink-0" />}>
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Event</span>
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
          {section === "hotels" && (
            <div className="flex items-center gap-2 shrink-0">
              <Dialog open={addRoomOpen} onOpenChange={setAddRoomOpen}>
                <DialogTrigger render={<Button variant="outline" className="gap-2 border-border/50" />}>
                  <BedDouble className="w-4 h-4" /> <span className="hidden sm:inline">Add Room</span>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Add Room Type</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Hotel</Label>
                      <Select value={newRoom.hotel_id} onValueChange={(v) => v && setNewRoom({ ...newRoom, hotel_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select hotel…" /></SelectTrigger>
                        <SelectContent>
                          {hotels.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="room-name">Room Name</Label>
                        <Input id="room-name" placeholder="Deluxe King" value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="room-beds">Beds</Label>
                        <Input id="room-beds" placeholder="1 King" value={newRoom.beds} onChange={(e) => setNewRoom({ ...newRoom, beds: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="room-price">Price / night (QAR)</Label>
                        <Input id="room-price" type="number" min="0" placeholder="850" value={newRoom.price_per_night} onChange={(e) => setNewRoom({ ...newRoom, price_per_night: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="room-cap">Max Guests</Label>
                        <Input id="room-cap" type="number" min="1" placeholder="2" value={newRoom.capacity} onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room-amenities">Amenities (comma-separated)</Label>
                      <Input id="room-amenities" placeholder="Free Wi-Fi, Sea View, Bathtub" value={newRoom.amenities} onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddRoomOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddRoom} className="gradient-primary border-0 text-white">Add Room</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={createHotelOpen} onOpenChange={setCreateHotelOpen}>
                <DialogTrigger render={<Button className="gradient-primary border-0 text-white shadow-sm gap-2" />}>
                  <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Hotel</span>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Create New Hotel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="hotel-name">Hotel Name</Label>
                      <Input id="hotel-name" placeholder="Waldorf Astoria Doha" value={newHotel.name} onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="hotel-city">City</Label>
                        <Input id="hotel-city" placeholder="Doha" value={newHotel.city} onChange={(e) => setNewHotel({ ...newHotel, city: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Star Rating</Label>
                        <Select value={newHotel.star_rating} onValueChange={(v) => v && setNewHotel({ ...newHotel, star_rating: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STAR_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s} stars</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel-location">Location (City, Country)</Label>
                      <Input id="hotel-location" placeholder="Doha, Qatar" value={newHotel.location} onChange={(e) => setNewHotel({ ...newHotel, location: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel-address">Address</Label>
                      <Input id="hotel-address" placeholder="West Bay, Diplomatic District…" value={newHotel.address} onChange={(e) => setNewHotel({ ...newHotel, address: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel-desc">Description</Label>
                      <Textarea id="hotel-desc" placeholder="Describe the hotel…" rows={3} value={newHotel.description} onChange={(e) => setNewHotel({ ...newHotel, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel-amenities">Amenities (comma-separated)</Label>
                      <Input id="hotel-amenities" placeholder="Free Wi-Fi, Pool, Spa, Airport Transfer" value={newHotel.amenities} onChange={(e) => setNewHotel({ ...newHotel, amenities: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel-image">Image URL</Label>
                      <Input id="hotel-image" placeholder="https://…" value={newHotel.image_url} onChange={(e) => setNewHotel({ ...newHotel, image_url: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateHotelOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateHotel} className="gradient-primary border-0 text-white">Create Hotel</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-6">

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
                              <Button
                                variant="ghost" size="icon"
                                className="w-7 h-7 text-muted-foreground hover:text-primary"
                                onClick={() => handleEditOpen(event)}
                              >
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

          {/* Edit Event Dialog (outside events section so it renders regardless) */}
          <Dialog open={!!editEventId} onOpenChange={(open) => !open && setEditEventId(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">Edit Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Event Title</Label>
                  <Input id="edit-title" value={editEvent.title} onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">Date & Time</Label>
                    <Input id="edit-date" type="datetime-local" value={editEvent.date} onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={editEvent.category} onValueChange={(v) => v && setEditEvent({ ...editEvent, category: v as EventCategory })}>
                      <SelectTrigger id="edit-category"><SelectValue placeholder="Choose…" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-venue">Venue</Label>
                  <Input id="edit-venue" value={editEvent.venue} onChange={(e) => setEditEvent({ ...editEvent, venue: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">City</Label>
                  <Input id="edit-location" value={editEvent.location} onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-desc">Description</Label>
                  <Textarea id="edit-desc" rows={3} value={editEvent.description} onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-image">Image URL</Label>
                  <Input id="edit-image" placeholder="https://…" value={editEvent.image_url} onChange={(e) => setEditEvent({ ...editEvent, image_url: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditEventId(null)}>Cancel</Button>
                <Button onClick={handleEditSave} className="gradient-primary border-0 text-white">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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

          {/* ── Hotels ────────────────────────────────────────── */}
          {section === "hotels" && (
            <div className="space-y-6">
              {/* Hotels table */}
              <Card className="border-border">
                <CardHeader className="p-5 pb-3">
                  <h2 className="font-heading font-semibold text-base">All Hotels ({hotels.length})</h2>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Hotel", "City", "Rating", "Rooms", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left text-xs text-muted-foreground font-medium px-5 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hotels.map((hotel) => {
                        const rms = hotelRooms[hotel.id] ?? [];
                        return (
                          <tr key={hotel.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                                  <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground truncate max-w-[180px]">{hotel.name}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">{hotel.address}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <Badge variant="secondary" className="text-xs gap-1"><MapPin className="w-3 h-3" />{hotel.city}</Badge>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: hotel.star_rating }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-xs font-medium">{rms.length}</td>
                            <td className="px-5 py-4">
                              <Badge className={hotel.is_published
                                ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                : "bg-muted text-muted-foreground text-xs"
                              }>
                                {hotel.is_published ? "Live" : "Draft"}
                              </Badge>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground" asChild>
                                  <Link href={`/hotels/${hotel.id}`}><Eye className="w-3.5 h-3.5" /></Link>
                                </Button>
                                <Button
                                  variant="ghost" size="icon"
                                  className="w-7 h-7 text-muted-foreground hover:text-primary"
                                  onClick={() => handleEditHotelOpen(hotel)}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <Dialog open={deleteHotelId === hotel.id} onOpenChange={(open) => !open && setDeleteHotelId(null)}>
                                  <DialogTrigger render={
                                    <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteHotelId(hotel.id)} />
                                  }>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Delete Hotel?</DialogTitle>
                                    </DialogHeader>
                                    <p className="text-sm text-muted-foreground">
                                      Are you sure you want to delete <strong>{hotel.name}</strong> and its rooms? This action cannot be undone.
                                    </p>
                                    <DialogFooter className="mt-4">
                                      <Button variant="outline" onClick={() => setDeleteHotelId(null)}>Cancel</Button>
                                      <Button variant="destructive" onClick={() => handleDeleteHotel(hotel.id)}>Delete</Button>
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

              {/* Rooms per hotel */}
              {hotels.map((hotel) => {
                const rms = hotelRooms[hotel.id] ?? [];
                if (!rms.length) return null;
                return (
                  <Card key={hotel.id} className="border-border">
                    <CardHeader className="p-5 pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-muted shrink-0">
                          <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold text-sm">{hotel.name}</h3>
                          <p className="text-xs text-muted-foreground">{rms.length} room type{rms.length > 1 ? "s" : ""} · {hotel.city}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-y border-border">
                            {["Room", "Beds", "Capacity", "Price / night", "Status", ""].map((h) => (
                              <th key={h} className="text-left text-xs text-muted-foreground font-medium px-5 py-2.5">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rms.map((room) => (
                            <tr key={room.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                              <td className="px-5 py-3 font-medium">{room.name}</td>
                              <td className="px-5 py-3 text-muted-foreground">{room.beds}</td>
                              <td className="px-5 py-3 text-muted-foreground">{room.capacity} guests</td>
                              <td className="px-5 py-3 font-medium">{formatPrice(room.price_per_night)}</td>
                              <td className="px-5 py-3">
                                <Badge className={room.is_available
                                  ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                  : "bg-red-50 text-red-700 border-red-200 text-xs"
                                }>
                                  {room.is_available ? "Available" : "Closed"}
                                </Badge>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary"
                                    onClick={() => setHotelRooms((prev) => ({
                                      ...prev,
                                      [hotel.id]: (prev[hotel.id] ?? []).map((r) =>
                                        r.id === room.id ? { ...r, is_available: !r.is_available } : r
                                      ),
                                    }))}
                                    title={room.is_available ? "Close room" : "Open room"}
                                  >
                                    {room.is_available ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                  </Button>
                                  <Button
                                    variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => setHotelRooms((prev) => ({
                                      ...prev,
                                      [hotel.id]: (prev[hotel.id] ?? []).filter((r) => r.id !== room.id),
                                    }))}
                                    title="Delete room"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Edit Hotel Dialog */}
          <Dialog open={!!editHotelId} onOpenChange={(open) => !open && setEditHotelId(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">Edit Hotel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-hotel-name">Hotel Name</Label>
                  <Input id="edit-hotel-name" value={editHotel.name} onChange={(e) => setEditHotel({ ...editHotel, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-hotel-city">City</Label>
                    <Input id="edit-hotel-city" value={editHotel.city} onChange={(e) => setEditHotel({ ...editHotel, city: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Star Rating</Label>
                    <Select value={editHotel.star_rating} onValueChange={(v) => v && setEditHotel({ ...editHotel, star_rating: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STAR_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s} stars</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hotel-location">Location (City, Country)</Label>
                  <Input id="edit-hotel-location" value={editHotel.location} onChange={(e) => setEditHotel({ ...editHotel, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hotel-address">Address</Label>
                  <Input id="edit-hotel-address" value={editHotel.address} onChange={(e) => setEditHotel({ ...editHotel, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hotel-desc">Description</Label>
                  <Textarea id="edit-hotel-desc" rows={3} value={editHotel.description} onChange={(e) => setEditHotel({ ...editHotel, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hotel-amenities">Amenities (comma-separated)</Label>
                  <Input id="edit-hotel-amenities" value={editHotel.amenities} onChange={(e) => setEditHotel({ ...editHotel, amenities: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hotel-image">Image URL</Label>
                  <Input id="edit-hotel-image" placeholder="https://…" value={editHotel.image_url} onChange={(e) => setEditHotel({ ...editHotel, image_url: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditHotelId(null)}>Cancel</Button>
                <Button onClick={handleEditHotelSave} className="gradient-primary border-0 text-white">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Bookings (hotel stay requests) ────────────────── */}
          {section === "bookings" && (
            <>
              <Card className="border-border">
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                  <h2 className="font-heading font-semibold text-base">Booking Requests ({bookings.length})</h2>
                  <div className="flex gap-2">
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs gap-1">
                      <Clock className="w-3 h-3" />
                      {bookings.filter((b) => b.status === "pending").length} pending
                    </Badge>
                    <Badge className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {bookings.filter((b) => b.status === "confirmed").length} confirmed
                    </Badge>
                    <Badge className="bg-red-50 text-red-700 border-red-200 text-xs gap-1">
                      <XCircle className="w-3 h-3" />
                      {bookings.filter((b) => b.status === "cancelled").length} cancelled
                    </Badge>
                  </div>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Ref", "Guest", "Hotel", "Room", "Dates", "Nights", "Est. Total", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left text-xs text-muted-foreground font-medium px-5 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => {
                        const hotel = hotels.find((h) => h.id === booking.hotel_id);
                        const room = (hotelRooms[booking.hotel_id] ?? []).find((r) => r.id === booking.room_type_id);
                        return (
                          <tr
                            key={booking.id}
                            className="border-b border-border/40 hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{booking.id}</td>
                            <td className="px-5 py-3">
                              <p className="font-medium text-sm">{booking.guest_name}</p>
                              <p className="text-xs text-muted-foreground">{booking.guest_email}</p>
                            </td>
                            <td className="px-5 py-3 text-xs text-muted-foreground max-w-[150px]">
                              <span className="truncate block">{hotel?.name ?? "—"}</span>
                            </td>
                            <td className="px-5 py-3">
                              <Badge variant="secondary" className="text-xs">{room?.name ?? "—"}</Badge>
                            </td>
                            <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                              {formatDateShort(booking.check_in)} → {formatDateShort(booking.check_out)}
                            </td>
                            <td className="px-5 py-3 text-center text-sm font-medium">{booking.nights}</td>
                            <td className="px-5 py-3 font-medium text-sm">{formatPrice(booking.estimated_total)}</td>
                            <td className="px-5 py-3">
                              <Badge className={
                                booking.status === "confirmed" ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                : booking.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200 text-xs"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                              }>
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                {booking.status !== "confirmed" && (
                                  <Button
                                    variant="ghost" size="sm"
                                    className="h-7 px-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-50"
                                    onClick={() => handleConfirmBooking(booking.id)}
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm
                                  </Button>
                                )}
                                {booking.status !== "cancelled" && (
                                  <Button
                                    variant="ghost" size="sm"
                                    className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-red-50"
                                    onClick={() => handleCancelBooking(booking.id)}
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

              {/* Booking Detail Dialog */}
              <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Booking Request</DialogTitle>
                  </DialogHeader>
                  {selectedBooking && (() => {
                    const hotel = hotels.find((h) => h.id === selectedBooking.hotel_id);
                    const room = (hotelRooms[selectedBooking.hotel_id] ?? []).find((r) => r.id === selectedBooking.room_type_id);
                    return (
                      <div className="space-y-4 py-1">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {selectedBooking.guest_name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm">{selectedBooking.guest_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{selectedBooking.guest_email}</p>
                          </div>
                          <Badge className={
                            selectedBooking.status === "confirmed" ? "ml-auto bg-green-50 text-green-700 border-green-200 text-xs"
                            : selectedBooking.status === "cancelled" ? "ml-auto bg-red-50 text-red-700 border-red-200 text-xs"
                            : "ml-auto bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                          }>
                            {selectedBooking.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground mb-0.5">Hotel</p>
                            <p className="font-medium">{hotel?.name ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">{hotel?.address}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Room</p>
                            <p>{room?.name ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                            <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground" />{selectedBooking.guest_phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Check-in</p>
                            <p className="flex items-center gap-1"><CalendarDays className="w-3 h-3 text-primary" />{formatDate(selectedBooking.check_in)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Check-out</p>
                            <p className="flex items-center gap-1"><CalendarDays className="w-3 h-3 text-secondary" />{formatDate(selectedBooking.check_out)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Rooms / Guests</p>
                            <p>{selectedBooking.rooms} room{selectedBooking.rooms > 1 ? "s" : ""} · {selectedBooking.guests} guest{selectedBooking.guests > 1 ? "s" : ""}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Nights</p>
                            <p>{selectedBooking.nights}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground mb-0.5">Estimated Total</p>
                            <p className="font-heading font-bold text-foreground">{formatPrice(selectedBooking.estimated_total)}</p>
                          </div>
                          {selectedBooking.special_requests && (
                            <div className="col-span-2">
                              <p className="text-xs text-muted-foreground mb-0.5">Special Requests</p>
                              <p className="text-sm bg-muted/40 rounded-lg p-2.5">{selectedBooking.special_requests}</p>
                            </div>
                          )}
                        </div>
                        <Separator className="opacity-30" />
                        <div className="flex gap-2">
                          {selectedBooking.status !== "confirmed" && (
                            <Button
                              className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white border-0"
                              onClick={() => handleConfirmBooking(selectedBooking.id)}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Confirm Booking
                            </Button>
                          )}
                          {selectedBooking.status !== "cancelled" && (
                            <Button
                              variant="outline"
                              className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-red-50"
                              onClick={() => handleCancelBooking(selectedBooking.id)}
                            >
                              <X className="w-4 h-4" /> Decline
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => window.open(`mailto:${selectedBooking.guest_email}?subject=Your booking request for ${hotel?.name ?? "your stay"}`)}
                        >
                          <Mail className="w-4 h-4" /> Email Guest
                        </Button>
                      </div>
                    );
                  })()}
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

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border flex items-center justify-around px-1 py-1.5">
        {navItems.slice(0, 5).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0 flex-1 ${
              section === id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {id === "orders" && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-white rounded-full text-[8px] flex items-center justify-center leading-none font-bold">
                  {orders.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium truncate">{label}</span>
          </button>
        ))}
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0 flex-1 text-muted-foreground"
        >
          <Eye className="w-5 h-5" />
          <span className="text-[10px] font-medium">Site</span>
        </Link>
      </nav>

      {/* Mobile bottom nav spacer */}
      <div className="h-16 md:hidden" />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RouteGuard requireAdmin>
      <AdminDashboardContent />
    </RouteGuard>
  );
}
