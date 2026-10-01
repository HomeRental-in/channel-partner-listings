import { ImageResponse } from "next/og";
import { BRAND, ROOT_DOMAIN } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

/** Outfit (the site font) as TTF for Satori. Google serves TTF when no browser UA is sent. Falls back to the default font. */
let fontCache: Promise<{ name: string; data: ArrayBuffer; weight: 500 }[]> | null = null;
function outfit() {
  fontCache ??= (async () => {
    try {
      const css = await (await fetch("https://fonts.googleapis.com/css2?family=Outfit:wght@500")).text();
      const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
      if (!url) return [];
      return [{ name: "Outfit", data: await (await fetch(url)).arrayBuffer(), weight: 500 as const }];
    } catch {
      fontCache = null; // retry on the next render
      return [];
    }
  })();
  return fontCache;
}

/** public/marketing/mark.svg, colours swapped on dark cards. */
function mark(dark: boolean) {
  const [bg, fg] = dark ? ["#fff", "#000"] : ["#000", "#fff"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="12" fill="${bg}"/><path d="M20 8.2 31.6 17.9V30a2.2 2.2 0 0 1-2.2 2.2H10.6A2.2 2.2 0 0 1 8.4 30V17.9L20 8.2Z" fill="${fg}"/><circle cx="20" cy="17.7" r="2.1" fill="#25d366"/><rect x="18.2" y="21.4" width="3.6" height="7.8" rx="1.3" fill="${bg}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

type Card = { eyebrow: string; title: string; chips?: string[]; cta: string; dark?: boolean };

/** Marketing share card in the site's visual language: grey page, white rounded panel, ink type, pill CTA. */
export async function marketingOgImage({ eyebrow, title, chips = [], cta, dark = false }: Card) {
  const fonts = await outfit();
  const ink = "#000000";
  const panel = dark ? ink : "#FFFFFF";
  const fg = dark ? "#FFFFFF" : ink;
  const muted = dark ? "rgba(255,255,255,.6)" : "rgba(0,0,0,.55)";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#E5E9EB", padding: 28, fontFamily: fonts.length ? "Outfit" : "sans-serif" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", background: panel, color: fg, borderRadius: 40, padding: "52px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mark(dark)} alt="" width={48} height={48} />
              <div style={{ display: "flex", fontSize: 30, letterSpacing: -0.8 }}>{BRAND}</div>
            </div>
            <div style={{ display: "flex", fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: muted }}>{eyebrow}</div>
          </div>

          <div style={{ display: "flex", fontSize: title.length > 60 ? 64 : 76, lineHeight: 1.04, letterSpacing: -2.6, maxWidth: 1000 }}>{title}</div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 700 }}>
              {chips.slice(0, 5).map((c) => (
                <div key={c} style={{ display: "flex", fontSize: 20, padding: "8px 18px", borderRadius: 999, background: dark ? "rgba(255,255,255,.12)" : "#E5E9EB" }}>
                  {c}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              <div style={{ display: "flex", fontSize: 24, padding: "16px 30px", borderRadius: 999, background: dark ? "#FFFFFF" : ink, color: dark ? ink : "#FFFFFF" }}>{cta}</div>
              <div style={{ display: "flex", fontSize: 18, color: muted }}>{ROOT_DOMAIN}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
