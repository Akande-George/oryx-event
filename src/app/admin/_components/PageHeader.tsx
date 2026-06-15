"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-border px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/"
          className="md:hidden flex items-center gap-2 shrink-0"
        >
          <Image src="/logo.png" alt="Logo" width={28} height={28} />
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
            Admin
          </Badge>
        </Link>
        <div className="min-w-0">
          <h1 className="font-heading font-bold text-base sm:text-lg text-foreground truncate">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}
