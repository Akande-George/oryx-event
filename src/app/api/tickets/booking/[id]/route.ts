import { createServiceClient } from "@/lib/supabase/service";
import { buildHotelPassPdf } from "@/lib/pdf/documents";
import { formatDate, formatPrice } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: booking, error } = await supabase
    .from("hotel_bookings")
    .select(
      "id, status, nights, rooms, guests, check_in, check_out, estimated_total, payment_status, payment_reference, guest_name, hotel:hotels(name, address, city), room_type:room_types(name, beds)",
    )
    .eq("id", id)
    .single();

  if (error || !booking) {
    return new Response("Booking not found.", { status: 404 });
  }
  if (booking.status !== "confirmed") {
    return new Response(
      "This pass is not available until the booking is confirmed.",
      { status: 403 },
    );
  }

  const hotel = (booking.hotel ?? {}) as {
    name?: string;
    address?: string;
    city?: string;
  };
  const room = (booking.room_type ?? {}) as { name?: string; beds?: string };

  const pdf = await buildHotelPassPdf({
    reference: booking.payment_reference ?? booking.id,
    guestName: booking.guest_name ?? "Guest",
    hotelName: hotel.name ?? "Hotel",
    address: hotel.address ?? "",
    city: hotel.city ?? "",
    roomName: room.name ?? "—",
    beds: room.beds ?? "",
    checkIn: booking.check_in ? formatDate(booking.check_in) : "—",
    checkOut: booking.check_out ? formatDate(booking.check_out) : "—",
    nights: booking.nights,
    rooms: booking.rooms,
    guests: booking.guests,
    totalPaid: formatPrice(booking.estimated_total),
  });

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="oryx-hotel-pass-${booking.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
