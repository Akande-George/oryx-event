"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import RouteGuard from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/context";
import { toast } from "sonner";

function ProfileContent() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setFullName(user.full_name);
  }, [user]);

  if (!user) return null;

  const initials = (fullName || user.email)
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    if (!fullName.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    const next = updateProfile({ full_name: fullName.trim() });
    setSaving(false);
    if (!next) {
      setError("Could not update profile. Please sign in again.");
      return;
    }
    setSuccess("Profile updated successfully.");
    toast.success("Profile updated");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="font-heading font-bold text-2xl text-foreground mb-1">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Manage your personal information.
        </p>

        {error && (
          <div className="flex items-center gap-2.5 p-3 mb-6 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2.5 p-3 mb-6 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        <Card className="border-border/50 mb-6">
          <CardContent className="p-6 flex items-center gap-5">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/15 text-primary font-bold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-heading font-semibold text-foreground">
                {fullName || user.email}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user.email}
              </p>
              <Badge variant="secondary" className="text-xs mt-2 gap-1">
                <Shield className="w-3 h-3" />
                {user.role === "admin" ? "Administrator" : "Customer"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="p-6 pb-0">
            <h2 className="font-heading font-semibold text-base">
              Personal Information
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <form className="space-y-5" onSubmit={handleSave}>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    name="full_name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed in demo mode.
                </p>
              </div>

              <Separator className="opacity-30" />

              <Button
                type="submit"
                className="gradient-primary border-0 text-white shadow-sm"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RouteGuard>
      <ProfileContent />
    </RouteGuard>
  );
}
