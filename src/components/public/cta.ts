import { waLink, telLink } from "@/lib/site";
import type { PublicListing } from "@/components/themes/types";

/** Prefilled WhatsApp messages for the listing CTAs (mirrors competitors' quick-question buttons). */
export function listingCtas(l: PublicListing) {
  const tail = `\n${l.title} (${[l.locality, l.city].filter(Boolean).join(", ")})\n${l.url}`;
  const wa = l.broker.whatsapp;
  return {
    whatsapp: waLink(wa, `Hi, I'm interested in this property:${tail}`),
    call: telLink(l.broker.phone),
    stillAvailable: waLink(wa, `Hi, is this property still available?${tail}`),
    scheduleVisit: waLink(wa, `Hi, I'd like to schedule a visit to this property. Which day and time suit you?${tail}`),
    bestPrice: waLink(wa, `Hi, what's the best price for this property?${tail}`),
    share: `${l.title}\n${l.priceDisplay}\n${l.url}`,
  };
}
