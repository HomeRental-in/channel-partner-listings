import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { BRAND, rootUrl } from "@/lib/site";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(rootUrl("/")),
  title: { default: `${BRAND} — Listing tool for channel partners`, template: `%s · ${BRAND}` },
  description: "Turn a WhatsApp message into a property listing buyers trust. Free, forever.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        {/* Marks JS availability before paint so reveal animations only hide content when JS will reveal it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
