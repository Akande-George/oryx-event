"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { useAdminData } from "@/lib/admin/context";
import { Event, EventCategory } from "@/types";
import { toast } from "sonner";
import ImageUploadInput from "@/components/ui/ImageUploadInput";
import MultiImageUploadInput from "@/components/ui/MultiImageUploadInput";
import PageHeader from "../_components/PageHeader";

const blankEvent = {
  title: "",
  description: "",
  location: "",
  venue: "",
  date: "",
  end_date: "",
  category: "" as EventCategory | "",
  organizer: "",
  image_url: "",
  images: [] as string[],
};

export default function AdminEventsPage() {
  const {
    events,
    packages,
    categories,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useAdminData();

  const [createOpen, setCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState(blankEvent);
  // Min selectable datetime for the picker; set when the dialog opens so the
  // clock isn't read during render (which is impure).
  const [minDate, setMinDate] = useState("");

  const openCreate = (open: boolean) => {
    if (open) {
      const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
      setMinDate(d.toISOString().slice(0, 16));
    }
    setCreateOpen(open);
  };

  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState(blankEvent);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newEvent.title || !newEvent.category) {
      toast.error("Please fill in the event title and category.");
      return;
    }
    if (!newEvent.date) {
      toast.error("Please choose a date and time.");
      return;
    }
    if (new Date(newEvent.date).getTime() <= Date.now()) {
      toast.error("Event date must be in the future.");
      return;
    }
    if (
      newEvent.end_date &&
      new Date(newEvent.end_date).getTime() <= new Date(newEvent.date).getTime()
    ) {
      toast.error("End date must be after the start date.");
      return;
    }
    const created = await createEvent({
      ...newEvent,
      category: newEvent.category as EventCategory,
    });
    if (created) {
      setCreateOpen(false);
      setNewEvent(blankEvent);
    }
  };


  const handleEditOpen = (event: Event) => {
    setEditEventId(event.id);
    setEditEvent({
      title: event.title,
      description: event.description,
      location: event.location,
      venue: event.venue,
      date: event.date ? event.date.replace(" ", "T").slice(0, 16) : "",
      end_date: event.end_date
        ? event.end_date.replace(" ", "T").slice(0, 16)
        : "",
      category: event.category,
      organizer: event.organizer ?? "",
      image_url: event.image_url,
      images: event.images ?? [],
    });
  };

  const handleEditSave = async () => {
    if (!editEventId || !editEvent.title) return;
    if (
      editEvent.end_date &&
      new Date(editEvent.end_date).getTime() <=
        new Date(editEvent.date).getTime()
    ) {
      toast.error("End date must be after the start date.");
      return;
    }
    const updated = await updateEvent(editEventId, {
      ...editEvent,
      category: editEvent.category as EventCategory,
    });
    if (updated) setEditEventId(null);
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteEvent(id);
    if (ok) setDeleteId(null);
  };

  const createAction = (
    <Dialog open={createOpen} onOpenChange={openCreate}>
      <DialogTrigger
        render={
          <Button className="gradient-primary border-0 text-white shadow-sm gap-2 shrink-0" />
        }
      >
        <Plus className="w-4 h-4" />{" "}
        <span className="hidden sm:inline">Create Event</span>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Create New Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="admin-title">Event Title</Label>
            <Input
              id="admin-title"
              placeholder="Doha Jazz Gala"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="admin-date">Start Date & Time</Label>
              <Input
                id="admin-date"
                type="datetime-local"
                min={minDate}
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-category">Category</Label>
              <Select
                value={newEvent.category}
                onValueChange={(v) =>
                  v && setNewEvent({ ...newEvent, category: v as EventCategory })
                }
              >
                <SelectTrigger id="admin-category">
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.emoji} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-end-date">
              End Date & Time{" "}
              <span className="text-muted-foreground font-normal">
                (optional, for multi-day events)
              </span>
            </Label>
            <Input
              id="admin-end-date"
              type="datetime-local"
              min={newEvent.date || minDate}
              value={newEvent.end_date}
              onChange={(e) =>
                setNewEvent({ ...newEvent, end_date: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-venue">Venue</Label>
            <Input
              id="admin-venue"
              placeholder="Eko Hotels & Suites"
              value={newEvent.venue}
              onChange={(e) =>
                setNewEvent({ ...newEvent, venue: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-location">City</Label>
            <Input
              id="admin-location"
              placeholder="Doha, Qatar"
              value={newEvent.location}
              onChange={(e) =>
                setNewEvent({ ...newEvent, location: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-organizer">Organizer</Label>
            <Input
              id="admin-organizer"
              placeholder="Oryx Events"
              value={newEvent.organizer}
              onChange={(e) =>
                setNewEvent({ ...newEvent, organizer: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-desc">Description</Label>
            <Textarea
              id="admin-desc"
              placeholder="Describe your event…"
              rows={3}
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Main Image</Label>
            <ImageUploadInput
              value={newEvent.image_url}
              onChange={(url) => setNewEvent({ ...newEvent, image_url: url })}
              folder="oryx-events"
            />
          </div>
          <div className="space-y-2">
            <Label>Gallery Images</Label>
            <MultiImageUploadInput
              value={newEvent.images}
              onChange={(images) => setNewEvent({ ...newEvent, images })}
              folder="oryx-events"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className="gradient-primary border-0 text-white"
          >
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Create, edit and manage events"
        action={createAction}
      />

      <div className="p-4 sm:p-6 space-y-6">
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <h2 className="font-heading font-semibold text-base">
              All Events ({events.length})
            </h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Event",
                    "Category",
                    "Date",
                    "Tickets",
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
                {events.map((event) => {
                  const pkgs = packages[event.id] ?? [];
                  const sold = pkgs.reduce(
                    (s, p) => s + (p.total_slots - p.available_slots),
                    0,
                  );
                  const total = pkgs.reduce((s, p) => s + p.total_slots, 0);
                  return (
                    <tr
                      key={event.id}
                      className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[160px]">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {event.venue}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="secondary" className="text-xs">
                          {event.category}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {formatDate(event.date)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-medium">
                          {sold} / {total}
                        </p>
                        <Progress
                          value={total > 0 ? (sold / total) * 100 : 0}
                          className="h-1 mt-1 w-16"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          className={
                            event.is_published
                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                              : "bg-muted text-muted-foreground text-xs"
                          }
                        >
                          {event.is_published ? "Live" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-muted-foreground hover:text-foreground"
                            asChild
                          >
                            <Link href={`/events/${event.id}`}>
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-muted-foreground hover:text-primary"
                            onClick={() => handleEditOpen(event)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Dialog
                            open={deleteId === event.id}
                            onOpenChange={(open) =>
                              !open && setDeleteId(null)
                            }
                          >
                            <DialogTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-7 h-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => setDeleteId(event.id)}
                                />
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Event?</DialogTitle>
                              </DialogHeader>
                              <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete{" "}
                                <strong>{event.title}</strong>? This action
                                cannot be undone.
                              </p>
                              <DialogFooter className="mt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => setDeleteId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(event.id)}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit Event Dialog */}
      <Dialog
        open={!!editEventId}
        onOpenChange={(open) => !open && setEditEventId(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Event Title</Label>
              <Input
                id="edit-title"
                value={editEvent.title}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, title: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Start Date & Time</Label>
                <Input
                  id="edit-date"
                  type="datetime-local"
                  value={editEvent.date}
                  onChange={(e) =>
                    setEditEvent({ ...editEvent, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editEvent.category}
                  onValueChange={(v) =>
                    v &&
                    setEditEvent({ ...editEvent, category: v as EventCategory })
                  }
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.emoji} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end-date">
                End Date & Time{" "}
                <span className="text-muted-foreground font-normal">
                  (optional, for multi-day events)
                </span>
              </Label>
              <Input
                id="edit-end-date"
                type="datetime-local"
                min={editEvent.date}
                value={editEvent.end_date}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, end_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-venue">Venue</Label>
              <Input
                id="edit-venue"
                value={editEvent.venue}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, venue: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">City</Label>
              <Input
                id="edit-location"
                value={editEvent.location}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-organizer">Organizer</Label>
              <Input
                id="edit-organizer"
                value={editEvent.organizer}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, organizer: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                rows={3}
                value={editEvent.description}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Main Image</Label>
              <ImageUploadInput
                value={editEvent.image_url}
                onChange={(url) =>
                  setEditEvent({ ...editEvent, image_url: url })
                }
                folder="oryx-events"
              />
            </div>
            <div className="space-y-2">
              <Label>Gallery Images</Label>
              <MultiImageUploadInput
                value={editEvent.images}
                onChange={(images) => setEditEvent({ ...editEvent, images })}
                folder="oryx-events"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEventId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              className="gradient-primary border-0 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
