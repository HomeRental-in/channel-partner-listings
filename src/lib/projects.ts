import { z } from "zod";
import type { Prisma, Project } from "@prisma/client";
import { db } from "./db";
import { extractProjectFromBrochure } from "./ai";
import { storeFile, readStored } from "./storage";
import { uniqueSlug, formatINR } from "./format";
import { asArray, type Configuration, type PaymentMilestone, type FloorPlan, type FeatureSection, type NeighbourhoodItem } from "./types";
import { configLabel, configRange } from "@/components/projects/format";

// ── Shapes ──
const Str = z.string().trim().max(2000).nullable().optional();
export const ProjectInput = z.object({
  name: z.string().trim().min(1).max(160),
  developer: Str,
  reraNumber: Str,
  reraUrl: Str,
  possessionDate: Str,
  city: Str,
  locality: Str,
  landmark: Str,
  mapUrl: Str,
  description: z.string().max(6000).nullable().optional(),
  highlights: z.array(z.string().trim().max(120)).max(6).optional(),
  configurations: z.array(z.object({ type: z.string().trim().max(60), sizeSqft: z.number().nullable().optional(), priceFrom: z.number().nullable().optional(), priceTo: z.number().nullable().optional(), note: z.string().max(200).nullable().optional() })).max(30).optional(),
  paymentPlan: z.array(z.object({ milestone: z.string().trim().max(200), percent: z.number().nullable().optional() })).max(40).optional(),
  floorPlans: z.array(z.object({ url: z.string().max(1000), label: z.string().max(120).nullable().optional() })).max(40).optional(),
  amenities: z.array(z.string().trim().max(60)).max(80).optional(),
  locationAdvantages: z.array(z.object({ label: z.string().trim().max(120), value: z.string().trim().max(120) })).max(40).optional(),
  features: z.array(z.object({ id: z.string().optional(), title: z.string().trim().max(80), items: z.array(z.object({ id: z.string().optional(), icon: z.string().nullable().optional(), label: z.string().max(80), value: z.string().max(120) })).max(40) })).max(12).optional(),
  photos: z.array(z.object({ url: z.string().max(1000) })).max(40).optional(),
  brochureUrl: Str,
  videoTourUrl: Str,
});
export type ProjectInput = z.infer<typeof ProjectInput>;
export type ProjectPatch = Partial<ProjectInput>;

export type ProjectView = {
  id: string;
  slug: string;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  listingsCount: number;
  name: string;
  developer: string | null;
  reraNumber: string | null;
  reraUrl: string | null;
  possessionDate: string | null;
  city: string | null;
  locality: string | null;
  landmark: string | null;
  mapUrl: string | null;
  description: string | null;
  highlights: string[];
  configurations: Configuration[];
  paymentPlan: PaymentMilestone[];
  floorPlans: FloorPlan[];
  amenities: string[];
  locationAdvantages: NeighbourhoodItem[];
  features: FeatureSection[];
  photos: { url: string }[];
  brochureUrl: string | null;
  videoTourUrl: string | null;
};

type ProjectRow = Project & { _count?: { listings: number } };

export function toProjectView(p: ProjectRow): ProjectView {
  return {
    id: p.id,
    slug: p.slug,
    createdById: p.createdById,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    listingsCount: p._count?.listings ?? 0,
    name: p.name,
    developer: p.developer,
    reraNumber: p.reraNumber,
    reraUrl: p.reraUrl,
    possessionDate: p.possessionDate,
    city: p.city,
    locality: p.locality,
    landmark: p.landmark,
    mapUrl: p.mapUrl,
    description: p.description,
    highlights: asArray<string>(p.highlights),
    configurations: asArray<Configuration>(p.configurations),
    paymentPlan: asArray<PaymentMilestone>(p.paymentPlan),
    floorPlans: asArray<FloorPlan>(p.floorPlans),
    amenities: asArray<string>(p.amenities),
    locationAdvantages: asArray<NeighbourhoodItem>(p.locationAdvantages),
    features: asArray<FeatureSection>(p.features),
    photos: asArray<{ url: string }>(p.photos).filter((x) => x && typeof x.url === "string"),
    brochureUrl: p.brochureUrl,
    videoTourUrl: p.videoTourUrl,
  };
}

const INCLUDE = { _count: { select: { listings: true } } } as const;

export { configLabel, configRange };

function toData(input: ProjectPatch): Prisma.ProjectUncheckedUpdateInput {
  const d: Prisma.ProjectUncheckedUpdateInput = {};
  const scalar = ["name", "developer", "reraNumber", "reraUrl", "possessionDate", "city", "locality", "landmark", "mapUrl", "description", "brochureUrl", "videoTourUrl"] as const;
  for (const k of scalar) if (input[k] !== undefined) (d as Record<string, unknown>)[k] = input[k] === "" ? null : input[k];
  const json = ["highlights", "configurations", "paymentPlan", "floorPlans", "amenities", "locationAdvantages", "features", "photos"] as const;
  for (const k of json) if (input[k] !== undefined) (d as Record<string, unknown>)[k] = input[k] as Prisma.InputJsonValue;
  return d;
}

// ── CRUD ──
export async function getProject(id: string): Promise<ProjectView | null> {
  const p = await db.project.findUnique({ where: { id }, include: INCLUDE });
  return p ? toProjectView(p) : null;
}

export async function getProjectBySlug(slug: string): Promise<ProjectView | null> {
  const p = await db.project.findUnique({ where: { slug }, include: INCLUDE });
  return p ? toProjectView(p) : null;
}

export function canEditProject(userId: string, p: { createdById: string | null }) {
  return p.createdById === userId || p.createdById == null;
}

