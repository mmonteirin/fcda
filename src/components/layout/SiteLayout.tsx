import { Header } from "./Header/Header";
import { Footer } from "./Footer/Footer";
import { Banner } from "./Banner";
import { InstallPrompt } from "@/components/features/pwa/InstallPrompt";
import { BackToTop } from "@/components/ui/back-to-top";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:font-semibold focus:text-deep focus:shadow-lg">Pular para o conteúdo</a>
      <Banner />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>
      <Footer />
      <BackToTop />
      <InstallPrompt />
    </div>
  );
}
