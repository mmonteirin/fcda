import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { rankingByIdQuery } from "@/lib/api/site-queries";
import { ArrowLeft, Trophy } from "lucide-react";

export const Route = createFileRoute("/rankings/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(rankingByIdQuery(params.id)),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.nome} ${loaderData.ano} — FCDA` : "Ranking — FCDA", ...(loaderData?.descricao ? { name: "description", content: loaderData.descricao } : {}) }] }),
  component: RankingDetalhe,
});

function RankingDetalhe() {
  const { id } = Route.useParams();
  const ranking = useSuspenseQuery(rankingByIdQuery(id)).data;
  if (!ranking) return <SiteLayout><section className="mx-auto max-w-3xl px-6 py-28 text-center"><h1 className="text-3xl font-bold text-deep">Ranking não encontrado</h1><Link to="/rankings" className="mt-6 inline-flex items-center gap-2 font-semibold text-primary"><ArrowLeft aria-hidden="true" className="h-4 w-4"/>Voltar aos rankings</Link></section></SiteLayout>;

  const classificacoes = [...(ranking.ranking_classificacoes ?? [])].sort((a, b) => Number(b.pontuacao_final) - Number(a.pontuacao_final));
  const medalhas = ["text-amber-700 bg-amber-100", "text-slate-700 bg-slate-200", "text-orange-800 bg-orange-100"];
  return <SiteLayout><section className="bg-hero py-16 text-primary-foreground"><div className="mx-auto max-w-6xl px-6"><Link to="/rankings" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground/80 hover:text-white"><ArrowLeft aria-hidden="true" className="h-4 w-4"/>Todos os rankings</Link><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-gold">Temporada {ranking.ano}</p><h1 className="mt-2 text-4xl font-bold md:text-5xl">{ranking.nome}</h1>{ranking.descricao && <p className="mt-4 max-w-3xl text-primary-foreground/80">{ranking.descricao}</p>}</div></section>
    <section className="py-14"><div className="mx-auto max-w-6xl px-6">{classificacoes.length >= 3 && <div className="mb-12 grid items-end gap-4 md:grid-cols-3">{[{ index: 1, place: 2 }, { index: 0, place: 1 }, { index: 2, place: 3 }].map(({ index, place }) => { const atleta = classificacoes[index]; return <article key={atleta.id} className={`rounded-2xl border border-border bg-card p-6 text-center shadow-card ${place === 1 ? "md:-translate-y-4 md:py-10" : ""}`}><Trophy aria-hidden="true" className={`mx-auto mb-3 h-9 w-9 ${place === 1 ? "text-amber-500" : "text-muted-foreground"}`}/><p className="text-xs font-bold uppercase tracking-widest text-primary">{place}º lugar</p><h2 className="mt-2 text-xl font-bold text-deep">{atleta.atleta_nome}</h2><p className="mt-1 text-sm text-muted-foreground">{atleta.clube} · {atleta.categoria}</p><p className="mt-3 text-2xl font-bold text-primary">{atleta.pontuacao_final} pts</p></article>; })}</div>}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"><div className="border-b border-border px-5 py-4"><h2 className="text-lg font-bold text-deep">Classificação completa</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-secondary/60 text-muted-foreground"><tr><th scope="col" className="p-4">Posição</th><th scope="col" className="p-4">Atleta</th><th scope="col" className="p-4">Nascimento</th><th scope="col" className="p-4">Categoria</th><th scope="col" className="p-4">Clube</th><th scope="col" className="p-4 text-right">Pontuação</th></tr></thead><tbody>{classificacoes.map((atleta, index) => <tr key={atleta.id} className="border-t border-border/70 hover:bg-secondary/30"><td className="p-4"><span className={`inline-flex min-w-8 justify-center rounded-full px-2 py-1 font-bold ${index < 3 ? medalhas[index] : "text-muted-foreground"}`}>{index + 1}º</span></td><th scope="row" className="p-4 font-semibold text-deep">{atleta.atleta_nome}</th><td className="p-4">{atleta.ano_nascimento || "—"}</td><td className="p-4">{atleta.categoria || "—"}</td><td className="p-4">{atleta.clube || "—"}</td><td className="p-4 text-right font-bold text-primary">{atleta.pontuacao_final}</td></tr>)}</tbody></table></div></div>
    </div></section></SiteLayout>;
}
