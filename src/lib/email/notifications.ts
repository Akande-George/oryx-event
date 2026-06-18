// Server-only: fetch the row with the service client and send the matching
// Resend email. Safe to call from server actions and the payment webhook.

import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "./resend";
import {
  bookingConfirmedEmail,
  bookingReceivedEmail,
  orderConfirmationEmail,
} from "./templates";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
}

export async function sendOrderConfirmation(orderId: string) {
  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, quantity, total_price, guest_name, guest_email, event:events(title, date, venue), ticket_package:ticket_packages(name)",
    )
    .eq("id", orderId)
    .single();
  if (!order?.guest_email) return;

  const event = (order.event ?? {}) as {
    title?: string;
    date?: string;
    venue?: string;
  };
  const pkg = (order.ticket_package ?? {}) as { name?: string };
  const base = siteUrl();

  const { subject, html } = orderConfirmationEmail({
    guestName: order.guest_name ?? "",
    eventTitle: event.title ?? "your event",
    eventDate: event.date,
    venue: event.venue,
    packageName: pkg.name,
    quantity: order.quantity,
    total: order.total_price,
    ticketUrl: base ? `${base}/api/tickets/order/${order.id}` : undefined,
  });
  await sendEmail({ to: order.guest_email, subject, html });
}

export async function sendBookingReceived(bookingId: string) {
  const supabase = createServiceClient();
  const { data: booking } = await supabase
    .from("hotel_bookings")
    .select(
      "id, nights, estimated_total, check_in, check_out, guest_name, guest_email, hotel:hotels(name), room_type:room_types(name)",
    )
    .eq("id", bookingId)
    .single();
  if (!booking?.guest_email) return;

  const hotel = (booking.hotel ?? {}) as { name?: string };
  const room = (booking.room_type ?? {}) as { name?: string };

  const { subject, html } = bookingReceivedEmail({
    guestName: booking.guest_name ?? "",
    hotelName: hotel.name ?? "the hotel",
    roomName: room.name,
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    nights: booking.nights,
    estimatedTotal: booking.estimated_total,
  });
  await sendEmail({ to: booking.guest_email, subject, html });
}

export async function sendBookingConfirmed(bookingId: string) {
  const supabase = createServiceClient();
  const { data: booking } = await supabase
    .from("hotel_bookings")
    .select(
      "id, status, nights, estimated_total, check_in, check_out, guest_name, guest_email, hotel:hotels(name), room_type:room_types(name)",
    )
    .eq("id", bookingId)
    .single();
  if (!booking?.guest_email || booking.status !== "confirmed") return;

  const hotel = (booking.hotel ?? {}) as { name?: string };
  const room = (booking.room_type ?? {}) as { name?: string };
  const base = siteUrl();

  const { subject, html } = bookingConfirmedEmail({
    guestName: booking.guest_name ?? "",
    hotelName: hotel.name ?? "the hotel",
    roomName: room.name,
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    nights: booking.nights,
    estimatedTotal: booking.estimated_total,
    passUrl: base ? `${base}/api/tickets/booking/${booking.id}` : undefined,
  });
  await sendEmail({ to: booking.guest_email, subject, html });
}
