"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Ticket, Search, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/events", label: "Events" },
];

export default function Navbar({ user: userProp }: { user?: User | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null | undefined>(userProp);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    // If user was passed as a prop, trust it
    if (userProp !== undefined) {
      setUser(userProp);
      return;
    }
    // Otherwise fetch from browser client (for client-component pages)
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [userProp]);

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";
  const isAdmin = user?.user_metadata?.role === "admin";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm shadow-black/5"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname.startsWith(link.href)
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
              <Link href="/search" aria-label="Search">
                <Search className="w-4 h-4" />
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" className="relative rounded-full p-0 w-9 h-9" />
                  }
                >
                  <Avatar className="w-9 h-9 border-2 border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{fullName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/dashboard" />}>
                    <LayoutDashboard className="w-4 h-4" /> My Tickets
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem render={<Link href="/admin" />}>
                      <Shield className="w-4 h-4" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive gap-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild className="gradient-primary border-0 hover:opacity-90 text-white shadow-lg shadow-primary/20">
                  <Link href="/auth/signup">Get tickets</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                    <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
                      <Ticket className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-heading font-bold text-base">Oryx<span className="text-primary">.</span></span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <nav className="flex flex-col p-4 gap-1 flex-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        pathname.startsWith(link.href)
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {user && (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3",
                          pathname.startsWith("/dashboard")
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <LayoutDashboard className="w-4 h-4" /> My Tickets
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3",
                            pathname.startsWith("/admin")
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                    </>
                  )}
                </nav>
                <div className="p-4 border-t border-border/50 flex flex-col gap-2">
                  {user ? (
                    <>
                      <div className="px-3 py-2 mb-1">
                        <p className="text-sm font-medium truncate">{fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 gap-2"
                        onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/auth/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
                      </Button>
                      <Button asChild className="w-full gradient-primary border-0 text-white">
                        <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>Get tickets</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
