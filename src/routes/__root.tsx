import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth.tsx";
import { Toaster } from "@/components/ui/sonner";
import logoFCDA from "@/assets/logoFCDA.png";
import "@/lib/sentry";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
          <img src={logoFCDA} alt="FCDA" className="h-12 w-auto" />
        </div>
        <h1 className="text-7xl font-bold text-deep">404</h1>
        <h2 className="mt-4 text-xl font-bold text-deep">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-deep px-6 py-3 text-sm font-bold text-deep-foreground transition-colors hover:bg-primary"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10">
          <img src={logoFCDA} alt="FCDA" className="h-12 w-auto" />
        </div>
        <h1 className="text-2xl font-bold text-deep">
          Ocorreu um erro
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Não foi possível carregar esta página. Você pode tentar novamente ou retornar ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-bold text-deep transition-colors hover:bg-secondary"
          >
            Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FCDA — Federação Cearense de Desportos Aquáticos" },
      {
        name: "description",
        content:
          "Federação Cearense de Desportos Aquáticos. Notícias, competições, rankings, recordes, modalidades e transparência.",
      },
      { name: "author", content: "FCDA" },
      { property: "og:title", content: "FCDA — Federação Cearense de Desportos Aquáticos" },
      {
        property: "og:description",
        content:
          "Site oficial da Federação Cearense de Desportos Aquáticos. Calendário, notícias e resultados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@FCDA" },
      {
        name: "theme-color",
        content: "#073c2f",
      },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      {
        rel: "icon",
        type: "image/png",
        href: logoFCDA,
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SportsOrganization",
          name: "Federação Cearense de Desportos Aquáticos",
          alternateName: "FCDA",
          url: "https://fcda.org.br",
          foundingDate: "1958",
          sport: ["Natação", "Polo Aquático", "Águas Abertas", "Nado Artístico", "Saltos Ornamentais"],
          address: { "@type": "PostalAddress", addressLocality: "Fortaleza", addressRegion: "CE", addressCountry: "BR" },
          sameAs: ["https://www.instagram.com/fcdaquaticos/", "https://www.facebook.com/fcdaquaticos/"]
        }) }} />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
