"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

type Props = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export default function RouteGuard({ children, requireAdmin = false }: Props) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/auth/login?next=${next}`);
      return;
    }
    if (requireAdmin && !isAdmin) {
      router.replace("/dashboard?error=Admin+access+required");
    }
  }, [user, loading, isAdmin, requireAdmin, router, pathname]);

  if (loading || !user || (requireAdmin && !isAdmin)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </div>
    );
  }

  return <>{children}</>;
}
