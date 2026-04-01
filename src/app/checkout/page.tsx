"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Check, CreditCard, Lock, ShieldCheck,
  Ticket, User, Mail, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import { mockEvents, mockPackages } from "@/lib/mock-data";
import { formatPrice, formatDate, cn } from "@/lib/utils";

type Step = "details" | "payment" | "success";

function CheckoutContent() {
  const params = useSearchParams();
  const eventId = params.get("eventId") ?? "";
  const packageId = params.get("packageId") ?? "";
  const qty = parseInt(params.get("qty") ?? "1");

  const event = mockEvents.find((e) => e.id === eventId);
  const pkgList = mockPackages[eventId] ?? [];
  const pkg = pkgList.find((p) => p.id === packageId);

  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "card">("paystack");

  const total = (pkg?.price ?? 0) * qty;
  const fee = Math.round(total * 0.015);
  const grandTotal = total + fee;

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePayment = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setStep("success");
  };

  if (!event || !pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Invalid checkout session.</p>
          <Button asChild><Link href="/events">Back to Events</Link></Button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-secondary/20 border-2 border-secondary flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.15 }}
          >
            <Check className="w-10 h-10 text-secondary" />
          </motion.div>
          <h1 className="font-heading font-bold text-3xl text-foreground mb-3">You&apos;re in!</h1>
          <p className="text-muted-foreground mb-2">
            Your tickets for <span className="text-foreground font-medium">{event.title}</span> have been confirmed.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            A confirmation has been sent to <span className="text-foreground">{form.email}</span>
          </p>

          <Card className="mb-6 border-border/50 text-left">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ticket type</span>
                <span className="font-medium">{pkg.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">× {qty}</span>
              </div>
              <Separator className="opacity-30" />
              <div className="flex justify-between font-semibold">
                <span>Total paid</span>
                <span className="text-primary">{formatPrice(grandTotal)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button className="gradient-primary border-0 text-white w-full gap-2" asChild>
              <Link href="/dashboard"><Ticket className="w-4 h-4" /> View My Tickets</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/events">Explore More Events</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Button variant="ghost" size="sm" asChild className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
          <Link href={`/events/${eventId}`}><ArrowLeft className="w-4 h-4" /> Back to event</Link>
        </Button>

        {/* Progress steps */}
        <div className="flex items-center gap-3 mb-10">
          {(["details", "payment"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              {i > 0 && <div className={cn("h-px flex-1 w-12", step === "payment" ? "bg-primary" : "bg-border/50")} />}
              <div className={cn(
                "flex items-center gap-2 text-sm font-medium",
                step === s ? "text-foreground" : step === "payment" && s === "details" ? "text-secondary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  step === s ? "bg-primary text-white" :
                  step === "payment" && s === "details" ? "bg-secondary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {step === "payment" && s === "details" ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className="hidden sm:block capitalize">{s}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
              <Card className="border-border/50">
                <CardHeader className="p-6 pb-4">
                  <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Your Details
                  </h2>
                  <p className="text-sm text-muted-foreground">We&apos;ll use these details for your ticket confirmation.</p>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <form onSubmit={handleDetailsNext} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="checkout-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="checkout-name"
                          placeholder="John Doe"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkout-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="checkout-email"
                          type="email"
                          placeholder="john@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkout-phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="checkout-phone"
                          type="tel"
                          placeholder="+234 800 000 0000"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full gradient-primary border-0 text-white shadow-lg shadow-primary/20 hover:opacity-90">
                      Continue to Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
              <Card className="border-border/50">
                <CardHeader className="p-6 pb-4">
                  <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" /> Payment
                  </h2>
                  <p className="text-sm text-muted-foreground">All transactions are secured and encrypted.</p>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-5">
                  {/* Payment options */}
                  <div className="grid grid-cols-2 gap-3">
                    {(["paystack", "card"] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          paymentMethod === method
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 text-muted-foreground hover:border-border"
                        )}
                      >
                        <div className="font-semibold text-sm mb-1 capitalize">{method === "paystack" ? "Paystack" : "Card"}</div>
                        <div className="text-xs opacity-70">
                          {method === "paystack" ? "Pay with Paystack" : "Debit / Credit"}
                        </div>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="0000 0000 0000 0000" maxLength={19} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="card-expiry">Expiry</Label>
                          <Input id="card-expiry" placeholder="MM / YY" maxLength={7} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="card-cvv">CVV</Label>
                          <Input id="card-cvv" placeholder="•••" maxLength={4} />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "paystack" && (
                    <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-sm text-muted-foreground">
                      You&apos;ll be redirected to Paystack&apos;s secure checkout to complete your payment.
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3.5 h-3.5 text-secondary" />
                    256-bit SSL encryption — your payment info is safe.
                  </div>

                  <Button
                    className="w-full gradient-primary border-0 text-white shadow-lg shadow-primary/20 hover:opacity-90 gap-2"
                    onClick={handlePayment}
                    loading={loading}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Pay {formatPrice(grandTotal)}
                  </Button>

                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setStep("details")}>
                    ← Back to details
                  </Button>
                </CardContent>
              </Card>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 sticky top-24">
              <CardHeader className="p-5 pb-3">
                <h3 className="font-heading font-semibold text-base">Order Summary</h3>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{event.category}</p>
                  <p className="font-medium text-sm leading-snug">{event.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(event.date)}</p>
                </div>
                <Separator className="opacity-30" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{pkg.name} × {qty}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>{formatPrice(fee)}</span>
                  </div>
                </div>
                <Separator className="opacity-30" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(grandTotal)}</span>
                </div>
                <Badge variant="secondary" className="w-full justify-center gap-1.5 py-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                  Secure checkout
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
