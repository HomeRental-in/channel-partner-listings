import { Plus_Jakarta_Sans } from "next/font/google";

/** Sunrise display + body font. Exposed as --font-sr on the theme wrapper. */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sr",
  display: "swap",
});
