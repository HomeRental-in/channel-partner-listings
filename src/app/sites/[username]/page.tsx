import type { Metadata } from "next";
import { loadStorefront, storefrontMetadata, StorefrontView } from "@/components/public/pages/storefront";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ username: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return storefrontMetadata(await loadStorefront(username));
}

/** CP storefront — <username>.<ROOT_DOMAIN>/ (rewritten here by src/proxy.ts). */
export default async function StorefrontPage({ params }: Props) {
  const { username } = await params;
  return <StorefrontView username={username} />;
}
