"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Phone,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, formatDateShort, formatPrice } from "@/lib/utils";
import { useAdminData } from "@/lib/admin/context";
import { HotelBooking } from "@/types";
import PageHeader from "../_components/PageHeader";
import EmailGuestButtons from "../_components/EmailGuestButtons";
import PaymentBadge from "../_components/PaymentBadge";

export default function AdminBookingsPage() {
  const { hotels, hotelRooms, bookings, updateBookingStatus } = useAdminData();
  const [selected, setSelected] = useState<HotelBooking | null>(null);

  const setStatus = async (id: string, status: HotelBooking["status"]) => {
    const ok = await updateBookingStatus(id, status);
    if (ok && selected?.id === id) {
      setSelected((b) => (b ? { ...b, status } : b));
    }
  };

  return (
    <>
      <PageHeader
        title="Hotel Bookings"
        subtitle="Incoming stay requests to fulfil"
      />

      <div className="p-4 sm:p-6 space-y-6">
        <Card className="border-border">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <h2 className="font-heading font-semibold text-base">
              Booking Requests ({bookings.length})
            </h2>
            <div className="flex gap-2">
              <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs gap-1">
                <Clock className="w-3 h-3" />
                {bookings.filter((b) => b.status === "pending").length} pending
              </Badge>
              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {bookings.filter((b) => b.status === "confirmed").length}{" "}
                confirmed
              </Badge>
              <Badge className="bg-red-50 text-red-700 border-red-200 text-xs gap-1">
                <XCircle className="w-3 h-3" />
                {bookings.filter((b) => b.status === "cancelled").length}{" "}
                cancelled
              </Badge>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Ref",
                    "Guest",
                    "Hotel",
                    "Room",
                    "Dates",
                    "Nights",
                    "Est. Total",
                    "Payment",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs text-muted-foreground font-medium px-5 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const hotel = hotels.find((h) => h.id === booking.hotel_id);
                  const room = (hotelRooms[booking.hotel_id] ?? []).find(
                    (r) => r.id === booking.room_type_id,
                  );
                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-border/40 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => setSelected(booking)}
                    >
                      <td className="px-5 py-3 text-xs font-mono text-muted-foreground">
                        {booking.id}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-sm">
                          {booking.guest_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.guest_email}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground max-w-[150px]">
                        <span className="truncate block">
                          {hotel?.name ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="secondary" className="text-xs">
                          {room?.name ?? "—"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateShort(booking.check_in)} →{" "}
                        {formatDateShort(booking.check_out)}
                      </td>
                      <td className="px-5 py-3 text-center text-sm font-medium">
                        {booking.nights}
                      </td>
                      <td className="px-5 py-3 font-medium text-sm">
                        {formatPrice(booking.estimated_total)}
                      </td>
                      <td className="px-5 py-3">
                        <PaymentBadge status={booking.payment_status} />
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          className={
                            booking.status === "confirmed"
                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                              : booking.status === "cancelled"
                                ? "bg-red-50 text-red-700 border-red-200 text-xs"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </td>
                      <td
                        className="px-5 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          {booking.status !== "confirmed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-50"
                              onClick={() =>
                                setStatus(booking.id, "confirmed")
                              }
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm
                            </Button>
                          )}
                          {booking.status !== "cancelled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-red-50"
                              onClick={() =>
                                setStatus(booking.id, "cancelled")
                              }
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

        <Dialog
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Booking Request</DialogTitle>
            </DialogHeader>
            {selected &&
              (() => {
                const hotel = hotels.find((h) => h.id === selected.hotel_id);
                const room = (hotelRooms[selected.hotel_id] ?? []).find(
                  (r) => r.id === selected.room_type_id,
                );
                return (
                  <div className="space-y-4 py-1">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {selected.guest_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">
                          {selected.guest_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {selected.guest_email}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        <PaymentBadge status={selected.payment_status} />
                        <Badge
                          className={
                            selected.status === "confirmed"
                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                              : selected.status === "cancelled"
                                ? "bg-red-50 text-red-700 border-red-200 text-xs"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                          }
                        >
                          {selected.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Hotel
                        </p>
                        <p className="font-medium">{hotel?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {hotel?.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Room
                        </p>
                        <p>{room?.name ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Phone
                        </p>
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {selected.guest_phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Check-in
                        </p>
                        <p className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3 text-primary" />
                          {formatDate(selected.check_in)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Check-out
                        </p>
                        <p className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3 text-secondary" />
                          {formatDate(selected.check_out)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Rooms / Guests
                        </p>
                        <p>
                          {selected.rooms} room
                          {selected.rooms > 1 ? "s" : ""} · {selected.guests}{" "}
                          guest{selected.guests > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Nights
                        </p>
                        <p>{selected.nights}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Estimated Total
                        </p>
                        <p className="font-heading font-bold text-foreground">
                          {formatPrice(selected.estimated_total)}
                        </p>
                      </div>
                      {selected.special_requests && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Special Requests
                          </p>
                          <p className="text-sm bg-muted/40 rounded-lg p-2.5">
                            {selected.special_requests}
                          </p>
                        </div>
                      )}
                    </div>
                    <Separator className="opacity-30" />
                    <div className="flex gap-2">
                      {selected.status !== "confirmed" && (
                        <Button
                          className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white border-0"
                          onClick={() => setStatus(selected.id, "confirmed")}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Confirm Booking
                        </Button>
                      )}
                      {selected.status !== "cancelled" && (
                        <Button
                          variant="outline"
                          className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-red-50"
                          onClick={() => setStatus(selected.id, "cancelled")}
                        >
                          <X className="w-4 h-4" /> Decline
                        </Button>
                      )}
                    </div>
                    <EmailGuestButtons
                      email={selected.guest_email}
                      subject={`Your booking request for ${
                        hotel?.name ?? "your stay"
                      }`}
                      label="guest email"
                    />
                  </div>
                );
              })()}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
