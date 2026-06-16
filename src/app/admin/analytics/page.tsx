"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { useAdminData } from "@/lib/admin/context";
import PageHeader from "../_components/PageHeader";
import { useStats } from "../_components/useStats";

export default function AdminAnalyticsPage() {
  const { events, packages, orders } = useAdminData();
  const { stats, totalRevenue } = useStats();
  const confirmedOrders = orders.filter((o) => o.status === "confirmed");

  // Revenue grouped by event category, derived from confirmed orders.
  const revenueByCategory = (() => {
    const totals = new Map<string, number>();
    for (const order of confirmedOrders) {
      const event = events.find((e) => e.id === order.event_id);
      if (!event) continue;
      const category = event.category || "Uncategorised";
      totals.set(category, (totals.get(category) ?? 0) + order.total_price);
    }
    const sum = Array.from(totals.values()).reduce((s, v) => s + v, 0);
    return Array.from(totals.entries())
      .map(([label, value]) => ({
        label,
        value,
        pct: sum > 0 ? (value / sum) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  })();

  return (
    <>
      <PageHeader title="Analytics" subtitle="Sales and revenue breakdowns" />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border-border">
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

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="p-5 pb-3">
              <h3 className="font-heading font-semibold text-sm">
                Ticket Sales by Event
              </h3>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {events.slice(0, 5).map((event) => {
                const pkgs = packages[event.id] ?? [];
                const sold = pkgs.reduce(
                  (s, p) => s + (p.total_slots - p.available_slots),
                  0,
                );
                const total = pkgs.reduce((s, p) => s + p.total_slots, 0);
                const pct = total > 0 ? (sold / total) * 100 : 0;
                return (
                  <div key={event.id}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground truncate max-w-[200px]">
                        {event.title}
                      </span>
                      <span className="font-medium text-foreground shrink-0 ml-2">
                        {sold} / {total}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="p-5 pb-3">
              <h3 className="font-heading font-semibold text-sm">
                Revenue by Category
              </h3>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {revenueByCategory.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No confirmed orders yet.
                </p>
              ) : (
                revenueByCategory.map(({ label, value, pct }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-muted-foreground shrink-0 truncate">
                      {label}
                    </div>
                    <Progress value={pct} className="flex-1 h-1.5" />
                    <div className="text-xs font-medium text-foreground shrink-0 w-20 text-right">
                      {formatPrice(value)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border md:col-span-2">
            <CardHeader className="p-5 pb-3">
              <h3 className="font-heading font-semibold text-sm">
                Revenue Summary
              </h3>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Total Revenue
                  </p>
                  <p className="font-heading font-bold text-xl text-foreground">
                    {formatPrice(totalRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Avg. Order Value
                  </p>
                  <p className="font-heading font-bold text-xl text-foreground">
                    {formatPrice(
                      Math.round(
                        totalRevenue / (confirmedOrders.length || 1),
                      ),
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Confirmed Orders
                  </p>
                  <p className="font-heading font-bold text-xl text-foreground">
                    {confirmedOrders.length}
                  </p>
                </div>
              </div>
              <Separator className="my-4 opacity-30" />
              <div className="space-y-2">
                {confirmedOrders.slice(0, 4).map((order) => {
                  const event = events.find((e) => e.id === order.event_id);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-muted-foreground truncate max-w-[220px]">
                          {order.guest_name} · {event?.title}
                        </span>
                      </div>
                      <span className="font-medium text-foreground shrink-0">
                        {formatPrice(order.total_price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
