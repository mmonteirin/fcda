import { Header } from "./Header/Header";
import { Footer } from "./Footer/Footer";
import { Banner } from "./Banner";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Banner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <InstallPrompt />
    </div>
  );
}
