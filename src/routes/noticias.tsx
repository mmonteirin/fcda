import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { noticiasQuery, eventosQuery } from "@/lib/site-queries";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias & Eventos — FCDA" },
      {
        name: "description",
        content: "Últimas notícias, calendário oficial e eventos dos desportos aquáticos no Ceará.",
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(noticiasQuery(true)),
      context.queryClient.ensureQueryData(eventosQuery()),
    ]),
  errorComponent: ({ error }) => (
    <div className="p-12 text-destructive">Erro ao carregar: {error.message}</div>
  ),
  component: Noticias,
});

function formatData(d: string) {
  try {
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function Noticias() {
  const noticias = useSuspenseQuery(noticiasQuery(true)).data;
  const eventos = useSuspenseQuery(eventosQuery()).data;

  // Filtrar eventos para mostrar apenas os futuros
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const eventosFuturos = eventos.filter((e) => {
    if (!e.data_inicio) return false;
    const dataEvento = new Date(e.data_inicio);
    dataEvento.setHours(0, 0, 0, 0);
    return dataEvento >= hoje;
  });

  return (
    <SiteLayout>
      <section className="py-24 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs uppercase tracking-[0.25em] text-gold font-bold">Comunicação</div>
          <h1 className="mt-4 text-5xl md:text-6xl font-bold">Notícias & Eventos</h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl">
            O movimento dos desportos aquáticos cearenses, semana a semana.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
            Últimas notícias
          </div>
          <h2 className="mt-3 text-4xl font-bold text-deep mb-12">Em destaque</h2>

          {noticias.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma notícia publicada ainda.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticias.map((n) => (
                <article
                  key={n.id}
                  className="group rounded-2xl bg-card border border-border/60 overflow-hidden shadow-card hover:shadow-elegant transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] bg-emerald-gradient relative overflow-hidden">
                    {n.imagem_url && (
                      <img
                        src={n.imagem_url}
                        alt={n.titulo}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute top-4 left-4 inline-flex items-center rounded-full bg-gold px-3 py-1 text-xs font-bold text-deep uppercase tracking-wider">
                      {n.categoria}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs text-muted-foreground">{formatData(n.data)}</div>
                    <h3 className="mt-3 text-lg font-bold text-deep leading-tight group-hover:text-primary transition-colors">
                      {n.titulo}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{n.resumo}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
            Calendário
          </div>
          <h2 className="mt-3 text-4xl font-bold text-deep mb-12">Próximos eventos</h2>

          {eventosFuturos.length === 0 ? (
            <p className="text-muted-foreground">Nenhum evento futuro cadastrado.</p>
          ) : (
            <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-card">
              {eventosFuturos.map((e) => (
                <div
                  key={e.id}
                  className="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-4 md:gap-8 items-start md:items-center p-6 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-gradient grid place-items-center text-primary-foreground">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="font-bold text-deep">{e.data_texto}</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-deep">{e.nome}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3.5 w-3.5" /> {e.local}
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-gold/15 text-deep border border-gold/30">
                    {e.modalidade}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
