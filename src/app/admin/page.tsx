"use client";

import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useAdminData } from "@/lib/admin/context";
import PageHeader from "./_components/PageHeader";
import { useStats } from "./_components/useStats";

export default function AdminDashboardPage() {
  const { events, orders } = useAdminData();
  const { stats } = useStats();

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your events and sales"
      />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <Card
              key={label}
              className="border-border hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div
                  className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
                <p className="font-heading font-bold text-2xl text-foreground mb-0.5">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <h2 className="font-heading font-semibold text-base">
              Recent Orders
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs"
              asChild
            >
              <Link href="/admin/orders">View all</Link>
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Order ID", "Customer", "Event", "Amount", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs text-muted-foreground font-medium px-5 py-3"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => {
                  const event = events.find((e) => e.id === order.event_id);
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-border/40 hover:bg-muted/20 transition-colors"
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
                      <td className="px-5 py-3 text-sm text-muted-foreground truncate max-w-[160px]">
                        {event?.title ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium">
                        {formatPrice(order.total_price)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          className={
                            order.status === "confirmed"
                              ? "bg-green-50 text-green-700 border-green-200 text-xs gap-1"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs gap-1"
                          }
                        >
                          {order.status === "confirmed" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
