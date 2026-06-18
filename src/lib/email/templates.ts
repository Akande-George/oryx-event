import "server-only";
import { detailRows, emailLayout } from "./resend";

const money = (n: number) =>
  new Intl.NumberFormat("en-QA", {
    style: "currency",
    currency: "QAR",
    minimumFractionDigits: 0,
  }).format(n);

const niceDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ── Event order confirmation ─────────────────────────────────────────────
export function orderConfirmationEmail(data: {
  guestName: string;
  eventTitle: string;
  eventDate?: string;
  venue?: string;
  packageName?: string;
  quantity: number;
  total: number;
  ticketUrl?: string;
}) {
  return {
    subject: `Your tickets for ${data.eventTitle} are confirmed`,
    html: emailLayout({
      heading: "You're in! 🎟️",
      intro: `Hi ${data.guestName || "there"}, your order is confirmed. Here are your details.`,
      bodyHtml: detailRows([
        ["Event", data.eventTitle],
        ["Date", niceDate(data.eventDate)],
        ["Venue", data.venue ?? "—"],
        ["Package", data.packageName ?? "—"],
        ["Tickets", `× ${data.quantity}`],
        ["Total", money(data.total)],
      ]),
      ctaLabel: data.ticketUrl ? "Download Ticket (PDF)" : undefined,
      ctaUrl: data.ticketUrl,
    }),
  };
}

// ── Hotel booking received (request submitted) ───────────────────────────
export function bookingReceivedEmail(data: {
  guestName: string;
  hotelName: string;
  roomName?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  estimatedTotal: number;
}) {
  return {
    subject: `We received your booking request — ${data.hotelName}`,
    html: emailLayout({
      heading: "Booking request received",
      intro: `Hi ${data.guestName || "there"}, thanks for your request. Our team is reviewing it and will confirm shortly.`,
      bodyHtml: detailRows([
        ["Hotel", data.hotelName],
        ["Room", data.roomName ?? "—"],
        ["Check-in", niceDate(data.checkIn)],
        ["Check-out", niceDate(data.checkOut)],
        ["Nights", String(data.nights)],
        ["Estimated total", money(data.estimatedTotal)],
      ]),
      footerNote:
        "Oryx Events · You'll get another email once your stay is confirmed.",
    }),
  };
}

// ── Hotel booking confirmed / processed ──────────────────────────────────
export function bookingConfirmedEmail(data: {
  guestName: string;
  hotelName: string;
  roomName?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  estimatedTotal: number;
  passUrl?: string;
}) {
  return {
    subject: `Your stay at ${data.hotelName} is confirmed`,
    html: emailLayout({
      heading: "Your booking is confirmed 🏨",
      intro: `Hi ${data.guestName || "there"}, great news — your booking has been processed and confirmed.`,
      bodyHtml: detailRows([
        ["Hotel", data.hotelName],
        ["Room", data.roomName ?? "—"],
        ["Check-in", niceDate(data.checkIn)],
        ["Check-out", niceDate(data.checkOut)],
        ["Nights", String(data.nights)],
        ["Total", money(data.estimatedTotal)],
      ]),
      ctaLabel: data.passUrl ? "Download Hotel Pass (PDF)" : undefined,
      ctaUrl: data.passUrl,
    }),
  };
}

// ── Password reset ───────────────────────────────────────────────────────
export function passwordResetEmail(data: { resetUrl: string }) {
  return {
    subject: "Reset your Oryx Events password",
    html: emailLayout({
      heading: "Reset your password",
      intro:
        "We received a request to reset your password. Click the button below to choose a new one. If you didn't request this, you can safely ignore this email.",
      bodyHtml: `<p style="color:#9a9aa2;font-size:13px;line-height:1.6;">This link expires in 1 hour for your security.</p>`,
      ctaLabel: "Reset Password",
      ctaUrl: data.resetUrl,
    }),
  };
}
