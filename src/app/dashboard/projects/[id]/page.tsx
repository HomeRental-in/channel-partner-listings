import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { canEditProject, getProject } from "@/lib/projects";
import { ProjectEditor } from "@/components/projects/ProjectEditor";

export const dynamic = "force-dynamic";

export default async function ProjectEditorPage(props: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await props.params;
  const project = await getProject(id);
  if (!project) notFound();
  const canEdit = canEditProject(user.id, project);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects" className="icon-btn" aria-label="Back to projects">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="eyebrow">{canEdit ? "Project template" : "Project template · read only"}</p>
          <h1 className="text-3xl">{project.name}</h1>
        </div>
      </div>
      <ProjectEditor project={project} canEdit={canEdit} />
    </div>
  );
}
