import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStorefront } from "@/lib/public";
import { absoluteUrl } from "@/lib/storage";
import { BRAND } from "@/lib/site";
import { getTheme } from "@/components/themes";
import { PublicShell } from "@/components/themes/shared/PublicShell";
import type { PublicStorefront } from "@/components/themes/types";
import { getAgencyStorefront } from "./agency";

/** CP storefront, or the agency storefront when the subdomain belongs to an Agency.username. */
export async function loadStorefront(username: string): Promise<PublicStorefront | null> {
  return (await getStorefront(username)) ?? (await getAgencyStorefront(username));
}

export function storefrontMetadata(s: PublicStorefront | null): Metadata {
  if (!s) return { title: "Not found", robots: { index: false } };
  const b = s.broker;
  const title = [b.name, b.agencyName].filter(Boolean).join(" · ");
  const n = s.listings.length;
  const description = b.bio?.trim() || `${n} propert${n === 1 ? "y" : "ies"}${b.city ? ` in ${b.city}` : ""} listed by ${b.name}. WhatsApp or call for details.`;
  return {
    title,
    description,
    alternates: { canonical: b.siteUrl },
    openGraph: { title, description, url: b.siteUrl, type: "profile", siteName: BRAND, images: b.avatarUrl ? [{ url: absoluteUrl(b.avatarUrl), alt: b.name }] : s.listings[0]?.cover ? [{ url: absoluteUrl(s.listings[0].cover.url) }] : undefined },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function StorefrontView({ username }: { username: string }) {
  const data = await loadStorefront(username);
  if (!data) notFound();
  const Theme = getTheme(data.theme);
  return (
    <PublicShell viewerName={null} listingId={null}>
      <Theme.Storefront data={data} />
    </PublicShell>
  );
}
