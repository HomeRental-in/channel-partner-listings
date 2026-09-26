import { requireUser } from "@/lib/auth";
import { NewListingForm } from "./NewListingForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New listing" };

/** Web intake: photos + video + free-text description → AI extraction → editor step 2. */
export default async function NewListingPage() {
  await requireUser();
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <header>
        <h1 className="text-3xl md:text-4xl">Create a listing</h1>
        <p className="text-muted mt-1">Upload photos, describe the property, and AI does the rest. You review everything before it goes live.</p>
      </header>
      <NewListingForm />
    </div>
  );
}
