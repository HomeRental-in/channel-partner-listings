import { NextResponse, type NextRequest } from "next/server";
import { getPublicListingById } from "@/lib/public";
import { resolveOutputAccess } from "@/lib/outputs/access";
import { getBrochurePdf } from "@/lib/outputs/brochure";
import { recordEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** GET /api/listings/[id]/brochure.pdf — public for LIVE/SOLD/RENTED listings, owner-only otherwise. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const access = await resolveOutputAccess(id);
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: access.status });

  const data = await getPublicListingById(id);
  if (!data) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  let pdf: Buffer;
  try {
    pdf = await getBrochurePdf(data, `${id}:${access.listing.updatedAt.getTime()}`);
  } catch (err) {
    console.error("brochure render failed", err);
    return NextResponse.json({ error: "Could not render the brochure" }, { status: 500 });
  }

  if (!access.isOwner) {
    const cookie = req.cookies.get("cd_vid")?.value ?? null;
    const viewerName = req.nextUrl.searchParams.get("n");
    recordEvent({ listingId: id, ownerId: access.listing.userId, type: "BROCHURE_DOWNLOAD", visitorId: cookie, viewerName: viewerName ? viewerName.replace(/[-_+]/g, " ").slice(0, 30) : null, path: req.nextUrl.pathname, referrer: req.headers.get("referer") }).catch(() => {});
  }

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${access.listing.slug}-brochure.pdf"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "private, max-age=600",
    },
  });
}
