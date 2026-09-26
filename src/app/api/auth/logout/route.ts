import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST → clears the session. Form posts are redirected to /login; fetch callers get JSON. */
export async function POST(req: NextRequest) {
  await destroySession();
  const accept = req.headers.get("accept") ?? "";
  const isForm = (req.headers.get("content-type") ?? "").includes("form") || accept.includes("text/html");
  if (isForm) return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  return NextResponse.json({ ok: true });
}
