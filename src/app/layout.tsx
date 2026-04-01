import type { Metadata } from "next";
import { Inter, Outfit, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oryx Event | Premium Event Management",
  description: "Discover and manage premium events across Qatar with Oryx. The bridge between elegance and experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, outfit.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen bg-background text-foreground font-body antialiased selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}

