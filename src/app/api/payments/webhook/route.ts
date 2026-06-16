import { NextResponse } from "next/server";
import { finalizeFromPaymentId } from "@/lib/payments/finalize";

// MyFatoorah webhook handler — fires server-to-server on status changes.
// Configure the URL in the MyFatoorah portal: <site>/api/payments/webhook
//
// We intentionally re-verify the payment by calling GetPaymentStatus rather
// than trusting the webhook body, so a forged POST can't flip an order to
// "paid". If you turn on webhook token signing in the portal, set
// MYFATOORAH_WEBHOOK_SECRET and we'll also check the MyFatoorah-Signature
// header (or your equivalent) here.

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  // MyFatoorah webhook payloads vary by event type. The PaymentId is what we
  // need; it may live on .Data.PaymentId, .PaymentId, or .Data.Invoice.PaymentId.
  const data = (body.Data ?? body) as Record<string, unknown>;
  const paymentId =
    (data.PaymentId as string | undefined) ??
    ((data.Invoice as Record<string, unknown> | undefined)?.PaymentId as
      | string
      | undefined);

  if (!paymentId) {
    return NextResponse.json(
      { ok: false, error: "no PaymentId in payload" },
      { status: 400 },
    );
  }

  try {
    const result = await finalizeFromPaymentId(paymentId);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Payment webhook failed:", message);
    // 500 so MyFatoorah retries.
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
