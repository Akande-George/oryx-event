// Idempotent finalizer that maps a verified MyFatoorah payment status onto an
// orders/hotel_bookings row. Called by both the user-return callback and the
// server-to-server webhook so they agree on outcomes regardless of which
// arrives first.

import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import {
  getPaymentStatus,
  PaymentStatusResult,
} from "@/lib/payments/myfatoorah";

export type FinalizeOutcome = {
  kind: "order" | "booking";
  id: string;
  outcome: "paid" | "failed" | "expired" | "pending" | "noop";
};

function parseUserDefined(field: string | null) {
  if (!field) return null;
  const parts = Object.fromEntries(
    field
      .split(";")
      .map((p) => p.split("="))
      .filter((p) => p.length === 2)
      .map(([k, v]) => [k.trim(), v.trim()]),
  );
  if (parts.kind !== "order" && parts.kind !== "booking") return null;
  if (!parts.id) return null;
  return { kind: parts.kind as "order" | "booking", id: parts.id };
}

export async function finalizeFromPaymentId(
  paymentId: string,
): Promise<FinalizeOutcome | null> {
  const status = await getPaymentStatus(paymentId, "PaymentId");
  const ref =
    parseUserDefined(status.userDefinedField) ??
    (status.customerReference
      ? // legacy fallback if UserDefinedField was lost; we can't disambiguate
        // kind without a hint, so try order then booking
        null
      : null);
  if (!ref) return null;
  return finalizeFromVerifiedStatus(ref.kind, ref.id, status);
}

export async function finalizeFromVerifiedStatus(
  kind: "order" | "booking",
  id: string,
  status: PaymentStatusResult,
): Promise<FinalizeOutcome> {
  const supabase = createServiceClient();
  const table = kind === "order" ? "orders" : "hotel_bookings";

  const { data: row, error } = await supabase
    .from(table)
    .select("id,payment_status")
    .eq("id", id)
    .single();
  if (error || !row) return { kind, id, outcome: "noop" };

  // Already finalized — webhook may fire multiple times.
  if (row.payment_status === "paid" && status.invoiceStatus === "Paid") {
    return { kind, id, outcome: "noop" };
  }

  if (status.invoiceStatus === "Paid") {
    const tx = status.successfulTransaction;
    const update: Record<string, unknown> = {
      payment_status: "paid",
      status: "confirmed",
    };
    if (tx) {
      update.payment_method = tx.paymentGateway;
      update.payment_reference = tx.paymentId;
    }
    await supabase.from(table).update(update).eq("id", id);

    // Decrement slots only on the first paid transition for orders. We guard
    // by checking the previous payment_status, so retries don't double-spend.
    if (kind === "order" && row.payment_status !== "paid") {
      const { data: orderRow } = await supabase
        .from("orders")
        .select("package_id,quantity")
        .eq("id", id)
        .single();
      if (orderRow) {
        await supabase.rpc("decrement_slots", {
          p_package_id: orderRow.package_id,
          p_quantity: orderRow.quantity,
        });
      }
    }
    return { kind, id, outcome: "paid" };
  }

  if (
    status.invoiceStatus === "Failed" ||
    status.invoiceStatus === "Expired"
  ) {
    await supabase
      .from(table)
      .update({
        payment_status: status.invoiceStatus === "Failed" ? "failed" : "expired",
        status: "cancelled",
      })
      .eq("id", id);
    return {
      kind,
      id,
      outcome: status.invoiceStatus === "Failed" ? "failed" : "expired",
    };
  }

  return { kind, id, outcome: "pending" };
}
