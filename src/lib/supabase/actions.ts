"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./server";
import { createServiceClient } from "./service";

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
  const supabase = createServiceClient();
  const { data: booking, error } = await supabase
    .from("hotel_bookings")
    .insert({
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

  return { booking };
}
