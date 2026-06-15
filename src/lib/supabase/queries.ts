import { createClient } from "./server";
import {
  Event,
  TicketPackage,
  Order,
  Profile,
  Hotel,
  RoomType,
  HotelBooking,
  Category,
} from "@/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) return [];
  return (data ?? []) as Category[];
}



export async function getEvents(options?: {
  category?: string;
  location?: string;
  search?: string;
  featured?: boolean;
}): Promise<Event[]> {
  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select("*, ticket_packages(*)")
    .eq("is_published", true)
    .order("date", { ascending: true });

  if (options?.category) query = query.eq("category", options.category);
  if (options?.location)
    query = query.ilike("location", `%${options.location}%`);
  if (options?.search) query = query.ilike("title", `%${options.search}%`);
  if (options?.featured) query = query.eq("is_featured", true);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Event[];
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_packages(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Event;
}

export async function getPackagesByEventId(
  eventId: string,
): Promise<TicketPackage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ticket_packages")
    .select("*")
    .eq("event_id", eventId)
    .eq("is_available", true)
    .order("price", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as TicketPackage[];
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, ticket_package:ticket_packages(*), event:events(*)")
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function getAllEvents(): Promise<Event[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, ticket_packages(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Event[];
}

export async function getHotels(options?: {
  city?: string;
  featured?: boolean;
  search?: string;
}): Promise<Hotel[]> {
  const supabase = await createClient();
  let query = supabase
    .from("hotels")
    .select("*, room_types(*)")
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.city) query = query.eq("city", options.city);
  if (options?.featured) query = query.eq("is_featured", true);
  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,description.ilike.%${options.search}%,location.ilike.%${options.search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Hotel[];
}

export async function getHotelById(id: string): Promise<Hotel | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hotels")
    .select("*, room_types(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Hotel;
}

export async function getRoomTypesByHotelId(
  hotelId: string,
): Promise<RoomType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_types")
    .select("*")
    .eq("hotel_id", hotelId)
    .eq("is_available", true)
    .order("price_per_night", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as RoomType[];
}

export async function getUserHotelBookings(
  userEmail: string,
): Promise<HotelBooking[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hotel_bookings")
    .select("*, hotel:hotels(*), room_type:room_types(*)")
    .eq("guest_email", userEmail)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as HotelBooking[];
}
