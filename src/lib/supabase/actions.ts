"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./server";
import { createServiceClient } from "./service";
import {
  sendBookingConfirmed,
  sendBookingReceived,
  sendOrderConfirmation,
} from "@/lib/email/notifications";

export async function signIn(formData: FormData) {
  // Use demo credentials for UI development
  // const supabase = await createClient();
  // const { error } = await supabase.auth.signInWithPassword({
  //   email: formData.get("email") as string,
  //   password: formData.get("password") as string,
  // });

  // if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);

  // For UI development, any login succeeds
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  // const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (password !== confirm) {
    redirect("/auth/signup?error=Passwords+do+not+match");
  }

  // Any signup succeeds for UI development
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  // const supabase = await createClient();
  // await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const fullName = formData.get("full_name") as string;

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  if (error)
    redirect(`/dashboard/profile?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/profile?success=Profile+updated");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (password !== confirm) {
    redirect("/dashboard/settings?error=Passwords+do+not+match");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error)
    redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard/settings?success=Password+updated");
}

export async function createOrder(data: {
  packageId: string;
  eventId: string;
  quantity: number;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
}) {
  // user_id is read from the user's session (anon-bound client), but the
  // INSERT runs with the service role so it bypasses RLS. The webhook flips
  // status to confirmed and decrements slots only after MyFatoorah verifies.
  const userClient = await createClient();
  const { data: session } = await userClient.auth.getUser();

  const supabase = createServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: session.user?.id ?? null,
      package_id: data.packageId,
      event_id: data.eventId,
      quantity: data.quantity,
      total_price: data.totalPrice,
      status: "pending",
      payment_status: "unpaid",
      guest_name: data.guestName,
      guest_email: data.guestEmail,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  return { order };
}

export async function createHotelBooking(data: {
  hotelId: string;
  roomTypeId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  guests: number;
  estimatedTotal: number;
  specialRequests?: string;
}) {
  const userClient = await createClient();
  const { data: session } = await userClient.auth.getUser();

  const supabase = createServiceClient();
  const { data: booking, error } = await supabase
    .from("hotel_bookings")
    .insert({
      user_id: session.user?.id ?? null,
      hotel_id: data.hotelId,
      room_type_id: data.roomTypeId,
      guest_name: data.guestName,
      guest_email: data.guestEmail,
      guest_phone: data.guestPhone,
      check_in: data.checkIn,
      check_out: data.checkOut,
      nights: data.nights,
      rooms: data.rooms,
      guests: data.guests,
      estimated_total: data.estimatedTotal,
      special_requests: data.specialRequests ?? null,
      status: "pending",
      payment_status: "unpaid",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Fire-and-forget "we received your request" email.
  try {
    await sendBookingReceived(booking.id);
  } catch (e) {
    console.error("booking received email failed:", e);
  }

  return { booking };
}

// Verify the caller is an admin (used to gate notification actions).
async function callerIsAdmin() {
  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user?.id) return false;
  const { data: profile } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin";
}

// Called by the admin after confirming an order/booking, to email the customer.
// Re-reads the row server-side and only sends when it is actually confirmed.
export async function notifyOrderConfirmed(orderId: string) {
  if (!(await callerIsAdmin())) return { error: "Not authorized" };
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();
  if (data?.status !== "confirmed") return { skipped: true };
  try {
    await sendOrderConfirmation(orderId);
    return { ok: true };
  } catch (e) {
    console.error("order confirmation email failed:", e);
    return { error: "send failed" };
  }
}

export async function notifyBookingConfirmed(bookingId: string) {
  if (!(await callerIsAdmin())) return { error: "Not authorized" };
  try {
    await sendBookingConfirmed(bookingId);
    return { ok: true };
  } catch (e) {
    console.error("booking confirmation email failed:", e);
    return { error: "send failed" };
  }
}

// Password reset via Resend: generate a real Supabase recovery link with the
// service role, then email it through our own branded template. Always returns
// a generic success so we don't leak which emails are registered.
export async function requestPasswordReset(email: string) {
  const clean = email.trim().toLowerCase();
  if (!clean) return { ok: true };

  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
  const supabase = createServiceClient();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: clean,
    options: { redirectTo: `${base}/auth/login` },
  });

  // No such user (or any error) → still return ok to avoid email enumeration.
  if (error || !data?.properties?.action_link) {
    return { ok: true };
  }

  try {
    const { passwordResetEmail } = await import("@/lib/email/templates");
    const { sendEmail } = await import("@/lib/email/resend");
    const { subject, html } = passwordResetEmail({
      resetUrl: data.properties.action_link,
    });
    await sendEmail({ to: clean, subject, html });
  } catch (e) {
    console.error("password reset email failed:", e);
  }
  return { ok: true };
}
