// Server-only PDF builders for event tickets and hotel passes/receipts.
// Pure JS (pdf-lib + qrcode) so they run in the Node serverless runtime
// without native dependencies.

import "server-only";
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";
import QRCode from "qrcode";

const BRAND = rgb(0.42, 0.04, 0.12); // deep maroon
const INK = rgb(0.1, 0.1, 0.12);
const MUTED = rgb(0.45, 0.45, 0.5);
const LINE = rgb(0.86, 0.86, 0.88);
const WHITE = rgb(1, 1, 1);

export type EventTicketData = {
  reference: string;
  guestName: string;
  eventTitle: string;
  eventDate: string; // human-readable
  venue: string;
  location: string;
  packageName: string;
  tier: string;
  quantity: number;
  totalPaid: string; // formatted
};

export type HotelPassData = {
  reference: string;
  guestName: string;
  hotelName: string;
  address: string;
  city: string;
  roomName: string;
  beds: string;
  checkIn: string; // human-readable
  checkOut: string; // human-readable
  nights: number;
  rooms: number;
  guests: number;
  totalPaid: string; // formatted
};

async function qrPng(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    type: "png",
    margin: 1,
    width: 320,
    color: { dark: "#0d0d1eff", light: "#ffffffff" },
  });
}

function drawField(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  fonts: { regular: PDFFont; bold: PDFFont },
  opts?: { valueSize?: number },
) {
  page.drawText(label.toUpperCase(), {
    x,
    y,
    size: 8,
    font: fonts.bold,
    color: MUTED,
  });
  page.drawText(value || "—", {
    x,
    y: y - 16,
    size: opts?.valueSize ?? 12,
    font: fonts.regular,
    color: INK,
  });
}

async function baseDoc() {
  const pdf = await PDFDocument.create();
  pdf.setProducer("Oryx Event");
  pdf.setCreator("Oryx Event");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  return { pdf, regular, bold };
}

export async function buildEventTicketPdf(
  data: EventTicketData,
): Promise<Uint8Array> {
  const { pdf, regular, bold } = await baseDoc();
  const fonts = { regular, bold };
  const page = pdf.addPage([595, 360]); // A5-ish landscape
  const { width, height } = page.getSize();

  // Header band
  page.drawRectangle({ x: 0, y: height - 70, width, height: 70, color: BRAND });
  page.drawText("ORYX EVENT", {
    x: 32,
    y: height - 38,
    size: 18,
    font: bold,
    color: WHITE,
  });
  page.drawText("E-TICKET", {
    x: 32,
    y: height - 56,
    size: 10,
    font: regular,
    color: rgb(0.95, 0.9, 0.9),
  });

  // Event title
  page.drawText(data.eventTitle, {
    x: 32,
    y: height - 108,
    size: 20,
    font: bold,
    color: INK,
    maxWidth: width - 200,
  });

  // Fields grid
  let y = height - 150;
  drawField(page, "Date & Time", data.eventDate, 32, y, fonts);
  drawField(page, "Venue", data.venue, 250, y, fonts);
  y -= 56;
  drawField(page, "Package", `${data.packageName} (${data.tier})`, 32, y, fonts);
  drawField(page, "Tickets", `x ${data.quantity}`, 250, y, fonts);
  y -= 56;
  drawField(page, "Guest", data.guestName, 32, y, fonts);
  drawField(page, "Total Paid", data.totalPaid, 250, y, fonts);

  // Divider
  page.drawLine({
    start: { x: 32, y: 70 },
    end: { x: width - 200, y: 70 },
    thickness: 1,
    color: LINE,
  });
  page.drawText("Present this ticket at the entrance. Valid for one entry.", {
    x: 32,
    y: 52,
    size: 9,
    font: regular,
    color: MUTED,
  });
  page.drawText(`Ref: ${data.reference}`, {
    x: 32,
    y: 36,
    size: 9,
    font: bold,
    color: INK,
  });

  // QR panel on the right
  const qr = await pdf.embedPng(await qrPng(data.reference));
  const qrSize = 150;
  page.drawRectangle({
    x: width - qrSize - 48,
    y: height - 250,
    width: qrSize + 32,
    height: qrSize + 48,
    color: rgb(0.97, 0.97, 0.98),
    borderColor: LINE,
    borderWidth: 1,
  });
  page.drawImage(qr, {
    x: width - qrSize - 32,
    y: height - 234,
    width: qrSize,
    height: qrSize,
  });
  page.drawText("Scan at gate", {
    x: width - qrSize - 24,
    y: height - 250 + 6,
    size: 8,
    font: regular,
    color: MUTED,
  });

  return pdf.save();
}

export async function buildHotelPassPdf(
  data: HotelPassData,
): Promise<Uint8Array> {
  const { pdf, regular, bold } = await baseDoc();
  const fonts = { regular, bold };
  const page = pdf.addPage([595, 420]);
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: height - 70, width, height: 70, color: BRAND });
  page.drawText("ORYX STAYS", {
    x: 32,
    y: height - 38,
    size: 18,
    font: bold,
    color: WHITE,
  });
  page.drawText("BOOKING PASS / RECEIPT", {
    x: 32,
    y: height - 56,
    size: 10,
    font: regular,
    color: rgb(0.95, 0.9, 0.9),
  });

  page.drawText(data.hotelName, {
    x: 32,
    y: height - 108,
    size: 20,
    font: bold,
    color: INK,
    maxWidth: width - 200,
  });
  page.drawText(`${data.address}${data.city ? `, ${data.city}` : ""}`, {
    x: 32,
    y: height - 126,
    size: 10,
    font: regular,
    color: MUTED,
    maxWidth: width - 200,
  });

  let y = height - 168;
  drawField(page, "Check-in", data.checkIn, 32, y, fonts);
  drawField(page, "Check-out", data.checkOut, 250, y, fonts);
  y -= 56;
  drawField(page, "Room", `${data.roomName} · ${data.beds}`, 32, y, fonts);
  drawField(page, "Nights", String(data.nights), 250, y, fonts);
  y -= 56;
  drawField(
    page,
    "Occupancy",
    `${data.rooms} room${data.rooms > 1 ? "s" : ""} · ${data.guests} guest${
      data.guests > 1 ? "s" : ""
    }`,
    32,
    y,
    fonts,
  );
  drawField(page, "Guest", data.guestName, 250, y, fonts);
  y -= 56;
  drawField(page, "Total Paid", data.totalPaid, 32, y, fonts, {
    valueSize: 16,
  });

  page.drawLine({
    start: { x: 32, y: 70 },
    end: { x: width - 200, y: 70 },
    thickness: 1,
    color: LINE,
  });
  page.drawText("Present this pass at hotel check-in.", {
    x: 32,
    y: 52,
    size: 9,
    font: regular,
    color: MUTED,
  });
  page.drawText(`Ref: ${data.reference}`, {
    x: 32,
    y: 36,
    size: 9,
    font: bold,
    color: INK,
  });

  const qr = await pdf.embedPng(await qrPng(data.reference));
  const qrSize = 150;
  page.drawRectangle({
    x: width - qrSize - 48,
    y: height - 250,
    width: qrSize + 32,
    height: qrSize + 48,
    color: rgb(0.97, 0.97, 0.98),
    borderColor: LINE,
    borderWidth: 1,
  });
  page.drawImage(qr, {
    x: width - qrSize - 32,
    y: height - 234,
    width: qrSize,
    height: qrSize,
  });
  page.drawText("Scan at check-in", {
    x: width - qrSize - 36,
    y: height - 250 + 6,
    size: 8,
    font: regular,
    color: MUTED,
  });

  return pdf.save();
}
