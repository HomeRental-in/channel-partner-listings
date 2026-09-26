"use client";
import { useState, useTransition } from "react";
import { LogOut, Trash2 } from "lucide-react";
import { deleteAccount } from "@/app/dashboard/settings/actions";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";

export function DangerZone({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const matches = typed.replace(/[^\d]/g, "").endsWith(phone.replace(/[^\d]/g, "").slice(-10)) && typed.replace(/[^\d]/g, "").length >= 10;

  return (
    <section className="card p-6 border border-red-200">
      <h2 className="text-lg text-red-700">Danger zone</h2>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <p className="font-medium">Sign out</p>
          <p className="text-sm text-muted">Sign out of this device. Your listings stay live.</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <Button type="submit" variant="light">
            <LogOut size={16} /> Sign out
          </Button>
        </form>
      </div>
      <div className="my-4 hairline" />
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <p className="font-medium">Delete account</p>
          <p className="text-sm text-muted">Removes your site, every listing, collection and analytics. Cannot be undone.</p>
        </div>
        <Button variant="danger" onClick={() => { setTyped(""); setError(null); setOpen(true); }}>
          <Trash2 size={16} /> Delete account
        </Button>
      </div>

      <Dialog
        open={open}
        onClose={() => !pending && setOpen(false)}
        title="Delete your account?"
        description="This permanently deletes your website, listings, photos, collections and analytics."
        size="sm"
        footer={
          <>
            <Button variant="light" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!matches}
              loading={pending}
              onClick={() =>
                start(async () => {
                  const r = await deleteAccount(typed);
                  if (r && !r.ok) setError(r.error);
                })
              }
            >
              Delete everything
            </Button>
          </>
        }
      >
        <Input label={`Type your phone number (${phone}) to confirm`} inputMode="tel" placeholder={phone} value={typed} onChange={(e) => setTyped(e.target.value)} error={error} autoComplete="off" data-autofocus />
      </Dialog>
    </section>
  );
}
