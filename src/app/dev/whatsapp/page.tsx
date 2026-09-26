import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Simulator } from "./Simulator";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "WhatsApp simulator (dev)" };

/** Dev-only chat simulator for the WhatsApp intake flow. 404 outside development. */
export default function DevWhatsappPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="eyebrow">Development</p>
      <h1 className="mt-1 text-3xl">WhatsApp intake simulator</h1>
      <p className="mt-2 text-sm text-muted">
        Messages go through <code>POST /api/whatsapp/simulate</code> → the same intake state machine as the real webhook, using the mock provider. Replies are captured from the WhatsappMessage table.
      </p>
      <div className="mt-6">
        <Simulator />
      </div>
    </main>
  );
}
