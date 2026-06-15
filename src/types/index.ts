/** Widened to string so DB-sourced categories are accepted without casts. */
export type EventCategory = string;

export interface Category {
  id: string;
  name: string;
  emoji: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  venue: string;
  date: string;
  end_date?: string;
  category: EventCategory;
  image_url: string;
  organizer: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  ticket_packages?: TicketPackage[];
}

export interface TicketPackage {
  id: string;
  event_id: string;
  name: string;
  tier: "Regular" | "VIP" | "Table";
  price: number;
  perks: string[];
  total_slots: number;
  available_slots: number;
  is_available: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id?: string;
  package_id: string;
  event_id: string;
  quantity: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  guest_name?: string;
  guest_email?: string;
  payment_reference?: string;
  created_at: string;
  ticket_package?: TicketPackage;
  event?: Event;
}

// ─── Hotels ──────────────────────────────────────────────────────────────────

export interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string; // City, Country
  city: string;
  address: string;
  image_url: string;
  images?: string[];
  star_rating: number; // 1–5
  amenities: string[];
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  room_types?: RoomType[];
}

export interface RoomType {
  id: string;
  hotel_id: string;
  name: string;
  description?: string;
  price_per_night: number;
  capacity: number; // max guests
  beds: string; // e.g. "1 King" / "2 Twin"
  amenities: string[];
  is_available: boolean;
  created_at: string;
}

// A client's request to book a stay. The booking is fulfilled by the Oryx team
// on the admin side — submitting a request does NOT confirm a reservation.
export interface HotelBooking {
  id: string;
  hotel_id: string;
  room_type_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string; // ISO date (YYYY-MM-DD)
  check_out: string; // ISO date (YYYY-MM-DD)
  nights: number;
  rooms: number;
  guests: number;
  special_requests?: string;
  estimated_total: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  hotel?: Hotel;
  room_type?: RoomType;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: "user" | "admin";
  created_at: string;
}

export interface CartItem {
  package: TicketPackage;
  event: Event;
  quantity: number;
}
