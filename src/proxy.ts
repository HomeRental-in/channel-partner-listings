import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

/**
 * Subdomain routing + first-party visitor cookie.
 *  username.<ROOT_DOMAIN>/            → /sites/<username>
 *  username.<ROOT_DOMAIN>/l/<slug>    → /sites/<username>/l/<slug>
 *  username.<ROOT_DOMAIN>/c/<slug>    → /sites/<username>/c/<slug>
 * The root domain serves marketing + dashboard + /l/<slug> canonical listing pages.
 */
const ROOT = (process.env.ROOT_DOMAIN ?? "localhost:3000").toLowerCase();
const RESERVED = new Set(["www", "app", "api", "admin", "mail", "static", "cdn", "assets"]);
const VISITOR_COOKIE = "cd_vid";

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const { pathname } = req.nextUrl;

  let res: NextResponse | undefined;

  // Determine subdomain relative to ROOT (supports foo.localhost:3000 and foo.example.in)
  let sub: string | null = null;
  if (host !== ROOT && host.endsWith("." + ROOT)) {
    sub = host.slice(0, -(ROOT.length + 1));
  }
  const passThrough = pathname.startsWith("/api") || pathname.startsWith("/uploads");
  if (sub && !RESERVED.has(sub) && !sub.includes(".") && !passThrough) {
    // Never rewrite dashboard/auth paths on a subdomain; send them to the root domain. /api and /uploads pass through untouched.
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/login") || pathname.startsWith("/review") || pathname.startsWith("/dev")) {
      const url = req.nextUrl.clone();
      url.host = ROOT;
      return NextResponse.redirect(url);
    }
    const url = req.nextUrl.clone();
    url.pathname = `/sites/${sub}${pathname === "/" ? "" : pathname}`;
    res = NextResponse.rewrite(url);
  }

  res ??= NextResponse.next();

  // First-party visitor id on public pages (never an identity; used for unique-viewer counts).
  const isPublic = !pathname.startsWith("/dashboard") && !pathname.startsWith("/api") && !pathname.startsWith("/login");
  if (isPublic && !req.cookies.get(VISITOR_COOKIE)) {
    res.cookies.set(VISITOR_COOKIE, nanoid(21), {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 180,
      path: "/",
      // Share across all subdomains of the root domain (strip port).
      domain: process.env.NODE_ENV === "production" ? "." + ROOT.split(":")[0] : undefined,
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|robots.txt|sitemap.xml).*)"],
};
