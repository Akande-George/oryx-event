"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Category,
  Event,
  EventCategory,
  Hotel,
  HotelBooking,
  Order,
  RoomType,
  TicketPackage,
} from "@/types";

export type NewEventInput = {
  title: string;
  description: string;
  location: string;
  venue: string;
  date: string;
  end_date?: string | null;
  category: EventCategory;
  image_url: string;
  images: string[];
};

export type EventPatch = Partial<NewEventInput>;

export type NewHotelInput = {
  name: string;
  description: string;
  location: string;
  city: string;
  address: string;
  star_rating: number;
  amenities: string[];
  image_url: string;
  images: string[];
};

export type HotelPatch = Partial<NewHotelInput>;

export type NewRoomInput = {
  hotel_id: string;
  name: string;
  price_per_night: number;
  capacity: number;
  beds: string;
  amenities: string[];
};

export type NewPackageInput = {
  event_id: string;
  name: string;
  tier: "Regular" | "VIP" | "Table";
  price: number;
  perks: string[];
  total_slots: number;
};

export type OrderStatus = Order["status"];
export type BookingStatus = HotelBooking["status"];

type AdminDataValue = {
  loading: boolean;

  events: Event[];
  packages: Record<string, TicketPackage[]>;
  orders: Order[];
  hotels: Hotel[];
  hotelRooms: Record<string, RoomType[]>;
  bookings: HotelBooking[];
  categories: Category[];

  createEvent: (input: NewEventInput) => Promise<Event | null>;
  updateEvent: (id: string, patch: EventPatch) => Promise<Event | null>;
  deleteEvent: (id: string) => Promise<boolean>;

  createHotel: (input: NewHotelInput) => Promise<Hotel | null>;
  updateHotel: (id: string, patch: HotelPatch) => Promise<Hotel | null>;
  deleteHotel: (id: string) => Promise<boolean>;

  createRoom: (input: NewRoomInput) => Promise<RoomType | null>;
  toggleRoom: (room: RoomType) => Promise<void>;
  deleteRoom: (room: RoomType) => Promise<void>;

  createPackage: (input: NewPackageInput) => Promise<TicketPackage | null>;
  togglePackage: (pkg: TicketPackage) => Promise<void>;
  deletePackage: (pkg: TicketPackage) => Promise<void>;

  updateOrderStatus: (id: string, status: OrderStatus) => Promise<boolean>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<boolean>;

  createCategory: (input: {
    name: string;
    emoji: string;
  }) => Promise<Category | null>;
  updateCategory: (
    id: string,
    patch: { name: string; emoji: string },
  ) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;
};

const AdminDataContext = createContext<AdminDataValue | null>(null);

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx)
    throw new Error("useAdminData must be used inside <AdminDataProvider>");
  return ctx;
}

