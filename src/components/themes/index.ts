import type { ThemeModule } from "./types";
import type { ThemeKey } from "@/lib/types";
import editorial from "@/components/themes/editorial";
import midnight from "@/components/themes/midnight";
import sunrise from "@/components/themes/sunrise";

/** Theme registry. Pages pick a module by `data.theme`; unknown keys fall back to EDITORIAL. */
export const themes: Record<ThemeKey, ThemeModule> = { EDITORIAL: editorial, MIDNIGHT: midnight, SUNRISE: sunrise };

export function getTheme(key: string | null | undefined): ThemeModule {
  return (key && themes[key as ThemeKey]) || editorial;
}

export type { ThemeModule, ListingPageProps, StorefrontProps, CollectionProps } from "./types";
