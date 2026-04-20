"use client";

import { useState } from "react";
import { Calendar, Download, MapPin, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatPrice } from "@/lib/utils";

interface TicketCardProps {
  order: {
    id: string;
    quantity: number;
    total_price: number;
    payment_reference?: string;
    ticket_package?: { name?: string } | null;
    event?: {
      title?: string;
      date?: string;
      venue?: string;
      image_url?: string;
    } | null;
  };
}

export default function TicketCard({ order }: TicketCardProps) {
  const [showQR, setShowQR] = useState(false);

  const handleDownload = () => {
    const content = [
      "═══════════════════════════════",
      "         ORYX EVENT TICKET      ",
      "═══════════════════════════════",
      `Event:    ${order.event?.title ?? "—"}`,
      `Date:     ${order.event?.date ? formatDate(order.event.date) : "—"}`,
      `Venue:    ${order.event?.venue ?? "—"}`,
      `Package:  ${order.ticket_package?.name ?? "—"}`,
      `Qty:      × ${order.quantity}`,
      `Total:    ${formatPrice(order.total_price)}`,
      `Ref:      ${order.payment_reference ?? order.id}`,
      "═══════════════════════════════",
      "   Please present this ticket   ",
      "     at the event entrance.     ",
      "═══════════════════════════════",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="border-border/50 hover:border-primary/30 transition-all">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            {order.event?.image_url && (
              <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                <img
                  src={order.event.image_url}
                  alt={order.event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-heading font-semibold text-base text-foreground leading-snug">
                  {order.event?.title}
                </h3>
                <Badge
                  variant="default"
                  className="bg-secondary/20 text-secondary border-secondary/30 shrink-0"
                >
                  confirmed
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                {order.event?.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" /> {formatDate(order.event.date)}
                  </span>
                )}
                {order.event?.venue && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-secondary" /> {order.event.venue}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{order.ticket_package?.name}</span> × {order.quantity} ·{" "}
                  <span className="font-semibold text-foreground">{formatPrice(order.total_price)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-border/50 text-xs h-8"
                    onClick={() => setShowQR(true)}
                  >
                    <QrCode className="w-3.5 h-3.5" /> Show QR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-border/50 text-xs h-8"
                    onClick={handleDownload}
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                </div>
              </div>
              {order.payment_reference && (
                <p className="text-xs text-muted-foreground mt-2">
                  Ref: <span className="font-mono text-foreground">{order.payment_reference}</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg">Your Ticket QR</h3>
              <button
                onClick={() => setShowQR(false)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* QR Code placeholder — shows a grid pattern with the order ref */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 bg-foreground/5 rounded-xl border border-border flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 80 80" className="w-40 h-40" xmlns="http://www.w3.org/2000/svg">
                  {/* Simulated QR pattern using deterministic pixels from the order id */}
                  <rect width="80" height="80" fill="white" />
                  {/* Corner squares */}
                  <rect x="4" y="4" width="20" height="20" rx="2" fill="#1a1a1a" />
                  <rect x="6" y="6" width="16" height="16" rx="1" fill="white" />
                  <rect x="8" y="8" width="12" height="12" rx="1" fill="#1a1a1a" />
                  <rect x="56" y="4" width="20" height="20" rx="2" fill="#1a1a1a" />
                  <rect x="58" y="6" width="16" height="16" rx="1" fill="white" />
                  <rect x="60" y="8" width="12" height="12" rx="1" fill="#1a1a1a" />
                  <rect x="4" y="56" width="20" height="20" rx="2" fill="#1a1a1a" />
                  <rect x="6" y="58" width="16" height="16" rx="1" fill="white" />
                  <rect x="8" y="60" width="12" height="12" rx="1" fill="#1a1a1a" />
                  {/* Data modules — generated from string hash */}
                  {Array.from(order.id + (order.payment_reference ?? "")).map((char, i) => {
                    const x = 28 + ((char.charCodeAt(0) * (i + 3)) % 36);
                    const y = 28 + ((char.charCodeAt(0) * (i + 7)) % 36);
                    const size = 3 + (i % 3);
                    return char.charCodeAt(0) % 2 === 0 ? (
                      <rect key={i} x={x} y={y} width={size} height={size} fill="#1a1a1a" />
                    ) : null;
                  })}
                </svg>
              </div>
              <div className="text-center">
                <p className="font-heading font-semibold text-foreground">{order.event?.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {order.ticket_package?.name} × {order.quantity}
                </p>
                {order.payment_reference && (
                  <p className="text-xs font-mono text-muted-foreground mt-1">{order.payment_reference}</p>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground px-4">
                Present this QR code at the event entrance for scanning.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
