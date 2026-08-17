import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { clubesQuery, type Clube } from "@/lib/site-queries";
import { Building2, MapPin, Phone, Mail, Calendar, ExternalLink, Users } from "lucide-react";

export const Route = createFileRoute("/clubes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(clubesQuery(true)),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: Clubes,
});

function Clubes() {
  const { data: clubes } = useSuspenseQuery(clubesQuery(true));

  return (
    <SiteLayout>
      <section className="py-20 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Natação Cearense</p>
          <h1 className="mt-3 text-5xl font-bold">Clubes Filiados</h1>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Conheça os clubes de natação que compõem a federação e representam o Ceará nas
            competições nacionais.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          {clubes.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">Nenhum clube cadastrado.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clubes.map((clube) => (
                <ClubeCard key={clube.id} clube={clube} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function ClubeCard({ clube }: { clube: Clube }) {
  return (
    <article className="rounded-2xl border border-border bg-card shadow-card overflow-hidden hover:shadow-elegant transition-shadow">
      <div className="flex items-center gap-4 p-6 border-b border-border/50 bg-secondary/30">
        {clube.logo_url ? (
          <img
            src={clube.logo_url}
            alt={clube.nome}
            className="h-16 w-16 object-contain rounded-lg"
          />
        ) : (
          <div className="h-16 w-16 rounded-lg bg-primary/10 grid place-items-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-deep">{clube.nome}</h2>
          {clube.sigla && (
            <span className="text-sm text-muted-foreground font-semibold">{clube.sigla}</span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-3">
        {clube.cidade && clube.estado && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>
              {clube.cidade}, {clube.estado}
            </span>
          </div>
        )}

        {clube.fundacao && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Fundado em {new Date(clube.fundacao).toLocaleDateString("pt-BR")}</span>
          </div>
        )}

        {clube.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" />
            <a href={`mailto:${clube.email}`} className="hover:text-primary transition-colors">
              {clube.email}
            </a>
          </div>
        )}

        {clube.telefone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <a href={`tel:${clube.telefone}`} className="hover:text-primary transition-colors">
              {clube.telefone}
            </a>
          </div>
        )}

        {clube.site_url && (
          <div className="pt-3">
            <a
              href={clube.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Visitar site
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
