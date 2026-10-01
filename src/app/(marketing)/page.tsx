import type { Metadata } from "next";
import Hero from "@/components/marketing/Hero";
import WhoItsFor from "@/components/marketing/WhoItsFor";
import ThemeCards from "@/components/marketing/ThemeCards";
import HowItWorks from "@/components/marketing/HowItWorks";
import Features from "@/components/marketing/Features";
import Faq from "@/components/marketing/Faq";
import Testimonials from "@/components/marketing/Testimonials";
import FinalCta from "@/components/marketing/FinalCta";
import PartnerBand from "@/components/marketing/partners/PartnerBand";
import { HOME_FAQS } from "@/components/marketing/faqs";
import { JsonLd, faqLd, howToLd, organizationLd, softwareLd, websiteLd } from "@/lib/seo/jsonld";
import { answerBySlug } from "@/lib/seo/answers";
import { rootUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Free listing pages for channel partners — from a WhatsApp message" },
  description:
    "Send photos and a few lines on WhatsApp. Get a branded listing page on your own site, a PDF brochure and a story video in under a minute. Free, forever.",
  alternates: { canonical: rootUrl("/") },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd(), softwareLd(), faqLd(HOME_FAQS), howToLd("How to create a property listing page from WhatsApp", answerBySlug("create-property-listing-from-whatsapp")?.steps ?? [])]} />
      <Hero />
      <WhoItsFor />
      <HowItWorks />
      <ThemeCards />
      <Features />
      <PartnerBand />
      <Faq />
      <Testimonials />
      <FinalCta />
    </>
  );
}