function groupBy<T, K extends string>(rows: T[], key: (row: T) => K) {
  return rows.reduce(
    (acc, row) => {
      const k = key(row);
      acc[k] = acc[k] ? [...acc[k], row] : [row];
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(true);

  const [events, setEvents] = useState<Event[]>([]);
  const [packages, setPackages] = useState<Record<string, TicketPackage[]>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelRooms, setHotelRooms] = useState<Record<string, RoomType[]>>({});
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [
        eventsRes,
        packagesRes,
        ordersRes,
        hotelsRes,
        roomsRes,
        bookingsRes,
        catsRes,
      ] = await Promise.all([
        supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("ticket_packages")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("hotels")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("room_types")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("hotel_bookings")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name", { ascending: true }),
      ]);
      if (!mounted) return;

      if (eventsRes.data) setEvents(eventsRes.data as Event[]);
      if (ordersRes.data) setOrders(ordersRes.data as Order[]);
      if (hotelsRes.data) setHotels(hotelsRes.data as Hotel[]);
      if (bookingsRes.data) setBookings(bookingsRes.data as HotelBooking[]);
      if (catsRes.data?.length) setCategories(catsRes.data as Category[]);

      if (packagesRes.data) {
        setPackages(
          groupBy(packagesRes.data as TicketPackage[], (p) => p.event_id),
        );
      }
      if (roomsRes.data) {
        setHotelRooms(
          groupBy(roomsRes.data as RoomType[], (r) => r.hotel_id),
        );
      }
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  // ── Events ───────────────────────────────────────────────────────────
  const createEvent = useCallback(
    async (input: NewEventInput) => {
      const { data, error } = await supabase
        .from("events")
        .insert({
          ...input,
          // Empty string would break the timestamptz column; store null.
          end_date: input.end_date || null,
          organizer: "Admin",
          is_featured: false,
          is_published: true,
          image_url:
            input.image_url ||
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        })
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return null;
      }
      const row = data as Event;
      setEvents((prev) => [row, ...prev]);
      toast.success("Event created.");
      return row;
    },
    [supabase],
  );

  const updateEvent = useCallback(
    async (id: string, patch: EventPatch) => {
      const normalized =
        "end_date" in patch
          ? { ...patch, end_date: patch.end_date || null }
          : patch;
      const { data, error } = await supabase
        .from("events")
        .update(normalized)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return null;
      }
      const row = data as Event;
      setEvents((prev) => prev.map((e) => (e.id === id ? row : e)));
      toast.success("Event updated.");
      return row;
    },
    [supabase],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        return false;
      }
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Event deleted.");
      return true;
    },
    [supabase],
  );

  // ── Hotels ───────────────────────────────────────────────────────────
  const createHotel = useCallback(
    async (input: NewHotelInput) => {
      const { data, error } = await supabase
        .from("hotels")
        .insert({
          ...input,
          location: input.location || input.city,
          image_url:
            input.image_url ||
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80",
          is_featured: false,
          is_published: true,
        })
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return null;
      }
      const row = data as Hotel;
      setHotels((prev) => [row, ...prev]);
      setHotelRooms((prev) => ({ ...prev, [row.id]: [] }));
      toast.success("Hotel created.");
      return row;
    },
    [supabase],
  );

  const updateHotel = useCallback(
    async (id: string, patch: HotelPatch) => {
      const { data, error } = await supabase
        .from("hotels")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return null;
      }
      const row = data as Hotel;
      setHotels((prev) => prev.map((h) => (h.id === id ? row : h)));
      toast.success("Hotel updated.");
      return row;
    },
    [supabase],
  );

  const deleteHotel = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("hotels").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        return false;
      }
      setHotels((prev) => prev.filter((h) => h.id !== id));
      setHotelRooms((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast.success("Hotel deleted.");
      return true;
    },
    [supabase],
  );

  // ── Rooms ────────────────────────────────────────────────────────────
  const createRoom = useCallback(
    async (input: NewRoomInput) => {
      const { data, error } = await supabase
        .from("room_types")
        .insert({ ...input, is_available: true })
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return null;
      }
      const room = data as RoomType;
      setHotelRooms((prev) => ({
        ...prev,
        [room.hotel_id]: [...(prev[room.hotel_id] ?? []), room],
      }));
      toast.success("Room added.");
      return room;
    },
    [supabase],
  );

  const toggleRoom = useCallback(
    async (room: RoomType) => {
      const next = !room.is_available;
      const { error } = await supabase
        .from("room_types")
        .update({ is_available: next })
        .eq("id", room.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setHotelRooms((prev) => ({
        ...prev,
        [room.hotel_id]: (prev[room.hotel_id] ?? []).map((r) =>
          r.id === room.id ? { ...r, is_available: next } : r,
        ),
      }));
    },
    [supabase],
  );

  const deleteRoom = useCallback(
    async (room: RoomType) => {
      const { error } = await supabase
        .from("room_types")
        .delete()
        .eq("id", room.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setHotelRooms((prev) => ({
        ...prev,
        [room.hotel_id]: (prev[room.hotel_id] ?? []).filter(
          (r) => r.id !== room.id,
        ),
      }));
    },
    [supabase],
  );

  // ── Packages ─────────────────────────────────────────────────────────
  const createPackage = useCallback(
    async (input: NewPackageInput) => {
      const { data, error } = await supabase
        .from("ticket_packages")
        .insert({
          ...input,
          available_slots: input.total_slots,
          is_available: true,
        })
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return null;
      }
      const pkg = data as TicketPackage;
      setPackages((prev) => ({
        ...prev,
        [pkg.event_id]: [...(prev[pkg.event_id] ?? []), pkg],
      }));
      toast.success("Package added.");
      return pkg;
    },
    [supabase],
  );

  const togglePackage = useCallback(
    async (pkg: TicketPackage) => {
      const next = !pkg.is_available;
      const { error } = await supabase
        .from("ticket_packages")
        .update({ is_available: next })
        .eq("id", pkg.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setPackages((prev) => ({
        ...prev,
        [pkg.event_id]: (prev[pkg.event_id] ?? []).map((p) =>
          p.id === pkg.id ? { ...p, is_available: next } : p,
        ),
      }));
    },
    [supabase],
  );

  const deletePackage = useCallback(
    async (pkg: TicketPackage) => {
      const { error } = await supabase
        .from("ticket_packages")
        .delete()
        .eq("id", pkg.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setPackages((prev) => ({
        ...prev,
        [pkg.event_id]: (prev[pkg.event_id] ?? []).filter(
          (p) => p.id !== pkg.id,
        ),
      }));
    },
    [supabase],
  );

  // ── Orders / Bookings ────────────────────────────────────────────────
  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return false;
      }

      // A manual confirm reduces inventory too — but only if the payment
      // webhook hasn't already done it (guarded by slots_decremented).
      if (status === "confirmed") {
        const { data: row, error: readErr } = await supabase
          .from("orders")
          .select("package_id,quantity,slots_decremented")
          .eq("id", id)
          .single();
        if (readErr) {
          // Most likely the slots_decremented column is missing — surface it
          // so the admin knows to apply the migration, instead of silently
          // confirming without reducing stock.
          toast.error(
            `Confirmed, but ticket count not updated: ${readErr.message}`,
          );
        } else if (row && !row.slots_decremented) {
          const { error: rpcErr } = await supabase.rpc("decrement_slots", {
            p_package_id: row.package_id,
            p_quantity: row.quantity,
          });
          if (rpcErr) {
            toast.error(`Could not reduce ticket count: ${rpcErr.message}`);
          } else {
            await supabase
              .from("orders")
              .update({ slots_decremented: true })
              .eq("id", id);
            // Reflect the new availability locally without a full reload.
            setPackages((prev) => {
              const next: Record<string, TicketPackage[]> = {};
              for (const [eventId, list] of Object.entries(prev)) {
                next[eventId] = list.map((p) =>
                  p.id === row.package_id
                    ? {
                        ...p,
                        available_slots: Math.max(
                          0,
                          p.available_slots - row.quantity,
                        ),
                      }
                    : p,
                );
              }
              return next;
            });
            toast.success("Order confirmed. Ticket count updated.");
          }
        }
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      return true;
    },
    [supabase],
  );

  const updateBookingStatus = useCallback(
    async (id: string, status: BookingStatus) => {
      const { error } = await supabase
        .from("hotel_bookings")
        .update({ status })
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return false;
      }
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b)),
      );
      return true;
    },
    [supabase],
  );

  // ── Categories ───────────────────────────────────────────────────────
  const createCategory = useCallback(
    async (input: { name: string; emoji: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .insert(input)
        .select()
        .single();
      if (error) {
        if (error.code === "23505") {
          toast.error(`Category "${input.name}" already exists.`);
        } else {
          toast.error(error.message);
        }
        return null;
      }
      const cat = data as Category;
      setCategories((prev) =>
        [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)),
      );
      toast.success(`Category "${cat.name}" added.`);
      return cat;
    },
    [supabase],
  );

  const updateCategory = useCallback(
    async (id: string, patch: { name: string; emoji: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        if (error.code === "23505") {
          toast.error(`Category "${patch.name}" already exists.`);
        } else {
          toast.error(error.message);
        }
        return null;
      }
      const cat = data as Category;
      setCategories((prev) =>
        prev
          .map((c) => (c.id === id ? cat : c))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      toast.success("Category updated.");
      return cat;
    },
    [supabase],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return false;
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted.");
      return true;
    },
    [supabase],
  );

  const value = useMemo<AdminDataValue>(
    () => ({
      loading,
      events,
      packages,
      orders,
      hotels,
      hotelRooms,
      bookings,
      categories,
      createEvent,
      updateEvent,
      deleteEvent,
      createHotel,
      updateHotel,
      deleteHotel,
      createRoom,
      toggleRoom,
      deleteRoom,
      createPackage,
      togglePackage,
      deletePackage,
      updateOrderStatus,
      updateBookingStatus,
      createCategory,
      updateCategory,
      deleteCategory,
    }),
    [
      loading,
      events,
      packages,
      orders,
      hotels,
      hotelRooms,
      bookings,
      categories,
      createEvent,
      updateEvent,
      deleteEvent,
      createHotel,
      updateHotel,
      deleteHotel,
      createRoom,
      toggleRoom,
      deleteRoom,
      createPackage,
      togglePackage,
      deletePackage,
      updateOrderStatus,
      updateBookingStatus,
      createCategory,
      updateCategory,
      deleteCategory,
    ],
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}
