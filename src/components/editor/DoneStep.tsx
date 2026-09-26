"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShareModal } from "@/components/dashboard/ShareModal";
import { ShareLinks } from "./ShareLinks";
import { PublishBox } from "./PublishBox";
import type { ActionResult, SignupInput } from "./schema";

/** Dashboard "Done" step: link, copy, WhatsApp, personalise, PDF/story outputs and Publish when still a draft. */
export function DoneStep({ listing, username, publicUrl, rootDomain, needsSignup, publish }: { listing: { id: string; slug: string; title: string; priceDisplay: string; status: string }; username: string | null; publicUrl: string; rootDomain: string; needsSignup: boolean; publish: (signup?: SignupInput) => Promise<ActionResult<{ url: string }>> }) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const draft = listing.status === "DRAFT";
  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
      <div className="space-y-5">
        <section className="card p-6 md:p-8 space-y-5">
          <div>
            <h2 className="text-2xl md:text-3xl">{draft ? "Your listing page is ready to publish" : "Your listing page is ready 🎉"}</h2>
            <p className="text-muted mt-1">{draft ? "Publish it to make the link work for buyers. You can keep editing afterwards." : "Share the link on WhatsApp — every open shows up in your analytics."}</p>
          </div>
          {draft && (
            <div className="rounded-[var(--radius-inner)] bg-soft p-4">
              <PublishBox needsSignup={needsSignup} rootDomain={rootDomain} publish={publish} big label="Publish listing" onPublished={() => router.refresh()} />
            </div>
          )}
          <ShareLinks url={publicUrl} title={listing.title} priceDisplay={listing.priceDisplay} />
        </section>
      </div>
      <aside className="space-y-4">
        <section className="card p-5 space-y-3">
          <span className="eyebrow">Outputs</span>
          <a href={`/api/listings/${listing.id}/brochure.pdf`} target="_blank" rel="noreferrer" className="btn btn-light w-full justify-between">
            PDF brochure <span>↓</span>
          </a>
          <a href={`/api/listings/${listing.id}/story.png`} target="_blank" rel="noreferrer" className="btn btn-light w-full justify-between">
            Story image (1080×1920) <span>↓</span>
          </a>
          <Link href={`/dashboard/listings/${listing.id}/story`} className="btn btn-light w-full justify-between">
            Story video editor <span>→</span>
          </Link>
        </section>
        <section className="card p-5 space-y-3">
          <span className="eyebrow">More ways to share</span>
          <button type="button" onClick={() => setShareOpen(true)} className="btn btn-light w-full justify-center">
            Open share options
          </button>
          <ShareModal listing={{ id: listing.id, slug: listing.slug, title: listing.title, priceDisplay: listing.priceDisplay }} username={username} open={shareOpen} onClose={() => setShareOpen(false)} />
        </section>
        <Link href="/dashboard/listings" className="btn btn-ghost w-full justify-center">
          Back to My listings
        </Link>
      </aside>
    </div>
  );
}
