import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Event, TicketPackage } from "@/types";
import EventDetailView from "./EventDetailView";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, ticket_packages(*)")
    .eq("id", id)
    .maybeSingle();

  if (!event) notFound();

  const ev = event as Event;
  const packages = (ev.ticket_packages ?? []) as TicketPackage[];

  // Only fetch other events by the same organizer, not all events. Excludes
  // the current one server-side so the client doesn't have to filter.
  const { data: otherByOrganizer, count } = await supabase
    .from("events")
    .select("id, title, venue, date, image_url", { count: "exact" })
    .eq("is_published", true)
    .eq("organizer", ev.organizer)
    .neq("id", ev.id)
    .order("date", { ascending: true })
    .limit(3);

  const organizerEvents = (otherByOrganizer ?? []) as Array<
    Pick<Event, "id" | "title" | "venue" | "date" | "image_url">
  >;
  const organizerEventCount = (count ?? organizerEvents.length) + 1;

  return (
    <EventDetailView
      event={ev}
      packages={packages}
      organizerEvents={organizerEvents}
      organizerEventCount={organizerEventCount}
    />
  );
}
