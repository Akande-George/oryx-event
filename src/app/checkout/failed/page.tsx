import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const REASONS: Record<string, string> = {
  failed: "The bank declined the payment.",
  expired: "The payment link expired before it was completed.",
  "missing-payment-id":
    "MyFatoorah didn't send back a payment reference. Try again from the beginning.",
  "unknown-reference":
    "We couldn't match this payment to an order or booking. Contact support.",
  "verification-error":
    "We couldn't reach MyFatoorah to verify the payment. Please retry.",
};

export default async function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; id?: string; reason?: string }>;
}) {
  const { kind, id, reason } = await searchParams;
  const message = (reason && REASONS[reason]) ?? "The payment didn't go through.";
  const isBooking = kind === "booking";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-destructive/40 text-destructive flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10" />
        </div>
        <h1 className="font-heading font-bold text-3xl text-foreground mb-3">
          Payment didn&apos;t complete
        </h1>
        <p className="text-muted-foreground mb-8">{message}</p>

        {id && (
          <Card className="mb-6 border-border/50">
            <CardContent className="p-5 space-y-2 text-left">
              <p className="text-xs text-muted-foreground">
                {isBooking ? "Booking reference" : "Order reference"}
              </p>
              <p className="font-mono text-xs break-all text-foreground">
                {id}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          <Button
            className="gradient-primary border-0 text-white w-full"
            asChild
          >
            <Link href={isBooking ? "/hotels" : "/events"}>
              Try again
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
