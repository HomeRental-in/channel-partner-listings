import type { ThemeModule } from "@/components/themes/types";
import { EditorialListing } from "./EditorialListing";
import { EditorialStorefront } from "./EditorialStorefront";
import { EditorialCollection } from "./EditorialCollection";

/** EDITORIAL — cream & ink, Fraunces + Inter, magazine layout, slow fade-up reveals. */
const editorial: ThemeModule = {
  ListingPage: EditorialListing,
  Storefront: EditorialStorefront,
  Collection: EditorialCollection,
};

export default editorial;
export { EditorialListing, EditorialStorefront, EditorialCollection };
