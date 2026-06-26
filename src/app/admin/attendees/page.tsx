"use client";

import { useState } from "react";
import { CheckCircle2, Download, Eye } from "lucide-react";
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
import PageHeader from "../_components/PageHeader";
import EmailGuestButtons from "../_components/EmailGuestButtons";

export default function AdminAttendeesPage() {
  const { events, packages, orders } = useAdminData();

  const attendees = orders
    .filter((o) => o.status === "confirmed")
    .map((o) => {
      const event = events.find((e) => e.id === o.event_id);
      const pkgList = packages[o.event_id] ?? [];
      const pkg = pkgList.find((p) => p.id === o.package_id);
      return { ...o, event, pkg };
    });

  type Attendee = (typeof attendees)[number];
  const [selected, setSelected] = useState<Attendee | null>(null);

  const exportCSV = () => {
    const rows = [
      ["Name", "Email", "Event", "Package", "Qty", "Total", "Order Date"],
      ...attendees.map((a) => [
        a.guest_name ?? "",
        a.guest_email ?? "",
        a.event?.title ?? "",
        a.pkg?.name ?? "",
        String(a.quantity),
        String(a.total_price),
        new Date(a.created_at).toLocaleDateString("en-GB"),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendees.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAction = (
    <Button
      variant="outline"
      className="gap-2 border-border/50 shrink-0"
      onClick={exportCSV}
    >
      <Download className="w-4 h-4" />{" "}
      <span className="hidden sm:inline">Export CSV</span>
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Attendees"
        subtitle="People who have booked tickets"
        action={exportAction}
      />

      <div className="p-4 sm:p-6 space-y-6">
        <Card className="border-border">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <h2 className="font-heading font-semibold text-base">
              Attendees ({attendees.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Confirmed ticket holders
            </p>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "#",
                    "Name",
                    "Email",
                    "Event",
                    "Package",
                    "Tickets",
                    "Paid",
                    "",
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
                {attendees.map((a, i) => (
                  <tr
                    key={a.id}
                    className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {a.guest_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{a.guest_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {a.guest_email}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground max-w-[160px]">
                      <span className="truncate block">
                        {a.event?.title ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="secondary" className="text-xs">
                        {a.pkg?.name ?? "—"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-center text-sm font-medium">
                      {a.quantity}
                    </td>
                    <td className="px-5 py-3 font-medium text-sm text-foreground">
                      {formatPrice(a.total_price)}
                    </td>
                    <td className="px-5 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => setSelected(a)}
                      >
                        <Eye className="w-3 h-3 mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
        >
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">
                Attendee Details
              </DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4 py-1">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {selected.guest_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-base">
                      {selected.guest_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selected.guest_email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Event
                    </p>
                    <p className="font-medium">
                      {selected.event?.title ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selected.event?.venue} ·{" "}
                      {selected.event ? formatDate(selected.event.date) : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Package
                    </p>
                    <p>{selected.pkg?.name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Tier</p>
                    <Badge variant="secondary" className="text-xs">
                      {selected.pkg?.tier ?? "—"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Tickets
                    </p>
                    <p>{selected.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Total Paid
                    </p>
                    <p className="font-heading font-bold">
                      {formatPrice(selected.total_price)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Order ID
                    </p>
                    <p className="font-mono text-xs">{selected.id}</p>
                  </div>
                  {selected.pkg?.perks && selected.pkg.perks.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Perks Included
                      </p>
                      <ul className="space-y-1">
                        {selected.pkg.perks.map((perk) => (
                          <li
                            key={perk}
                            className="flex items-center gap-2 text-xs"
                          >
                            <CheckCircle2 className="w-3 h-3 text-secondary shrink-0" />{" "}
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Separator className="opacity-30" />
                <EmailGuestButtons
                  email={selected.guest_email ?? ""}
                  subject={`Your ticket for ${
                    selected.event?.title ?? "the event"
                  }`}
                  label="email"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
