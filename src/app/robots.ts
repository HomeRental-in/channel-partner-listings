import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { ROOT_DOMAIN, rootUrl } from "@/lib/site";

const PRIVATE = ["/dashboard", "/review", "/login", "/admin", "/dev", "/api/"];

/**
 * AI answer-engine crawlers are allowed explicitly (AEO): search/answer bots so we're cited in ChatGPT, Perplexity,
 * Claude, Gemini and AI Overviews; training bots so the brand is known to the models themselves.
 * To opt out of training only, move GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot to `disallow: "/"`.
 */
const AI_BOTS = [
  "OAI-SearchBot", "ChatGPT-User", "GPTBot",
  "PerplexityBot", "Perplexity-User",
  "Claude-SearchBot", "Claude-User", "ClaudeBot",
  "Google-Extended", "Applebot-Extended", "Bingbot", "DuckAssistBot", "CCBot", "meta-externalagent",
];

/** Served on the root domain and every CP subdomain (proxy.ts skips robots.txt). */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = ((await headers()).get("host") ?? ROOT_DOMAIN).toLowerCase();
  const isRoot = host === ROOT_DOMAIN.toLowerCase() || host === `www.${ROOT_DOMAIN.toLowerCase()}`;
  return {
    rules: [
      { userAgent: AI_BOTS, allow: "/", disallow: PRIVATE },
      { userAgent: "*", allow: "/", disallow: PRIVATE },
    ],
    // One sitemap on the root domain lists every public URL, including subdomain pages (verify the Domain property in Search Console).
    sitemap: rootUrl("/sitemap.xml"),
    host: isRoot ? rootUrl("/") : undefined,
  };
}
