import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { asDynamicSupabase } from "@/lib/supabase-helpers";
import { Trophy, Timer, Search, Filter } from "lucide-react";

type Recorde = {
  id: string;
  piscina: string;
  sexo: string;
  prova: string;
  atleta_nome: string;
  foto_url: string | null;
  marca: string;
  ano_estabelecimento: number;
};

export const Route = createFileRoute("/recordes")({
  head: () => ({
    meta: [
      { title: "Recordes Cearenses — FCDA" },
      {
        name: "description",
        content:
          "Quadro oficial de recordes cearenses de natação em piscina olímpica e semiolímpica da FCDA.",
      },
    ],
  }),
  component: Recordes,
});

function Recordes() {
  const [recordes, setRecordes] = useState<Recorde[]>([]);
  const [piscina, setPiscina] = useState("olimpica");
  const [sexo, setSexo] = useState("masculino");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    asDynamicSupabase(supabase)
      .from("recordes")
      .select("*")
      .eq("publicado", true)
      .order("prova")
      .then(({ data }: { data: Recorde[] | null }) => {
        setRecordes(data ?? []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const lista = useMemo(() => {
    return recordes.filter((r) => {
      const matchPiscina = !piscina || r.piscina === piscina;
      const matchSexo = !sexo || r.sexo === sexo;
      const matchBusca =
        !busca.trim() ||
        r.prova.toLowerCase().includes(busca.toLowerCase()) ||
        r.atleta_nome.toLowerCase().includes(busca.toLowerCase());
      return matchPiscina && matchSexo && matchBusca;
    });
  }, [recordes, piscina, sexo, busca]);

  return (
    <SiteLayout>
      <section className="py-20 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Natação cearense</p>
          <h1 className="mt-3 text-5xl font-bold">Recordes FCDA</h1>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl">
            Melhores marcas homologadas na história dos desportos aquáticos do Ceará.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-deep">Filtros:</span>
              </div>
              <select
                value={piscina}
                onChange={(e) => setPiscina(e.target.value)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-deep shadow-sm"
              >
                <option value="olimpica">Piscina Olímpica (50m)</option>
                <option value="semiolimpica">Piscina Semiolímpica (25m)</option>
              </select>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-deep shadow-sm"
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="misto">Misto</option>
              </select>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar prova ou atleta..."
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-muted-foreground">Carregando recordes...</p>
              </div>
            </div>
          ) : lista.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border p-8">
              <Timer className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-semibold text-deep">Nenhum recorde encontrado para este filtro.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente alterar a modalidade da piscina ou o gênero selecionado.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lista.map((r) => (
                <article
                  key={r.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-card hover:shadow-elegant transition-all hover:-translate-y-1"
                >
                  <div className="flex aspect-[16/10] items-center justify-center bg-secondary/50 relative overflow-hidden">
                    {r.foto_url ? (
                      <img
                        src={r.foto_url}
                        alt={r.atleta_nome}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Trophy className="h-10 w-10 text-gold" />
                        <span className="text-xs uppercase tracking-wider font-bold">FCDA Recorde</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 rounded-full bg-deep/80 backdrop-blur px-3 py-1 text-xs font-bold text-deep-foreground">
                      {r.ano_estabelecimento}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">{r.prova}</p>
                    <h2 className="mt-1 text-xl font-bold text-deep line-clamp-1">{r.atleta_nome}</h2>
                    <div className="mt-4 flex items-baseline justify-between pt-4 border-t border-border/60">
                      <div>
                        <span className="text-xs text-muted-foreground block">Tempo / Marca</span>
                        <p className="text-2xl font-bold text-deep">{r.marca}</p>
                      </div>
                      <span className="text-xs uppercase font-semibold text-muted-foreground">
                        {r.piscina === "olimpica" ? "50m" : "25m"} · {r.sexo}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
