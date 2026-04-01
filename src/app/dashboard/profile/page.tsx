import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, User, Mail, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/supabase/actions";

export const metadata: Metadata = {
  title: "Profile | Oryx Event",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { error, success } = await searchParams;

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
  const initials = (fullName || user.email || "U")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const provider = user.app_metadata?.provider ?? "email";
  const isOAuth = provider !== "email";

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="font-heading font-bold text-2xl text-foreground mb-1">Profile</h1>
        <p className="text-sm text-muted-foreground mb-8">Manage your personal information.</p>

        {error && (
          <div className="flex items-center gap-2.5 p-3 mb-6 rounded-lg bg-destructive/8 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {decodeURIComponent(error)}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2.5 p-3 mb-6 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {decodeURIComponent(success)}
          </div>
        )}

        {/* Avatar */}
        <Card className="border-border/50 mb-6">
          <CardContent className="p-6 flex items-center gap-5">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/15 text-primary font-bold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-heading font-semibold text-foreground">{fullName || user.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
              <Badge variant="secondary" className="text-xs mt-2 gap-1">
                <Shield className="w-3 h-3" />
                {isOAuth ? provider : "Email & Password"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card className="border-border/50">
          <CardHeader className="p-6 pb-0">
            <h2 className="font-heading font-semibold text-base">Personal Information</h2>
          </CardHeader>
          <CardContent className="p-6">
            <form action={updateProfile} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    name="full_name"
                    defaultValue={fullName}
                    placeholder="Your full name"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    className="pl-9 bg-muted/30 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
              </div>

              <Separator className="opacity-30" />

              <Button type="submit" className="gradient-primary border-0 text-white shadow-sm">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
