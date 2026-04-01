"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;
  const fullName = formData.get("name") as string;

  if (password !== confirm) {
    redirect("/auth/signup?error=Passwords+do+not+match");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const fullName = formData.get("full_name") as string;

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  if (error) redirect(`/dashboard/profile?error=${encodeURIComponent(error.message)}`);
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

  if (error) redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard/settings?success=Password+updated");
}

export async function createOrder(data: {
  packageId: string;
  eventId: string;
  quantity: number;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
  paymentReference?: string;
}) {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getUser();

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: session.user?.id ?? null,
      package_id: data.packageId,
      event_id: data.eventId,
      quantity: data.quantity,
      total_price: data.totalPrice,
      status: "confirmed",
      guest_name: data.guestName,
      guest_email: data.guestEmail,
      payment_reference: data.paymentReference ?? null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Decrement available_slots
  await supabase.rpc("decrement_slots", {
    p_package_id: data.packageId,
    p_quantity: data.quantity,
  });

  return { order };
}
