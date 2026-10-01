import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ROOT_DOMAIN } from "@/lib/site";
import { asArray, asBrokerCard, type Award, type Testimonial } from "@/lib/types";
import { SettingsForm } from "@/components/dashboard/settings/SettingsForm";
import type { ProfileData, ResponseTime } from "@/components/dashboard/settings/types";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

const RT = new Set<string>(["1h", "same_day", "24h", "48h"]);

export default async function SettingsPage() {
  const user = await requireUser();
  const initial: ProfileData = {
    phone: user.phone,
    name: user.name ?? "",
    agencyName: user.agencyName ?? "",
    whatsappNumber: user.whatsappNumber && user.whatsappNumber !== user.phone ? user.whatsappNumber : "",
    city: user.city ?? "",
    username: user.username ?? "",
    avatarUrl: user.avatarUrl,
    logoUrl: user.logoUrl,
    reraNumber: user.reraNumber ?? "",
    bio: user.bio ?? "",
    yearsExperience: user.yearsExperience,
    dealsClosed: user.dealsClosed,
    areas: asArray<string>(user.areas),
    propertyTypes: asArray<string>(user.propertyTypes),
    languages: asArray<string>(user.languages),
    responseTime: user.responseTime && RT.has(user.responseTime) ? (user.responseTime as ResponseTime) : "",
    testimonials: asArray<Testimonial>(user.testimonials),
    awards: asArray<Award>(user.awards),
    brokerCard: asBrokerCard(user.brokerCard),
    defaultTheme: user.defaultTheme,
    dailyReport: user.dailyReport,
  };

  return (
    <div className="pt-2 flex flex-col gap-4">
      <div className="px-1">
        <h1 className="text-3xl">Settings</h1>
        <p className="text-muted mt-1">Your profile, broker card and preferences. Everything saves as you type.</p>
      </div>
      <SettingsForm initial={initial} rootDomain={ROOT_DOMAIN} />
    </div>
  );
}
