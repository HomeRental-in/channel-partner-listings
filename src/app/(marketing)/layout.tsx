import "@/components/marketing/marketing.css";
import { BRAND } from "@/lib/site";
import Nav from "@/components/marketing/Nav";
import Footer from "@/components/marketing/Footer";
import Motion from "@/components/marketing/Motion";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mk-motion flex min-h-dvh flex-col">
      <Motion />
      <Nav brand={BRAND} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
