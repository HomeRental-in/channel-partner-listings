import type { Metadata } from "next";
import Link from "next/link";
import { getTheme } from "@/components/themes";
import { sampleListing } from "@/lib/sample";
import { sanitiseViewerName } from "@/lib/public";
import { BRAND, whatsappStartUrl } from "@/lib/site";
import { THEMES, type ThemeKey } from "@/lib/types";

export const metadata: Metadata = {
  title: "Sample listing",
  description: `What buyers see when a channel partner shares a ${BRAND} link. Switch between the three themes.`,
  alternates: { canonical: "/sample" },
};

function themeFrom(raw: string | string[] | undefined): ThemeKey {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.toUpperCase();
  return THEMES.some((t) => t.key === v) ? (v as ThemeKey) : "EDITORIAL";
}

/** /sample — a fixture listing rendered with the real themes (no database), plus a bar to switch themes. */
export default async function SamplePage({ searchParams }: { searchParams: Promise<{ theme?: string | string[]; n?: string | string[] }> }) {
  const sp = await searchParams;
  const theme = themeFrom(sp.theme);
  const viewerName = sanitiseViewerName(sp.n) ?? "Rahul";
  const { ListingPage } = getTheme(theme);

  return (
    <>
      <ListingPage data={sampleListing(theme)} viewerName={viewerName} />
      <div className="fixed inset-x-0 top-3 z-[90] flex justify-center px-3" role="region" aria-label="Sample controls">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-black/10 bg-white/95 p-1.5 text-sm text-black shadow-[0_10px_40px_-12px_rgba(0,0,0,.35)] backdrop-blur">
          <span className="hidden px-3 font-medium sm:inline">Sample</span>
          {THEMES.map((t) => (
            <Link
              key={t.key}
              href={`/sample?theme=${t.key.toLowerCase()}`}
              scroll={false}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 font-medium transition-colors ${t.key === theme ? "bg-black text-white" : "hover:bg-black/5"}`}
              aria-current={t.key === theme ? "page" : undefined}
            >
              {t.name}
            </Link>
          ))}
          <a href={whatsappStartUrl()} target="_blank" rel="noopener noreferrer" className="ml-1 whitespace-nowrap rounded-full bg-[#25d366] px-3.5 py-2 font-medium text-black">
            Create yours free
          </a>
        </div>
      </div>
    </>
  );
}
