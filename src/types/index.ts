export type EventCategory =
  | "Music"
  | "Sports"
  | "Arts"
  | "Food & Drink"
  | "Business"
  | "Technology"
  | "Comedy"
  | "Fashion"
  | "Other";

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
