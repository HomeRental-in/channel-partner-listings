import type { ThemeModule } from "@/components/themes/types";
import { ListingPage } from "./ListingPage";
import { Storefront } from "./Storefront";
import { Collection } from "./Collection";

/** MIDNIGHT — near-black, Space Grotesk, electric accent, parallax hero, slide-in cards, bottom-sheet CTA. */
const midnight: ThemeModule = { ListingPage, Storefront, Collection };
export default midnight;
export { ListingPage, Storefront, Collection };
