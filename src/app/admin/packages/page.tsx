"use client";

import { useState } from "react";
import { CheckCircle2, Plus, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatPrice } from "@/lib/utils";
import { useAdminData } from "@/lib/admin/context";
import PageHeader from "../_components/PageHeader";

const TIER_OPTIONS = ["Regular", "VIP", "Table"] as const;

const blankPkg = {
  event_id: "",
  name: "",
  tier: "" as "Regular" | "VIP" | "Table" | "",
  price: "",
  total_slots: "",
  perks: "",
};

export default function AdminPackagesPage() {
  const {
    events,
    packages,
    createPackage,
    togglePackage,
    deletePackage,
  } = useAdminData();
  const [addOpen, setAddOpen] = useState(false);
  const [newPkg, setNewPkg] = useState(blankPkg);

  const handleAdd = async () => {
    if (
      !newPkg.event_id ||
      !newPkg.name ||
      !newPkg.tier ||
      !newPkg.price ||
      !newPkg.total_slots
    )
      return;
    const perks = newPkg.perks
      ? newPkg.perks
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const created = await createPackage({
      event_id: newPkg.event_id,
      name: newPkg.name,
      tier: newPkg.tier as "Regular" | "VIP" | "Table",
      price: parseFloat(newPkg.price),
      perks,
      total_slots: parseInt(newPkg.total_slots, 10),
    });
    if (created) {
      setAddOpen(false);
      setNewPkg(blankPkg);
    }
  };

  const addAction = (
    <Dialog open={addOpen} onOpenChange={setAddOpen}>
      <DialogTrigger
        render={
          <Button className="gradient-primary border-0 text-white shadow-sm gap-2 shrink-0" />
        }
      >
        <Plus className="w-4 h-4" />{" "}
        <span className="hidden sm:inline">Add Package</span>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Add Ticket Package</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Event</Label>
            <Select
              value={newPkg.event_id}
              onValueChange={(v) =>
                v && setNewPkg({ ...newPkg, event_id: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event…" />
              </SelectTrigger>
              <SelectContent>
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pkg-name">Package Name</Label>
              <Input
                id="pkg-name"
                placeholder="Early Bird"
                value={newPkg.name}
                onChange={(e) =>
                  setNewPkg({ ...newPkg, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tier</Label>
              <Select
                value={newPkg.tier}
                onValueChange={(v) =>
                  v &&
                  setNewPkg({
                    ...newPkg,
                    tier: v as "Regular" | "VIP" | "Table",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tier…" />
                </SelectTrigger>
                <SelectContent>
                  {TIER_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pkg-price">Price (QAR)</Label>
              <Input
                id="pkg-price"
                type="number"
                min="0"
                placeholder="450"
                value={newPkg.price}
                onChange={(e) =>
                  setNewPkg({ ...newPkg, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-slots">Total Slots</Label>
              <Input
                id="pkg-slots"
                type="number"
                min="1"
                placeholder="100"
                value={newPkg.total_slots}
                onChange={(e) =>
                  setNewPkg({ ...newPkg, total_slots: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pkg-perks">Perks (comma-separated)</Label>
            <Input
              id="pkg-perks"
              placeholder="Welcome drink, Name badge, Reserved seating"
              value={newPkg.perks}
              onChange={(e) =>
                setNewPkg({ ...newPkg, perks: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAddOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            className="gradient-primary border-0 text-white"
          >
            Add Package
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <PageHeader
        title="Packages"
        subtitle="Ticket tiers across all events"
        action={addAction}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {events.map((event) => {
          const pkgs = packages[event.id] ?? [];
          if (!pkgs.length) return null;
          return (
            <Card key={event.id} className="border-border">
              <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-muted shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sm">
                      {event.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.date)} · {event.venue}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-border">
                      {[
                        "Package",
                        "Tier",
                        "Price",
                        "Sold",
                        "Available",
                        "Status",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs text-muted-foreground font-medium px-5 py-2.5"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pkgs.map((pkg) => {
                      const sold = pkg.total_slots - pkg.available_slots;
                      return (
                        <tr
                          key={pkg.id}
                          className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-5 py-3 font-medium">{pkg.name}</td>
                          <td className="px-5 py-3">
                            <Badge variant="secondary" className="text-xs">
                              {pkg.tier}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 font-medium">
                            {formatPrice(pkg.price)}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {sold}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={
                                  pkg.available_slots < 20
                                    ? "text-destructive font-medium"
                                    : "text-foreground"
                                }
                              >
                                {pkg.available_slots}
                              </span>
                              <Progress
                                value={(sold / pkg.total_slots) * 100}
                                className="h-1 w-16"
                              />
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <Badge
                              className={
                                pkg.is_available
                                  ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                  : "bg-red-50 text-red-700 border-red-200 text-xs"
                              }
                            >
                              {pkg.is_available ? "On Sale" : "Closed"}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7 text-muted-foreground hover:text-primary"
                                onClick={() => togglePackage(pkg)}
                                title={
                                  pkg.is_available
                                    ? "Close sales"
                                    : "Open sales"
                                }
                              >
                                {pkg.is_available ? (
                                  <XCircle className="w-3.5 h-3.5" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7 text-muted-foreground hover:text-destructive"
                                onClick={() => deletePackage(pkg)}
                                title="Delete package"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
