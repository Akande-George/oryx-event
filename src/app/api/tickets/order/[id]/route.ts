import { createServiceClient } from "@/lib/supabase/service";
import { buildEventTicketPdf } from "@/lib/pdf/documents";
import { formatDate, formatPrice } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, quantity, total_price, payment_status, payment_reference, guest_name, event:events(title, date, venue, location), ticket_package:ticket_packages(name, tier)",
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    return new Response("Ticket not found.", { status: 404 });
  }
  if (order.payment_status !== "paid") {
    return new Response("This ticket is not available until payment is confirmed.", {
      status: 403,
    });
  }

  const event = (order.event ?? {}) as {
    title?: string;
    date?: string;
    venue?: string;
    location?: string;
  };
  const pkg = (order.ticket_package ?? {}) as { name?: string; tier?: string };

  const pdf = await buildEventTicketPdf({
    reference: order.payment_reference ?? order.id,
    guestName: order.guest_name ?? "Guest",
    eventTitle: event.title ?? "Event",
    eventDate: event.date ? formatDate(event.date) : "—",
    venue: event.venue ?? "—",
    location: event.location ?? "",
    packageName: pkg.name ?? "—",
    tier: pkg.tier ?? "",
    quantity: order.quantity,
    totalPaid: formatPrice(order.total_price),
  });

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="oryx-ticket-${order.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
