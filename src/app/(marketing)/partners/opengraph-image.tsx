import { marketingOgImage, OG_SIZE } from "@/components/marketing/og";

export const alt = "Founding Partner Programme for channel partner firms";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return marketingOgImage({
    eyebrow: "Founding Partner Programme",
    title: "A thousand listings in one city? We'll put every one on a link.",
    chips: ["Free for every agent", "We build your inventory", "No per-listing fees"],
    cta: "Register your firm",
    dark: true,
  });
}
