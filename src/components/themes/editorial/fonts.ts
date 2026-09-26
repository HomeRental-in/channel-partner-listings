import { Fraunces, Inter } from "next/font/google";

/** Editorial theme type: Fraunces (serif display, variable) + Inter (body). Applied via CSS variables on the theme root. */
export const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["opsz", "SOFT"] });
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const editorialFontClass = `${fraunces.variable} ${inter.variable}`;
