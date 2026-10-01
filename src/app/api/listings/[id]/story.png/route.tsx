import { NextResponse, type NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { getPublicListingById } from "@/lib/public";
import { resolveOutputAccess } from "@/lib/outputs/access";
import { SAMPLE_ID, sampleListing } from "@/lib/sample";
import { photoAsDataUri } from "@/lib/outputs/images";
import { StoryImage, storyFonts, STORY_W, STORY_H } from "@/lib/outputs/story";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** GET /api/listings/[id]/story.png?variant=1|2|3 — 1080×1920 PNG for WhatsApp/Instagram stories. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  // The marketing sample (/sample) is a fixture, not a database row.
  const isSample = id === SAMPLE_ID;
  const access = isSample
    ? { ok: true as const, isOwner: true, listing: { id, userId: "", slug: "sample", updatedAt: new Date(0) } }
    : await resolveOutputAccess(id);
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: access.status });

  const data = isSample ? sampleListing() : await getPublicListingById(id);
  if (!data) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const v = Number(req.nextUrl.searchParams.get("variant") ?? "1");
  const variant = (v === 2 || v === 3 ? v : 1) as 1 | 2 | 3;

  const [cover, avatar, fonts] = await Promise.all([
    data.cover ? photoAsDataUri(data.cover.url, 1200) : Promise.resolve(null),
    data.broker.avatarUrl && data.broker.card.showNamePhoto ? photoAsDataUri(data.broker.avatarUrl, 240) : Promise.resolve(null),
    storyFonts(),
  ]);

  try {
    const res = new ImageResponse(<StoryImage data={data} cover={cover} avatar={avatar} variant={variant} rupeeOk={!!fonts?.rupee} fonts={!!fonts} />, {
      width: STORY_W,
      height: STORY_H,
      fonts: fonts ? fonts.fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: "normal" as const })) : undefined,
      headers: {
        "Content-Disposition": `inline; filename="${access.listing.slug}-story-${variant}.png"`,
        "Cache-Control": "private, max-age=300",
      },
    });
    return res;
  } catch (err) {
    console.error("story image failed", err);
    return NextResponse.json({ error: "Could not render the story image" }, { status: 500 });
  }
}
