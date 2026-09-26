import { BedDouble, Ruler, Sofa, Building2, Compass, CalendarCheck, Car, KeyRound, Clock, Bath, Sun, type LucideIcon } from "lucide-react";
import type { PublicListing } from "@/components/themes/types";

export type Fact = { key: string; label: string; value: string; Icon: LucideIcon };

/** Key facts of a listing — only the non-null ones, in display order. */
export function listingFacts(l: PublicListing): Fact[] {
  const out: Fact[] = [];
  const add = (key: string, label: string, value: string | number | null | undefined, Icon: LucideIcon) => {
    if (value == null || value === "") return;
    out.push({ key, label, value: String(value), Icon });
  };
  add("bhk", "Configuration", l.bhk, BedDouble);
  add("area", "Area", l.areaSqft ? `${l.areaSqft.toLocaleString("en-IN")} sq ft${l.areaLabel ? ` · ${l.areaLabel}` : ""}` : l.areaLabel, Ruler);
  add("furnishing", "Furnishing", l.furnishing, Sofa);
  add("floor", "Floor", l.floor ? (l.totalFloors ? `${l.floor} of ${l.totalFloors}` : l.floor) : null, Building2);
  add("facing", "Facing", l.facing, Compass);
  add("possession", "Possession", l.possession, CalendarCheck);
  add("parking", "Parking", l.parking, Car);
  add("ownership", "Ownership", l.ownership, KeyRound);
  add("age", "Age of property", l.ageOfProperty, Clock);
  add("bathrooms", "Bathrooms", l.bathrooms, Bath);
  add("balconies", "Balconies", l.balconies, Sun);
  return out;
}

export function transactionLabel(t: PublicListing["transaction"]) {
  return t === "SALE" ? "For Sale" : t === "RENT" ? "For Rent" : "For Lease";
}

export function statusLabel(s: PublicListing["status"]): string | null {
  if (s === "SOLD") return "Sold";
  if (s === "RENTED") return "Rented";
  if (s === "DRAFT") return "Draft preview";
  if (s === "ARCHIVED") return "No longer available";
  return null;
}

export function placeLine(l: { locality: string | null; city: string | null }) {
  return [l.locality, l.city].filter(Boolean).join(", ");
}
