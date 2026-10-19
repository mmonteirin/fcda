import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { recordesQuery } from "@/lib/api/site-queries";
import { Trophy, Timer, Search, Filter } from "lucide-react";

export const Route = createFileRoute("/recordes")({
  head: () => ({ meta: [{ title: "Recordes Cearenses — FCDA" }, { name: "description", content: "Quadro oficial de recordes cearenses de natação em piscina olímpica e semiolímpica da FCDA." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(recordesQuery),
  component: Recordes,
});

function Recordes() {
  const recordes = useSuspenseQuery(recordesQuery).data;
  const [piscina, setPiscina] = useState("olimpica");
  const [sexo, setSexo] = useState("masculino");
  const [busca, setBusca] = useState("");
  const lista = useMemo(() => recordes.filter((r) =>
    (!piscina || r.piscina === piscina) && (!sexo || r.sexo === sexo) &&
    (!busca.trim() || `${r.prova} ${r.atleta_nome}`.toLocaleLowerCase().includes(busca.trim().toLocaleLowerCase()))
  ), [recordes, piscina, sexo, busca]);

  return (
    <SiteLayout>
      <section className="bg-hero py-20 text-primary-foreground"><div className="mx-auto max-w-5xl px-6">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Natação cearense</p><h1 className="mt-3 text-5xl font-bold">Recordes FCDA</h1>
        <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">Melhores marcas homologadas na história dos desportos aquáticos do Ceará.</p>
      </div></section>
      <section className="py-16"><div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto"><div className="flex items-center gap-2"><Filter aria-hidden="true" className="h-4 w-4 text-muted-foreground"/><span className="text-sm font-semibold text-deep">Filtros:</span></div>
            <label className="sr-only" htmlFor="recorde-piscina">Piscina</label><select id="recorde-piscina" value={piscina} onChange={(e) => setPiscina(e.target.value)} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-deep shadow-sm"><option value="">Todas as piscinas</option><option value="olimpica">Piscina Olímpica (50m)</option><option value="semiolimpica">Piscina Semiolímpica (25m)</option></select>
            <label className="sr-only" htmlFor="recorde-sexo">Categoria</label><select id="recorde-sexo" value={sexo} onChange={(e) => setSexo(e.target.value)} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-deep shadow-sm"><option value="">Todas as categorias</option><option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="misto">Misto</option></select>
          </div><div className="relative w-full md:w-72"><Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><label className="sr-only" htmlFor="recorde-busca">Buscar por prova ou atleta</label><input id="recorde-busca" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar prova ou atleta..." className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"/></div>
        </div>
        {lista.length === 0 ? <div className="rounded-2xl border border-border bg-card p-8 py-16 text-center"><Timer aria-hidden="true" className="mx-auto mb-3 h-12 w-12 text-muted-foreground"/><p className="text-lg font-semibold text-deep">Nenhum recorde encontrado para este filtro.</p><p className="mt-1 text-sm text-muted-foreground">Tente ajustar a piscina, a categoria ou a busca.</p></div> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{lista.map((r) => <article key={r.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant motion-reduce:transition-none">
          <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-secondary/50">{r.foto_url ? <img src={r.foto_url} alt={`Atleta recordista: ${r.atleta_nome}`} loading="lazy" decoding="async" className="h-full w-full object-cover"/> : <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground"><Trophy aria-hidden="true" className="h-10 w-10 text-gold"/><span className="text-xs font-bold uppercase tracking-wider">Recorde FCDA</span></div>}
            {r.ano_estabelecimento === new Date().getFullYear() && <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-deep">Recorde do ano</span>}<div className="absolute right-3 top-3 rounded-full bg-deep/90 px-3 py-1 text-xs font-bold text-deep-foreground">{r.ano_estabelecimento}</div></div>
          <div className="p-6"><p className="text-xs font-bold uppercase tracking-wider text-primary">{r.prova}</p><h2 className="mt-1 line-clamp-1 text-xl font-bold text-deep">{r.atleta_nome}</h2><div className="mt-4 flex items-baseline justify-between border-t border-border/60 pt-4"><div><span className="block text-xs text-muted-foreground">Tempo / Marca</span><p className="text-2xl font-bold text-deep">{r.marca}</p></div><span className="text-xs font-semibold uppercase text-muted-foreground">{r.piscina === "olimpica" ? "50m" : "25m"} · {r.sexo}</span></div></div>
        </article>)}</div>}
      </div></section>
    </SiteLayout>
  );
}
