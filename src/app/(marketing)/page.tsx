import type { Metadata } from "next";
import Hero from "@/components/marketing/Hero";
import WhoItsFor from "@/components/marketing/WhoItsFor";
import ThemeCards from "@/components/marketing/ThemeCards";
import HowItWorks from "@/components/marketing/HowItWorks";
import Features from "@/components/marketing/Features";
import Faq from "@/components/marketing/Faq";
import Testimonials from "@/components/marketing/Testimonials";
import FinalCta from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  title: { absolute: "Free listing pages for channel partners — from a WhatsApp message" },
  description:
    "Send photos and a few lines on WhatsApp. Get a branded listing page on your own site, a PDF brochure and a story video in under a minute. Free, forever.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhoItsFor />
      <HowItWorks />
      <ThemeCards />
      <Features />
      <Faq />
      <Testimonials />
      <FinalCta />
    </>
  );
}
