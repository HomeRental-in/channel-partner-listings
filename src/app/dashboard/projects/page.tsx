import { requireUser } from "@/lib/auth";
import { listProjectsForUser } from "@/lib/projects";
import { ProjectLibrary } from "@/components/projects/ProjectLibrary";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await requireUser();
  const { mine, inCity } = await listProjectsForUser(user.id, user.city);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Projects</p>
        <h1 className="text-3xl">Project library</h1>
        <p className="text-black/55 mt-1 max-w-2xl">
          A project is a template of developer facts. Add one to your listings and it becomes your own page with your contact card, ready to share in seconds.
        </p>
      </div>
      <ProjectLibrary mine={mine} inCity={inCity} city={user.city} />
    </div>
  );
}
