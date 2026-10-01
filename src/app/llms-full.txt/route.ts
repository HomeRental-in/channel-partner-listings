import { buildLlmsTxt } from "@/lib/seo/llms";

export function GET() {
  return new Response(buildLlmsTxt(true), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
