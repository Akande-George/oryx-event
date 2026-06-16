import Link from "next/link";
import { Check, Clock, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; id?: string; pending?: string }>;
}) {
  const { kind, pending } = await searchParams;
  const isPending = pending === "1";
  const isBooking = kind === "booking";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 ${
            isPending
              ? "bg-yellow-50 border-yellow-300 text-yellow-700"
              : "bg-secondary/20 border-secondary text-secondary"
          }`}
        >
          {isPending ? (
            <Clock className="w-10 h-10" />
          ) : (
            <Check className="w-10 h-10" />
          )}
        </div>
        <h1 className="font-heading font-bold text-3xl text-foreground mb-3">
          {isPending
            ? "Payment is processing"
            : isBooking
              ? "Booking confirmed!"
              : "You're in!"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isPending
            ? "MyFatoorah is still confirming your transaction. You'll receive an email the moment it clears — usually within a minute."
            : isBooking
              ? "We've locked in your room. A confirmation email is on its way."
              : "Your tickets have been confirmed. A confirmation has been sent to your email."}
        </p>

        <Card className="mb-6 border-border/50">
          <CardContent className="p-5 space-y-2 text-left">
            <p className="text-xs text-muted-foreground">
              {isBooking ? "Booking reference" : "Order reference"}
            </p>
            <p className="font-mono text-xs break-all text-foreground">
              {(await searchParams).id ?? "—"}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            className="gradient-primary border-0 text-white w-full gap-2"
            asChild
          >
            <Link href={isBooking ? "/dashboard" : "/dashboard"}>
              <Ticket className="w-4 h-4" />{" "}
              {isBooking ? "View My Bookings" : "View My Tickets"}
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href={isBooking ? "/hotels" : "/events"}>
              {isBooking ? "Explore More Hotels" : "Explore More Events"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
