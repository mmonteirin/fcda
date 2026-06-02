import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ExternalLink, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/inscricoes")({
  head: () => ({
    meta: [
      { title: "Sistemas de Inscrição — FCDA" },
      {
        name: "description",
        content:
          "Acesse os sistemas oficiais de inscrição para competições de desportos aquáticos.",
      },
    ],
  }),
  component: Inscricoes,
});

function Inscricoes() {
  return (
    <SiteLayout>
      <section className="py-24 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs uppercase tracking-[0.25em] text-gold font-bold">Competições</div>
          <h1 className="mt-4 text-5xl md:text-6xl font-bold">Sistemas de Inscrição</h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl">
            Acesse os sistemas oficiais para realizar inscrições em competições de desportos
            aquáticos.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <a
              href="https://vida-atleta.bigmidia.com/site/login"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-card border border-border/60 overflow-hidden shadow-card hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <div className="p-8">
                <div className="h-12 w-12 rounded-lg bg-emerald-gradient grid place-items-center text-primary-foreground mb-6">
                  <ExternalLink className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-deep mb-3">SGE - CBDA</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Sistema de Gestão de Eventos da Confederação Brasileira de Desportos Aquáticos.
                  Desenvolvido pela BigMidia.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                  Acessar sistema <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </a>

            <a
              href="https://www.swimsystem.app/onboarding/8db472d3-cb28-4f0f-b9f3-c673c95ab0c6/coaches"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-card border border-border/60 overflow-hidden shadow-card hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <div className="p-8">
                <div className="h-12 w-12 rounded-lg bg-emerald-gradient grid place-items-center text-primary-foreground mb-6">
                  <ExternalLink className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-deep mb-3">Swimsystem</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Sistema de gestão de inscrições e competições. Desenvolvido pelo
                  SportsTimingBrasil.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                  Acessar sistema <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
