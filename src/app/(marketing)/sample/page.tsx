import { redirect } from "next/navigation";

/** Public demo listing (slug seeded by the data/seed engineer). */
export const dynamic = "force-dynamic";

export default function SamplePage() {
  redirect("/l/sample-editorial-listing");
}
