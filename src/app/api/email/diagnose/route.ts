import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/resend";

export const runtime = "nodejs";

// Diagnose the email / password-reset pipeline. Does NOT expose secrets.
// Protect by setting PAYMENTS_DEBUG_TOKEN and calling with ?token=THATVALUE.
// Send a live test: /api/email/diagnose?token=...&to=you@example.com
export async function GET(request: Request) {
  const url = new URL(request.url);
  const expected = process.env.PAYMENTS_DEBUG_TOKEN?.trim();
  if (expected && url.searchParams.get("token") !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const env = {
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM ?? "(default onboarding@resend.dev)",
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "(unset)",
  };

  const to = url.searchParams.get("to");
  const result: Record<string, unknown> = { env };

  if (to) {
    // 1) Direct Resend send test.
    try {
      const sent = await sendEmail({
        to,
        subject: "Oryx Events — email diagnostic",
        html: "<p>If you received this, Resend delivery works.</p>",
      });
      result.resendSend = sent;
    } catch (e) {
      result.resendSend = {
        error: e instanceof Error ? e.message : "send threw",
      };
    }

    // 2) Supabase recovery-link generation test (what password reset uses).
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: to.trim().toLowerCase(),
      });
      result.generateLink = {
        ok: !error && !!data?.properties?.action_link,
        error: error?.message ?? null,
        userExists: !!data?.user,
      };
    } catch (e) {
      result.generateLink = {
        error: e instanceof Error ? e.message : "generateLink threw",
      };
    }
  }

  return NextResponse.json(result);
}
