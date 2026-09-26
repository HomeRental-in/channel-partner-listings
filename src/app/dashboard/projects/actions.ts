"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { rewriteDescription } from "@/lib/ai";
import { addProjectToMyListings, createProject, deleteProject, updateProject, type ProjectPatch, type ProjectView } from "@/lib/projects";

export async function createManualProjectAction() {
  const user = await requireUser();
  const p = await createProject(user.id, { name: "Untitled project" });
  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${p.id}`);
}

export async function updateProjectAction(id: string, data: ProjectPatch): Promise<{ ok: true; project: ProjectView } | { ok: false; error: string }> {
  const user = await requireUser();
  try {
    const project = await updateProject(user.id, id, data);
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${id}`);
    return { ok: true, project };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save" };
  }
}

export async function regenerateProjectDescriptionAction(data: ProjectPatch): Promise<{ ok: true; description: string; highlights: string[] } | { ok: false; error: string }> {
  await requireUser();
  try {
    const { description: _d, highlights: _h, photos: _p, floorPlans: _f, brochureUrl: _b, ...facts } = data;
    void _d; void _h; void _p; void _f; void _b;
    const out = await rewriteDescription({ kind: "project template", ...facts });
    return { ok: true, description: out.description, highlights: out.highlights };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "AI rewrite failed" };
  }
}

export async function addProjectToListingsAction(projectId: string) {
  const user = await requireUser();
  const listingId = await addProjectToMyListings(user.id, projectId);
  revalidatePath("/dashboard/listings");
  redirect(`/dashboard/listings/${listingId}?step=photos`);
}

export async function deleteProjectAction(id: string) {
  const user = await requireUser();
  await deleteProject(user.id, id);
  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
}
