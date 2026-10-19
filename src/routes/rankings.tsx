import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { rankingsQuery } from "@/lib/api/site-queries";
import { Trophy, ArrowRight, Award } from "lucide-react";

export const Route = createFileRoute("/rankings")({
  head: () => ({ meta: [{ title: "Rankings Oficiais — FCDA" }, { name: "description", content: "Rankings oficiais e pontuações consolidadas das temporadas da Federação Cearense de Desportos Aquáticos." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(rankingsQuery),
  component: Rankings,
});

function Rankings() {
  const dados = useSuspenseQuery(rankingsQuery).data;
  return <SiteLayout>
    <section className="bg-hero py-20 text-primary-foreground"><div className="mx-auto max-w-5xl px-6"><p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Competições</p><h1 className="mt-3 text-5xl font-bold">Rankings FCDA</h1><p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">Histórico e consolidação de pontuação dos atletas e clubes nas temporadas oficiais.</p></div></section>
    <section className="border-b border-border/60 bg-secondary/30 py-8"><div className="mx-auto max-w-6xl px-6"><div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/15 to-gold/15 p-6 sm:flex-row"><div className="flex items-center gap-3"><Trophy aria-hidden="true" className="h-8 w-8 shrink-0 text-gold"/><div><h2 className="text-lg font-bold text-deep">Ranking Temporada 2026</h2><p className="text-sm text-muted-foreground">Acompanhe a pontuação parcial por classes e categorias.</p></div></div><Link to="/ranking-temporada-2026" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-deep px-5 py-2.5 text-sm font-bold text-deep-foreground transition-colors hover:bg-primary">Ver Temporada 2026 <ArrowRight aria-hidden="true" className="h-4 w-4"/></Link></div></div></section>
    <section className="py-16"><div className="mx-auto max-w-6xl space-y-6 px-6">{dados.length === 0 ? <div className="rounded-2xl border border-border bg-card p-8 py-16 text-center"><Award aria-hidden="true" className="mx-auto mb-3 h-12 w-12 text-muted-foreground"/><p className="text-lg font-semibold text-deep">Nenhum ranking consolidado disponível no momento.</p><p className="mt-1 text-sm text-muted-foreground">Consulte o Ranking da Temporada 2026 no botão acima.</p></div> : dados.map((r) => <article key={r.id} className="rounded-2xl border border-border bg-card p-6 shadow-card"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold text-deep">{r.nome} · Temporada {r.ano}</h2>{r.descricao && <p className="mt-1 text-sm text-muted-foreground">{r.descricao}</p>}</div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary">{r.ranking_classificacoes?.length ?? 0} atletas</span></div><Link to="/rankings/$id" params={{ id: r.id }} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">Ver classificação completa <ArrowRight aria-hidden="true" className="h-4 w-4"/></Link></article>)}</div></section>
  </SiteLayout>;
}
