"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BedDouble,
  Building2,
  Calendar,
  Eye,
  LayoutDashboard,
  Package,
  Settings,
  Tag,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RouteGuard from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/context";
import { AdminDataProvider, useAdminData } from "@/lib/admin/context";
import { toast } from "sonner";

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/events", icon: Calendar, label: "Events" },
  { href: "/admin/packages", icon: Package, label: "Packages" },
  { href: "/admin/orders", icon: Ticket, label: "Orders" },
  { href: "/admin/attendees", icon: Users, label: "Attendees" },
  { href: "/admin/hotels", icon: Building2, label: "Hotels" },
  { href: "/admin/bookings", icon: BedDouble, label: "Bookings" },
  { href: "/admin/categories", icon: Tag, label: "Categories" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { orders, bookings } = useAdminData();
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully.");
    router.push("/");
  };

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-border bg-white shrink-0">
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-5 border-b border-border"
      >
        <Image src="/logo.png" alt="Logo" width={32} height={32} />
        <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0.5">
          Admin
        </Badge>
      </Link>

      <nav className="flex-1 p-3 space-y-0.5 pt-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {href === "/admin/orders" && (
                <span className="ml-auto text-xs bg-primary text-white rounded-full px-1.5 py-0.5 leading-none">
                  {orders.length}
                </span>
              )}
              {href === "/admin/bookings" && pendingBookings > 0 && (
                <span className="ml-auto text-xs bg-secondary text-white rounded-full px-1.5 py-0.5 leading-none">
                  {pendingBookings}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-0.5">
        {user && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-foreground truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        )}
        <Link
          href="/dashboard/settings"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <Eye className="w-4 h-4" /> View Site
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="w-4 h-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const { orders } = useAdminData();
  const items = navItems.slice(0, 5);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border flex items-center justify-around px-1 py-1.5">
        {items.map(({ href, icon: Icon, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0 flex-1 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {href === "/admin/orders" && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-white rounded-full text-[8px] flex items-center justify-center leading-none font-bold">
                    {orders.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0 flex-1 text-muted-foreground"
        >
          <Eye className="w-5 h-5" />
          <span className="text-[10px] font-medium">Site</span>
        </Link>
      </nav>
      <div className="h-16 md:hidden" />
    </>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto pb-16 md:pb-0">{children}</div>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requireAdmin>
      <AdminDataProvider>
        <AdminShell>{children}</AdminShell>
      </AdminDataProvider>
    </RouteGuard>
  );
}
