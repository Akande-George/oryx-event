"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Clock, MapPin, Share2, Heart, Users,
  ChevronRight, Info, Mail, Globe, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TicketPackageCard from "@/components/events/TicketPackageCard";
import { mockEvents, mockPackages } from "@/lib/mock-data";
import { TicketPackage } from "@/types";
import { formatDate, formatTime, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{ pkg: TicketPackage; qty: number } | null>(null);

  const event = mockEvents.find((e) => e.id === id);
  if (!event) notFound();

  const packages = mockPackages[id] ?? [];

  const handleSelectPackage = (pkg: TicketPackage, qty: number) => {
    setSelectedPackage({ pkg, qty });
    router.push(`/checkout?eventId=${event.id}&packageId=${pkg.id}&qty=${qty}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero banner */}
      <div className="relative h-[50vh] min-h-[360px] max-h-[520px] overflow-hidden">
        <Image
          src={event.image_url}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />

        {/* Back button */}
        <div className="absolute top-20 left-4 sm:left-8">
          <Button variant="outline" size="sm" asChild className="bg-black/40 border-white/20 text-white hover:bg-black/60 gap-2 backdrop-blur-sm">
            <Link href="/events">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </Button>
        </div>

        {/* Action buttons */}
        <div className="absolute top-20 right-4 sm:right-8 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-black/40 border-white/20 text-white hover:bg-black/60 backdrop-blur-sm"
            onClick={() => navigator.share?.({ title: event.title, url: window.location.href })}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "border-white/20 backdrop-blur-sm",
              liked ? "bg-primary/80 text-white" : "bg-black/40 text-white hover:bg-black/60"
            )}
            onClick={() => setLiked(!liked)}
          >
            <Heart className={cn("w-4 h-4", liked && "fill-white")} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 pb-16 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Event header */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-primary/20 text-primary border-primary/30">{event.category}</Badge>
                {event.is_featured && <Badge className="bg-secondary/20 text-secondary border-secondary/30">Featured</Badge>}
              </div>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-5 leading-tight">
                {event.title}
              </h1>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Calendar, label: "Date", value: formatDate(event.date), color: "text-primary" },
                  { icon: Clock, label: "Time", value: `${formatTime(event.date)}${event.end_date ? ` – ${formatTime(event.end_date)}` : ""}`, color: "text-secondary" },
                  { icon: MapPin, label: "Venue", value: event.venue, color: "text-accent" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className={cn("mt-0.5", color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Tabs defaultValue="about">
              <TabsList className="mb-6 bg-muted/30 border border-border/50">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="organizer">Organizer</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                <div className="flex items-start gap-2 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Dress code and entry requirements may apply. Please arrive at least 30 minutes before the event starts.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="location">
                <div className="rounded-xl overflow-hidden border border-border/50 aspect-video bg-muted/50 flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
                    <p className="font-heading font-semibold text-lg mb-1">{event.venue}</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                    <Button variant="outline" size="sm" className="mt-4 gap-2" asChild>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(event.venue)}`} target="_blank" rel="noreferrer">
                        Open in Maps <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="organizer">
                <div className="flex items-center gap-4 p-5 rounded-xl bg-muted/30 border border-border/50">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground">{event.organizer}</p>
                    <p className="text-sm text-muted-foreground">Event Organizer</p>
                    <Button variant="link" size="sm" className="p-0 h-auto text-primary mt-1">
                      View profile →
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Ticket sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <h2 className="font-heading font-bold text-xl text-foreground">Select Tickets</h2>
              <p className="text-sm text-muted-foreground">
                Choose your preferred ticket package below.
              </p>
              {packages.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-2xl border border-border/50">
                  <p className="text-muted-foreground text-sm">No ticket packages available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <TicketPackageCard key={pkg.id} pkg={pkg} onSelect={handleSelectPackage} />
                  ))}
                </div>
              )}
              <Separator className="opacity-30" />
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                All ticket sales are final. Refunds are subject to the organizer&apos;s policy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
