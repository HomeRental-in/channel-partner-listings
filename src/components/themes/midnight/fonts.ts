import { Space_Grotesk } from "next/font/google";

/** Midnight display + body font. Exposed as --font-mn on the theme wrapper. */
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mn",
  display: "swap",
});