export async function createProject(userId: string, data: ProjectPatch & { name: string }): Promise<ProjectView> {
  const parsed = ProjectInput.parse({ ...data, name: data.name || "Untitled project" });
  const user = await db.user.findUnique({ where: { id: userId }, select: { city: true } });
  const created = await db.project.create({
    data: { ...(toData(parsed) as Prisma.ProjectUncheckedCreateInput), name: parsed.name, slug: uniqueSlug(parsed.name), createdById: userId, city: parsed.city ?? user?.city ?? null },
    include: INCLUDE,
  });
  return toProjectView(created);
}

export async function updateProject(userId: string, id: string, data: ProjectPatch): Promise<ProjectView> {
  const existing = await db.project.findUnique({ where: { id }, select: { createdById: true } });
  if (!existing) throw new Error("Project not found");
  if (!canEditProject(userId, existing)) throw new Error("You can only edit projects you created");
  const parsed = ProjectInput.partial().parse(data);
  const updated = await db.project.update({ where: { id }, data: toData(parsed), include: INCLUDE });
  return toProjectView(updated);
}

export async function deleteProject(userId: string, id: string) {
  const existing = await db.project.findUnique({ where: { id }, select: { createdById: true } });
  if (!existing || !canEditProject(userId, existing)) throw new Error("Project not found");
  await db.project.delete({ where: { id } });
}

/** AI-ingest a developer brochure PDF into a new Project owned by the user. */
export async function createProjectFromBrochure(userId: string, pdf: Buffer, hint?: string): Promise<ProjectView> {
  const [extracted, stored] = await Promise.all([extractProjectFromBrochure(pdf, hint), storeFile(pdf, { ext: "pdf", folder: "brochures", contentType: "application/pdf" })]);
  const { missing: _missing, ...rest } = extracted;
  void _missing;
  return createProject(userId, {
    ...rest,
    highlights: rest.highlights.slice(0, 6),
    configurations: rest.configurations.map((c) => ({ ...c, type: c.type || "Unit" })),
    brochureUrl: stored.url,
    photos: [],
    floorPlans: [],
  });
}

/** Library: projects the user created + other projects in the same city. */
export async function listProjectsForUser(userId: string, city: string | null | undefined): Promise<{ mine: ProjectView[]; inCity: ProjectView[] }> {
  const [mine, inCity] = await Promise.all([
    db.project.findMany({ where: { createdById: userId }, include: INCLUDE, orderBy: { updatedAt: "desc" } }),
    city
      ? db.project.findMany({ where: { city: { equals: city, mode: "insensitive" }, NOT: { createdById: userId } }, include: INCLUDE, orderBy: { updatedAt: "desc" }, take: 100 })
      : Promise.resolve([] as ProjectRow[]),
  ]);
  return { mine: mine.map(toProjectView), inCity: inCity.map(toProjectView) };
}

/**
 * Copy the template into a new DRAFT listing owned by the user (SPEC Flow C). Returns the new listing id.
 * Every field is copied; the CP can override anything afterwards. The contact card is always the CP's.
 */
export async function addProjectToMyListings(userId: string, projectId: string): Promise<string> {
  const p = await getProject(projectId);
  if (!p) throw new Error("Project not found");
  const label = configLabel(p.configurations);
  const title = `${label} in ${p.name}${p.locality ? `, ${p.locality}` : ""}`.slice(0, 120);
  const priced = p.configurations.filter((c) => typeof c.priceFrom === "number" && c.priceFrom! > 0);
  const price = priced.length ? Math.min(...priced.map((c) => c.priceFrom as number)) : null;
  const priceLines = p.configurations
    .filter((c) => typeof c.priceFrom === "number" && c.priceFrom! > 0)
    .map((c) => ({ label: c.type, amount: c.priceFrom as number, unit: c.priceTo && c.priceTo > (c.priceFrom as number) ? `to ${formatINR(c.priceTo)}` : "onwards", note: c.sizeSqft ? `${c.sizeSqft.toLocaleString("en-IN")} sq ft` : (c.note ?? null) }));
  const first = p.configurations[0];
  let brochureSize = 0;
  if (p.brochureUrl) {
    try {
      brochureSize = (await readStored(p.brochureUrl)).length;
    } catch {}
  }
  const listing = await db.listing.create({
    data: {
      userId,
      projectId: p.id,
      slug: uniqueSlug(title),
      status: "DRAFT",
      source: "WEB",
      title,
      category: "RESIDENTIAL",
      propertyType: "Apartment",
      transaction: "SALE",
      bhk: first?.type ?? null,
      areaSqft: first?.sizeSqft ?? null,
      areaLabel: first?.sizeSqft ? `${first.sizeSqft.toLocaleString("en-IN")} sq ft` : null,
      possession: p.possessionDate,
      price,
      priceLines: priceLines as Prisma.InputJsonValue,
      locality: p.locality,
      city: p.city,
      landmark: p.landmark,
      mapUrl: p.mapUrl,
      description: p.description,
      highlights: p.highlights as Prisma.InputJsonValue,
      amenities: p.amenities as Prisma.InputJsonValue,
      features: p.features as Prisma.InputJsonValue,
      neighbourhood: p.locationAdvantages as Prisma.InputJsonValue,
      videoTourUrl: p.videoTourUrl,
      documentsTitle: p.brochureUrl ? "Project brochure" : null,
      photos: { create: p.photos.map((ph, i) => ({ url: ph.url, order: i })) },
      documents: p.brochureUrl ? { create: [{ url: p.brochureUrl, name: `${p.name} brochure.pdf`, sizeBytes: brochureSize }] } : undefined,
    },
    select: { id: true },
  });
  return listing.id;
}
