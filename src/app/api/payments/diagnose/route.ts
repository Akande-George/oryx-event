import { NextResponse } from "next/server";
import { diagnose } from "@/lib/payments/myfatoorah";

export const runtime = "nodejs";

// Diagnostic for the MyFatoorah integration. Does NOT expose the API key.
// Optional protection: set PAYMENTS_DEBUG_TOKEN and call with ?token=THATVALUE.
// Example: GET /api/payments/diagnose?token=...&currency=QAR
export async function GET(request: Request) {
  const url = new URL(request.url);
  const expected = process.env.PAYMENTS_DEBUG_TOKEN?.trim();
  if (expected && url.searchParams.get("token") !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const env = {
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    MYFATOORAH_API_KEY: !!process.env.MYFATOORAH_API_KEY,
    MYFATOORAH_BASE_URL: process.env.MYFATOORAH_BASE_URL ?? "(default)",
    MYFATOORAH_CURRENCY: process.env.MYFATOORAH_CURRENCY ?? "(unset)",
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const currency = url.searchParams.get("currency") ?? undefined;

  try {
    const result = await diagnose(currency);
    return NextResponse.json({ env, ...result });
  } catch (err) {
    return NextResponse.json(
      { env, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
