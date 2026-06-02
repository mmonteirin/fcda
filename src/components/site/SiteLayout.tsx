import { Header } from "./Header";
import { Footer } from "./Footer";
import { Banner } from "./Banner";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
