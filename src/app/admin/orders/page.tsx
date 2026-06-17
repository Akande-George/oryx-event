"use client";

import { useState } from "react";
import { CheckCircle2, Clock, X, XCircle } from "lucide-react";
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
import { formatDate, formatPrice } from "@/lib/utils";
import { useAdminData } from "@/lib/admin/context";
import { Order } from "@/types";
import PageHeader from "../_components/PageHeader";
import PaymentBadge from "../_components/PaymentBadge";

export default function AdminOrdersPage() {
  const { events, packages, orders, updateOrderStatus } = useAdminData();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const setStatus = async (id: string, status: Order["status"]) => {
    const ok = await updateOrderStatus(id, status);
    if (ok && selectedOrder?.id === id) {
      setSelectedOrder((o) => (o ? { ...o, status } : o));
    }
  };

  return (
    <>
      <PageHeader title="Orders" subtitle="All ticket purchase records" />

      <div className="p-4 sm:p-6 space-y-6">
        <Card className="border-border">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <h2 className="font-heading font-semibold text-base">
              All Orders ({orders.length})
            </h2>
            <div className="flex gap-2">
              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {orders.filter((o) => o.status === "confirmed").length} confirmed
              </Badge>
              <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs gap-1">
                <Clock className="w-3 h-3" />
                {orders.filter((o) => o.status === "pending").length} pending
              </Badge>
              <Badge className="bg-red-50 text-red-700 border-red-200 text-xs gap-1">
                <XCircle className="w-3 h-3" />
                {orders.filter((o) => o.status === "cancelled").length} cancelled
              </Badge>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Order",
                    "Customer",
                    "Event",
                    "Package",
                    "Qty",
                    "Total",
                    "Date",
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
                {orders.map((order) => {
                  const event = events.find((e) => e.id === order.event_id);
                  const pkgList = packages[order.event_id] ?? [];
                  const pkg = pkgList.find((p) => p.id === order.package_id);
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-border/40 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-5 py-3 text-xs font-mono text-muted-foreground">
                        {order.id}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-sm">
                          {order.guest_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.guest_email}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground max-w-[140px]">
                        <span className="truncate block">
                          {event?.title ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="secondary" className="text-xs">
                          {pkg?.name ?? "—"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-center text-sm font-medium">
                        × {order.quantity}
                      </td>
                      <td className="px-5 py-3 font-medium text-sm">
                        {formatPrice(order.total_price)}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short" },
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <PaymentBadge status={order.payment_status} />
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          className={
                            order.status === "confirmed"
                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                              : order.status === "cancelled"
                                ? "bg-red-50 text-red-700 border-red-200 text-xs"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td
                        className="px-5 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          {order.status !== "confirmed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-50"
                              onClick={() => setStatus(order.id, "confirmed")}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm
                            </Button>
                          )}
                          {order.status !== "cancelled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-red-50"
                              onClick={() => setStatus(order.id, "cancelled")}
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
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder &&
              (() => {
                const event = events.find(
                  (e) => e.id === selectedOrder.event_id,
                );
                const pkgList = packages[selectedOrder.event_id] ?? [];
                const pkg = pkgList.find(
                  (p) => p.id === selectedOrder.package_id,
                );
                return (
                  <div className="space-y-4 py-1">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {selectedOrder.guest_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {selectedOrder.guest_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedOrder.guest_email}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        <PaymentBadge status={selectedOrder.payment_status} />
                        <Badge
                          className={
                            selectedOrder.status === "confirmed"
                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                              : selectedOrder.status === "cancelled"
                                ? "bg-red-50 text-red-700 border-red-200 text-xs"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                          }
                        >
                          {selectedOrder.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Order ID
                        </p>
                        <p className="font-mono text-xs">{selectedOrder.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Order Date
                        </p>
                        <p>
                          {new Date(
                            selectedOrder.created_at,
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Event
                        </p>
                        <p className="font-medium">{event?.title ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {event?.venue} ·{" "}
                          {event ? formatDate(event.date) : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Package
                        </p>
                        <p>
                          {pkg?.name ?? "—"}{" "}
                          <span className="text-muted-foreground">
                            ({pkg?.tier})
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Quantity
                        </p>
                        <p>
                          {selectedOrder.quantity} ticket
                          {selectedOrder.quantity > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Unit Price
                        </p>
                        <p>{pkg ? formatPrice(pkg.price) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Total Paid
                        </p>
                        <p className="font-heading font-bold text-foreground">
                          {formatPrice(selectedOrder.total_price)}
                        </p>
                      </div>
                      {selectedOrder.payment_method && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Method
                          </p>
                          <p>{selectedOrder.payment_method}</p>
                        </div>
                      )}
                      {selectedOrder.payment_reference && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Payment Ref
                          </p>
                          <p className="font-mono text-xs">
                            {selectedOrder.payment_reference}
                          </p>
                        </div>
                      )}
                    </div>
                    <Separator className="opacity-30" />
                    <div className="flex gap-2">
                      {selectedOrder.status !== "confirmed" && (
                        <Button
                          className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white border-0"
                          onClick={() =>
                            setStatus(selectedOrder.id, "confirmed")
                          }
                        >
                          <CheckCircle2 className="w-4 h-4" /> Confirm Order
                        </Button>
                      )}
                      {selectedOrder.status !== "cancelled" && (
                        <Button
                          variant="outline"
                          className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-red-50"
                          onClick={() =>
                            setStatus(selectedOrder.id, "cancelled")
                          }
                        >
                          <X className="w-4 h-4" /> Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
