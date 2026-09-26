import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createProject, createProjectFromBrochure, listProjectsForUser } from "@/lib/projects";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_PDF = 25 * 1024 * 1024;

/** GET /api/projects — the caller's library ({ mine, inCity }). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  return NextResponse.json(await listProjectsForUser(user.id, user.city));
}

/**
 * POST /api/projects — multipart `file` (PDF brochure) + optional `hint` → AI-ingested project;
 * or JSON body { name, ... } → manual project.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const ct = req.headers.get("content-type") ?? "";
  try {
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ error: "Attach a PDF brochure as `file`" }, { status: 400 });
      if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) return NextResponse.json({ error: "Only PDF brochures are supported" }, { status: 415 });
      if (file.size > MAX_PDF) return NextResponse.json({ error: "Brochure must be under 25 MB" }, { status: 413 });
      const hint = typeof form.get("hint") === "string" ? String(form.get("hint")).slice(0, 300) : undefined;
      const project = await createProjectFromBrochure(user.id, Buffer.from(await file.arrayBuffer()), hint || undefined);
      return NextResponse.json({ id: project.id, project }, { status: 201 });
    }
    const body = await req.json().catch(() => ({}));
    const project = await createProject(user.id, { ...body, name: typeof body?.name === "string" && body.name.trim() ? body.name : "Untitled project" });
    return NextResponse.json({ id: project.id, project }, { status: 201 });
  } catch (err) {
    console.error("project create failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not create the project" }, { status: 500 });
  }
}
