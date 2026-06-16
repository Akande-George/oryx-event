// Server-only Supabase client using the service role key. Bypasses RLS — only
// use it from trusted server code (webhooks, internal cron, etc.), never from
// user-facing endpoints where you want to enforce per-row authorization.

import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) must be set in env.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
