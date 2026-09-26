/** Colour palette per listing theme, shared by the PDF brochure, story image and story video. */
export type OutputPalette = { accent: string; accentInk: string; bg: string; ink: string; muted: string; soft: string; line: string; dark: boolean };

export function paletteFor(theme: "EDITORIAL" | "MIDNIGHT" | "SUNRISE" | string | null | undefined): OutputPalette {
  switch (theme) {
    case "MIDNIGHT":
      return { accent: "#4f7cff", accentInk: "#ffffff", bg: "#0b0d12", ink: "#f4f6fb", muted: "#9aa3b5", soft: "#161a24", line: "#262c3a", dark: true };
    case "SUNRISE":
      return { accent: "#f26b4e", accentInk: "#ffffff", bg: "#fbf3ea", ink: "#2a1d18", muted: "#8a6f63", soft: "#f3e5d6", line: "#e9d7c6", dark: false };
    default:
      return { accent: "#8b6f47", accentInk: "#ffffff", bg: "#f6f2ea", ink: "#161412", muted: "#6f6a63", soft: "#efe9dd", line: "#e2dbcd", dark: false };
  }
}

/** Standard PDF fonts lack the rupee glyph; swap it for "Rs." in PDF text. */
export function pdfText(s: string | null | undefined) {
  return (s ?? "").replace(/₹\s?/g, "Rs. ");
}

export const TRANSACTION_LABEL: Record<string, string> = { SALE: "For sale", RENT: "For rent", LEASE: "For lease" };
export const CATEGORY_LABEL: Record<string, string> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL_OFFICE: "Commercial office",
  COMMERCIAL_SHOP: "Commercial shop",
  WAREHOUSE: "Warehouse",
  PLOT: "Plot",
  BUILDING: "Building",
};
