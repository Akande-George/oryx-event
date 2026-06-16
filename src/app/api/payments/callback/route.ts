import { NextResponse } from "next/server";
import { finalizeFromPaymentId } from "@/lib/payments/finalize";

function siteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return url.replace(/\/$/, "");
}

// MyFatoorah appends ?paymentId=... on both CallBackUrl and ErrorUrl.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get("paymentId");
  const base = siteUrl();

  if (!paymentId) {
    return NextResponse.redirect(
      `${base}/checkout/failed?reason=missing-payment-id`,
    );
  }

  try {
    const result = await finalizeFromPaymentId(paymentId);
    if (!result) {
      return NextResponse.redirect(
        `${base}/checkout/failed?reason=unknown-reference`,
      );
    }
    const refQuery = `kind=${result.kind}&id=${result.id}`;
    if (result.outcome === "paid" || result.outcome === "noop") {
      return NextResponse.redirect(`${base}/checkout/success?${refQuery}`);
    }
    if (result.outcome === "pending") {
      return NextResponse.redirect(
        `${base}/checkout/success?${refQuery}&pending=1`,
      );
    }
    return NextResponse.redirect(
      `${base}/checkout/failed?${refQuery}&reason=${result.outcome}`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("Payment callback failed:", message);
    return NextResponse.redirect(
      `${base}/checkout/failed?reason=verification-error`,
    );
  }
}
