import type { ThemeModule } from "@/components/themes/types";
import { ListingPage } from "./ListingPage";
import { Storefront } from "./Storefront";
import { Collection } from "./Collection";

/** SUNRISE — warm sand & coral, Plus Jakarta Sans, bento-grid hero, colourful fact tiles, spring "pop" reveals. */
const sunrise: ThemeModule = { ListingPage, Storefront, Collection };
export default sunrise;
export { ListingPage, Storefront, Collection };
