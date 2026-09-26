import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProject, updateProject, ProjectInput } from "@/lib/projects";

export const dynamic = "force-dynamic";

/** GET /api/projects/[id] — one project template. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await ctx.params;
  const project = await getProject(id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json(project);
}

/** PATCH /api/projects/[id] — partial update (creator only). */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = ProjectInput.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid project data", issues: parsed.error.issues }, { status: 400 });
  try {
    return NextResponse.json(await updateProject(user.id, id, parsed.data));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not update" }, { status: 403 });
  }
}
