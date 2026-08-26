import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { clubesQuery, type Clube } from "@/lib/site-queries";
import { Building2, MapPin, Phone, Mail, Calendar, ExternalLink, Search } from "lucide-react";

export const Route = createFileRoute("/clubes")({
  head: () => ({
    meta: [
      { title: "Clubes Filiados — FCDA" },
      {
        name: "description",
        content:
          "Conheça os clubes e agremiações de natação filiados à Federação Cearense de Desportos Aquáticos.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(clubesQuery(true)),
  errorComponent: ({ error }) => <div className="text-destructive p-8 text-center">Erro: {error.message}</div>,
  component: Clubes,
});

function Clubes() {
  const { data: clubes } = useSuspenseQuery(clubesQuery(true));
  const [busca, setBusca] = useState("");

  const clubesFiltrados = useMemo(() => {
    if (!busca.trim()) return clubes;
    const term = busca.toLowerCase();
    return clubes.filter(
      (c) =>
        c.nome.toLowerCase().includes(term) ||
        (c.sigla && c.sigla.toLowerCase().includes(term)) ||
        (c.cidade && c.cidade.toLowerCase().includes(term)),
    );
  }, [clubes, busca]);

  return (
    <SiteLayout>
      <section className="py-20 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Natação Cearense</p>
          <h1 className="mt-3 text-5xl font-bold">Clubes Filiados</h1>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Conheça os clubes de natação que compõem a federação e representam o Ceará nas
            competições estaduais e nacionais.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por clube, sigla ou cidade..."
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">
              {clubesFiltrados.length} {clubesFiltrados.length === 1 ? "clube filiado" : "clubes filiados"}
            </span>
          </div>

          {clubesFiltrados.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border p-8">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-bold text-deep">Nenhum clube encontrado.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar os termos de busca.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clubesFiltrados.map((clube) => (
                <ClubeCard key={clube.id} clube={clube} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function formatFundacao(val: string) {
  try {
    // Se for apenas ano (ex: "1980")
    if (/^\d{4}$/.test(val.trim())) return val.trim();
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString("pt-BR");
  } catch {
    return val;
  }
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
            <span>Fundado em {formatFundacao(clube.fundacao)}</span>
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
