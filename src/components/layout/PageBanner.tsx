"use client";

import Image from "next/image";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface PageBannerProps {
  /** Breadcrumb / section label shown above the title. */
  eyebrow: string;
  /** Wrap accent words in <span className="italic text-secondary">. */
  title: React.ReactNode;
  subtitle?: string;
  image: string;
}

export default function PageBanner({
  eyebrow,
  title,
  subtitle,
  image,
}: PageBannerProps) {
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: location.href });
      } else {
        await navigator.clipboard.writeText(location.href);
        toast.success("Link copied to clipboard.");
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <section>
      {/* Bold hero image (navbar overlays the top) */}
      <div className="relative h-[320px] w-full overflow-hidden bg-[#140a0d] sm:h-[420px]">
        <Image
          src={image}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Subtle top gradient so the navbar stays legible */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
      </div>

      {/* Title block (centered, clean background) */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pt-6 text-sm">
            <span className="font-medium text-primary">{eyebrow}</span>
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Share2 className="h-4 w-4" /> Share this page
            </button>
          </div>

          <div className="py-10 text-center sm:py-12">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
