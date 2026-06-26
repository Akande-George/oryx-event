"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  CheckCircle2,
  Edit,
  Eye,
  MapPin,
  Plus,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
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
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { useAdminData } from "@/lib/admin/context";
import { Hotel } from "@/types";
import ImageUploadInput from "@/components/ui/ImageUploadInput";
import MultiImageUploadInput from "@/components/ui/MultiImageUploadInput";
import PageHeader from "../_components/PageHeader";

const STAR_OPTIONS = ["5", "4", "3", "2", "1"];

const blankHotel = {
  name: "",
  city: "",
  location: "",
  address: "",
  star_rating: "5",
  description: "",
  image_url: "",
  amenities: "",
  images: [] as string[],
};

const blankRoom = {
  hotel_id: "",
  name: "",
  price_per_night: "",
  capacity: "",
  beds: "",
  amenities: "",
};

const parseList = (s: string) =>
  s
    ? s
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

export default function AdminHotelsPage() {
  const {
    hotels,
    hotelRooms,
    createHotel,
    updateHotel,
    deleteHotel,
    createRoom,
    toggleRoom,
    deleteRoom,
  } = useAdminData();

  const [createOpen, setCreateOpen] = useState(false);
  const [newHotel, setNewHotel] = useState(blankHotel);

  const [editId, setEditId] = useState<string | null>(null);
  const [editHotel, setEditHotel] = useState(blankHotel);

  const [deleteOpenId, setDeleteOpenId] = useState<string | null>(null);

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [newRoom, setNewRoom] = useState(blankRoom);

  const handleCreateHotel = async () => {
    if (!newHotel.name || !newHotel.city) return;
    const created = await createHotel({
      name: newHotel.name,
      description: newHotel.description,
      location: newHotel.location || newHotel.city,
      city: newHotel.city,
      address: newHotel.address,
      star_rating: parseInt(newHotel.star_rating, 10),
      amenities: parseList(newHotel.amenities),
      image_url: newHotel.image_url,
      images: newHotel.images,
    });
    if (created) {
      setCreateOpen(false);
      setNewHotel(blankHotel);
    }
  };

  const openEdit = (hotel: Hotel) => {
    setEditId(hotel.id);
    setEditHotel({
      name: hotel.name,
      city: hotel.city,
      location: hotel.location,
      address: hotel.address,
      star_rating: String(hotel.star_rating),
      description: hotel.description,
      image_url: hotel.image_url,
      amenities: hotel.amenities.join(", "),
      images: hotel.images ?? [],
    });
  };

  const handleEditSave = async () => {
    if (!editId || !editHotel.name) return;
    const updated = await updateHotel(editId, {
      name: editHotel.name,
      city: editHotel.city,
      location: editHotel.location,
      address: editHotel.address,
      star_rating: parseInt(editHotel.star_rating, 10),
      description: editHotel.description,
      image_url: editHotel.image_url,
      amenities: parseList(editHotel.amenities),
      images: editHotel.images,
    });
    if (updated) setEditId(null);
  };

  const handleDeleteHotel = async (id: string) => {
    const ok = await deleteHotel(id);
    if (ok) setDeleteOpenId(null);
  };

  const handleAddRoom = async () => {
    const missing: string[] = [];
    if (!newRoom.hotel_id) missing.push("Hotel");
    if (!newRoom.name) missing.push("Room Name");
    if (!newRoom.price_per_night) missing.push("Price / night");
    if (!newRoom.capacity) missing.push("Max Guests");
    if (missing.length) {
      toast.error(`Please fill in: ${missing.join(", ")}.`);
      return;
    }
    const created = await createRoom({
      hotel_id: newRoom.hotel_id,
      name: newRoom.name,
      price_per_night: parseFloat(newRoom.price_per_night),
      capacity: parseInt(newRoom.capacity, 10),
      beds: newRoom.beds || "1 King",
      amenities: parseList(newRoom.amenities),
    });
    if (created) {
      setAddRoomOpen(false);
      setNewRoom(blankRoom);
    }
  };

  const actions = (
    <div className="flex items-center gap-2 shrink-0">
      <Dialog open={addRoomOpen} onOpenChange={setAddRoomOpen}>
        <DialogTrigger
          render={
            <Button variant="outline" className="gap-2 border-border/50" />
          }
        >
          <BedDouble className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">Add Room</span>
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Room Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Hotel</Label>
              <Select
                value={newRoom.hotel_id}
                onValueChange={(v) =>
                  v && setNewRoom({ ...newRoom, hotel_id: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hotel…" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room Name</Label>
                <Input
                  id="room-name"
                  placeholder="Deluxe King"
                  value={newRoom.name}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-beds">Beds</Label>
                <Input
                  id="room-beds"
                  placeholder="1 King"
                  value={newRoom.beds}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, beds: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="room-price">Price / night (QAR)</Label>
                <Input
                  id="room-price"
                  type="number"
                  min="0"
                  placeholder="850"
                  value={newRoom.price_per_night}
                  onChange={(e) =>
                    setNewRoom({
                      ...newRoom,
                      price_per_night: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-cap">Max Guests</Label>
                <Input
                  id="room-cap"
                  type="number"
                  min="1"
                  placeholder="2"
                  value={newRoom.capacity}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, capacity: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-amenities">
                Amenities (comma-separated)
              </Label>
              <Input
                id="room-amenities"
                placeholder="Free Wi-Fi, Sea View, Bathtub"
                value={newRoom.amenities}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, amenities: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRoomOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRoom}
              className="gradient-primary border-0 text-white"
            >
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger
          render={
            <Button className="gradient-primary border-0 text-white shadow-sm gap-2" />
          }
        >
          <Plus className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">Create Hotel</span>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Create New Hotel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="hotel-name">Hotel Name</Label>
              <Input
                id="hotel-name"
                placeholder="Waldorf Astoria Doha"
                value={newHotel.name}
                onChange={(e) =>
                  setNewHotel({ ...newHotel, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="hotel-city">City</Label>
                <Input
                  id="hotel-city"
                  placeholder="Doha"
                  value={newHotel.city}
                  onChange={(e) =>
                    setNewHotel({ ...newHotel, city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Star Rating</Label>
                <Select
                  value={newHotel.star_rating}
                  onValueChange={(v) =>
                    v && setNewHotel({ ...newHotel, star_rating: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAR_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s} stars
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-location">Location (City, Country)</Label>
              <Input
                id="hotel-location"
                placeholder="Doha, Qatar"
                value={newHotel.location}
                onChange={(e) =>
                  setNewHotel({ ...newHotel, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-address">Address</Label>
              <Input
                id="hotel-address"
                placeholder="West Bay, Diplomatic District…"
                value={newHotel.address}
                onChange={(e) =>
                  setNewHotel({ ...newHotel, address: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor
                value={newHotel.description}
                onChange={(html) =>
                  setNewHotel({ ...newHotel, description: html })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-amenities">Amenities (comma-separated)</Label>
              <Input
                id="hotel-amenities"
                placeholder="Free Wi-Fi, Pool, Spa, Airport Transfer"
                value={newHotel.amenities}
                onChange={(e) =>
                  setNewHotel({ ...newHotel, amenities: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Main Image</Label>
              <ImageUploadInput
                value={newHotel.image_url}
                onChange={(url) => setNewHotel({ ...newHotel, image_url: url })}
                folder="oryx-hotels"
              />
            </div>
            <div className="space-y-2">
              <Label>Gallery Images</Label>
              <MultiImageUploadInput
                value={newHotel.images}
                onChange={(images) => setNewHotel({ ...newHotel, images })}
                folder="oryx-hotels"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateHotel}
              className="gradient-primary border-0 text-white"
            >
              Create Hotel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Hotels"
        subtitle="Manage hotel listings and rooms"
        action={actions}
      />

      <div className="p-4 sm:p-6 space-y-6">
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <h2 className="font-heading font-semibold text-base">
              All Hotels ({hotels.length})
            </h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Hotel",
                    "City",
                    "Rating",
                    "Rooms",
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
                {hotels.map((hotel) => {
                  const rms = hotelRooms[hotel.id] ?? [];
                  return (
                    <tr
                      key={hotel.id}
                      className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={hotel.image_url}
                              alt={hotel.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[180px]">
                              {hotel.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {hotel.address}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant="secondary"
                          className="text-xs gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          {hotel.city}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: hotel.star_rating }).map(
                            (_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 text-yellow-500 fill-yellow-500"
                              />
                            ),
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium">
                        {rms.length}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          className={
                            hotel.is_published
                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                              : "bg-muted text-muted-foreground text-xs"
                          }
                        >
                          {hotel.is_published ? "Live" : "Draft"}
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
                            <Link href={`/hotels/${hotel.id}`}>
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-muted-foreground hover:text-primary"
                            onClick={() => openEdit(hotel)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Dialog
                            open={deleteOpenId === hotel.id}
                            onOpenChange={(open) =>
                              !open && setDeleteOpenId(null)
                            }
                          >
                            <DialogTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-7 h-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => setDeleteOpenId(hotel.id)}
                                />
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Hotel?</DialogTitle>
                              </DialogHeader>
                              <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete{" "}
                                <strong>{hotel.name}</strong> and its rooms? This
                                action cannot be undone.
                              </p>
                              <DialogFooter className="mt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => setDeleteOpenId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeleteHotel(hotel.id)}
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

        {hotels.map((hotel) => {
          const rms = hotelRooms[hotel.id] ?? [];
          if (!rms.length) return null;
          return (
            <Card key={hotel.id} className="border-border">
              <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-muted shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hotel.image_url}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sm">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {rms.length} room type{rms.length > 1 ? "s" : ""} ·{" "}
                      {hotel.city}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-border">
                      {[
                        "Room",
                        "Beds",
                        "Capacity",
                        "Price / night",
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
                    {rms.map((room) => (
                      <tr
                        key={room.id}
                        className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium">{room.name}</td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {room.beds}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {room.capacity} guests
                        </td>
                        <td className="px-5 py-3 font-medium">
                          {formatPrice(room.price_per_night)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            className={
                              room.is_available
                                ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                : "bg-red-50 text-red-700 border-red-200 text-xs"
                            }
                          >
                            {room.is_available ? "Available" : "Closed"}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 text-muted-foreground hover:text-primary"
                              onClick={() => toggleRoom(room)}
                              title={
                                room.is_available ? "Close room" : "Open room"
                              }
                            >
                              {room.is_available ? (
                                <XCircle className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteRoom(room)}
                              title="Delete room"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Hotel Dialog */}
      <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Hotel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-hotel-name">Hotel Name</Label>
              <Input
                id="edit-hotel-name"
                value={editHotel.name}
                onChange={(e) =>
                  setEditHotel({ ...editHotel, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-hotel-city">City</Label>
                <Input
                  id="edit-hotel-city"
                  value={editHotel.city}
                  onChange={(e) =>
                    setEditHotel({ ...editHotel, city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Star Rating</Label>
                <Select
                  value={editHotel.star_rating}
                  onValueChange={(v) =>
                    v && setEditHotel({ ...editHotel, star_rating: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAR_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s} stars
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hotel-location">
                Location (City, Country)
              </Label>
              <Input
                id="edit-hotel-location"
                value={editHotel.location}
                onChange={(e) =>
                  setEditHotel({ ...editHotel, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hotel-address">Address</Label>
              <Input
                id="edit-hotel-address"
                value={editHotel.address}
                onChange={(e) =>
                  setEditHotel({ ...editHotel, address: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor
                value={editHotel.description}
                onChange={(html) =>
                  setEditHotel({ ...editHotel, description: html })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hotel-amenities">
                Amenities (comma-separated)
              </Label>
              <Input
                id="edit-hotel-amenities"
                value={editHotel.amenities}
                onChange={(e) =>
                  setEditHotel({ ...editHotel, amenities: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Main Image</Label>
              <ImageUploadInput
                value={editHotel.image_url}
                onChange={(url) =>
                  setEditHotel({ ...editHotel, image_url: url })
                }
                folder="oryx-hotels"
              />
            </div>
            <div className="space-y-2">
              <Label>Gallery Images</Label>
              <MultiImageUploadInput
                value={editHotel.images}
                onChange={(images) => setEditHotel({ ...editHotel, images })}
                folder="oryx-hotels"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>
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
