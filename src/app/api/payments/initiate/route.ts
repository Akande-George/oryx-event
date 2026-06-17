import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendPayment } from "@/lib/payments/myfatoorah";

export const runtime = "nodejs";

type Body =
  | { kind: "order"; id: string }
  | { kind: "booking"; id: string };

function siteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url)
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be set so MyFatoorah can redirect users back.",
    );
  return url.replace(/\/$/, "");
}

// Fail fast with a clear message if the prod environment is missing config.
function assertEnv() {
  const missing = [
    "NEXT_PUBLIC_SITE_URL",
    "MYFATOORAH_API_KEY",
    "MYFATOORAH_BASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
  ].filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}.`);
  }
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("payments/initiate failed:", message);
    return NextResponse.json(
      { error: `Payment could not be started: ${message}` },
      { status: 500 },
    );
  }
}

async function handle(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || (body.kind !== "order" && body.kind !== "booking") || !body.id) {
    return NextResponse.json(
      { error: "Body must be { kind: 'order' | 'booking', id }." },
      { status: 400 },
    );
  }

  assertEnv();

  // Trusted server route: read/write with the service role so it can see the
  // just-created pending row regardless of the (anonymous) checkout session.
  const supabase = createServiceClient();
  const base = siteUrl();
  const callbackUrl = `${base}/api/payments/callback`;
  const errorUrl = `${base}/api/payments/callback`;

  if (body.kind === "order") {
    const { data: order, error } = await supabase
      .from("orders")
      .select("id,total_price,guest_name,guest_email,payment_status")
      .eq("id", body.id)
      .single();
    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 },
      );
    }
    if (order.payment_status === "paid") {
      return NextResponse.json(
        { error: "Order is already paid." },
        { status: 409 },
      );
    }

    const result = await sendPayment({
      amount: order.total_price,
      customerName: order.guest_name ?? "Guest",
      customerEmail: order.guest_email ?? "noreply@oryx.local",
      callbackUrl,
      errorUrl,
      customerReference: order.id,
      userDefinedField: `kind=order;id=${order.id}`,
    });

    await supabase
      .from("orders")
      .update({ payment_invoice_id: String(result.invoiceId) })
      .eq("id", order.id);

    return NextResponse.json({ paymentUrl: result.invoiceUrl });
  }

  // booking
  const { data: booking, error } = await supabase
    .from("hotel_bookings")
    .select(
      "id,estimated_total,guest_name,guest_email,guest_phone,payment_status",
    )
    .eq("id", body.id)
    .single();
  if (error || !booking) {
    return NextResponse.json(
      { error: "Booking not found." },
      { status: 404 },
    );
  }
  if (booking.payment_status === "paid") {
    return NextResponse.json(
      { error: "Booking is already paid." },
      { status: 409 },
    );
  }

  const mobile = (booking.guest_phone ?? "").replace(/^\+?974/, "");
  const result = await sendPayment({
    amount: booking.estimated_total,
    customerName: booking.guest_name,
    customerEmail: booking.guest_email,
    customerMobile: mobile,
    callbackUrl,
    errorUrl,
    customerReference: booking.id,
    userDefinedField: `kind=booking;id=${booking.id}`,
  });

  await supabase
    .from("hotel_bookings")
    .update({ payment_invoice_id: String(result.invoiceId) })
    .eq("id", booking.id);

  return NextResponse.json({ paymentUrl: result.invoiceUrl });
}
