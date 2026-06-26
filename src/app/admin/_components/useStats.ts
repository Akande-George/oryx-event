"use client";

import { Calendar, Ticket, TrendingUp, Users } from "lucide-react";
import { useAdminData } from "@/lib/admin/context";
import { formatPrice } from "@/lib/utils";

export function useStats() {
  const { events, orders, bookings } = useAdminData();
  const confirmed = orders.filter((o) => o.status === "confirmed");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const totalTicketsSold = confirmed.reduce((s, o) => s + o.quantity, 0);

  // Revenue combines event ticket sales and confirmed hotel bookings.
  const eventRevenue = confirmed.reduce((s, o) => s + o.total_price, 0);
  const hotelRevenue = confirmedBookings.reduce(
    (s, b) => s + b.estimated_total,
    0,
  );
  const totalRevenue = eventRevenue + hotelRevenue;

  const stats = [
    {
      label: "Total Events",
      value: events.length,
      icon: Calendar,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Tickets Sold",
      value: totalTicketsSold.toLocaleString(),
      icon: Ticket,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Revenue",
      value: formatPrice(totalRevenue),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Attendees",
      value: totalTicketsSold.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return {
    stats,
    totalRevenue,
    eventRevenue,
    hotelRevenue,
    totalTicketsSold,
    confirmedBookingsCount: confirmedBookings.length,
  };
}
