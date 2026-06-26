import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface DestinationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  location: string;
  flag: string;
  stats: string;
  href: string;
  /** HSL triplet, e.g. "150 50% 25%" for a deep green. */
  themeColor: string;
}

const DestinationCard = React.forwardRef<HTMLDivElement, DestinationCardProps>(
  (
    { className, imageUrl, location, flag, stats, href, themeColor, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        style={
          { "--theme-color": themeColor } as React.CSSProperties
        }
        className={cn("group h-full w-full", className)}
        {...props}
      >
        <a
          href={href}
          aria-label={`Explore ${location}`}
          className="relative block h-full w-full overflow-hidden rounded-2xl shadow-lg transition-all duration-500 ease-in-out group-hover:scale-[1.03] group-hover:shadow-[0_0_60px_-15px_hsl(var(--theme-color)/0.6)]"
          style={{
            boxShadow: "0 0 40px -15px hsl(var(--theme-color) / 0.5)",
          }}
        >
          {/* Background image with parallax zoom */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />

          {/* Themed gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, hsl(var(--theme-color) / 0.92), hsl(var(--theme-color) / 0.6) 30%, transparent 62%)",
            }}
          />

          {/* Content */}
          <div className="relative flex h-full flex-col justify-end p-6 text-white">
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {location} <span className="ml-1 text-2xl">{flag}</span>
            </h3>
            <p className="mt-1 text-sm font-medium text-white/80">{stats}</p>

            <div className="mt-6 flex items-center justify-between rounded-lg border border-[hsl(var(--theme-color)/0.3)] bg-[hsl(var(--theme-color)/0.2)] px-4 py-3 backdrop-blur-md transition-all duration-300 group-hover:border-[hsl(var(--theme-color)/0.5)] group-hover:bg-[hsl(var(--theme-color)/0.4)]">
              <span className="text-sm font-semibold tracking-wide">
                Explore Now
              </span>
              <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </a>
      </div>
    );
  },
);
DestinationCard.displayName = "DestinationCard";

export { DestinationCard };
