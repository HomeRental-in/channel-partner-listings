import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BRAND } from "@/lib/site";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };
export const dynamic = "force-dynamic";

export default async function LoginPage(props: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await props.searchParams;
  const user = await getCurrentUser();
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  if (user) redirect(target);

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {BRAND}
        </Link>
        <Link href="/" className="btn btn-light !py-2.5 !px-4 text-sm">
          Back to site
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="panel w-full max-w-md p-8 md:p-10 shadow-sm">
          <p className="eyebrow">Channel partner login</p>
          <h1 className="mt-3 text-3xl md:text-[34px]">Log in with WhatsApp</h1>
          <p className="mt-2 text-muted text-[15px]">We&apos;ll send a 6-digit code to your number. No password, no sign-up form.</p>
          <div className="mt-8">
            <LoginForm next={target} devHint={process.env.DEV_OTP ? `Dev OTP: ${process.env.DEV_OTP}` : null} />
          </div>
          <p className="mt-8 text-xs text-muted leading-relaxed">
            By continuing you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy policy</Link>. {BRAND} is free, forever.
          </p>
        </div>
      </div>
    </main>
  );
}
