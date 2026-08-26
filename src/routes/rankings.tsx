import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { asDynamicSupabase } from "@/lib/supabase-helpers";
import { Trophy, ArrowRight, Award, Users } from "lucide-react";

type Classificacao = {
  id: string;
  atleta_nome: string;
  ano_nascimento: number;
  categoria: string;
  clube: string;
  pontuacao_final: number;
};
type Ranking = {
  id: string;
  nome: string;
  ano: number;
  ranking_classificacoes: Classificacao[];
};

export const Route = createFileRoute("/rankings")({
  head: () => ({
    meta: [
      { title: "Rankings Oficiais — FCDA" },
      {
        name: "description",
        content:
          "Rankings oficiais e pontuações consolidadas das temporadas da Federação Cearense de Desportos Aquáticos.",
      },
    ],
  }),
  component: Rankings,
});

function Rankings() {
  const [dados, setDados] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    asDynamicSupabase(supabase)
      .from("rankings")
      .select("*,ranking_classificacoes(*)")
      .eq("publicado", true)
      .order("ano", { ascending: false })
      .then(({ data }: { data: Ranking[] | null }) => {
        setDados(data ?? []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <SiteLayout>
      <section className="py-20 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Competições</p>
          <h1 className="mt-3 text-5xl font-bold">Rankings FCDA</h1>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl">
            Histórico e consolidação de pontuação dos atletas e clubes nas temporadas oficiais.
          </p>
        </div>
      </section>

      {/* Destaque para temporada atual */}
      <section className="py-8 bg-secondary/30 border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl bg-gradient-to-r from-primary/15 to-gold/15 border border-primary/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-gold shrink-0" />
              <div>
                <h3 className="font-bold text-deep text-lg">Ranking Temporada 2026 em tempo real</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe a pontuação parcial da temporada atual por classes e categorias.
                </p>
              </div>
            </div>
            <Link
              to="/ranking-temporada-2026"
              className="inline-flex items-center gap-2 rounded-xl bg-deep px-5 py-2.5 text-sm font-bold text-deep-foreground hover:bg-primary transition-colors shrink-0"
            >
              Ver Temporada 2026 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-muted-foreground">Carregando rankings...</p>
              </div>
            </div>
          ) : dados.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border p-8">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-semibold text-deep">Nenhum ranking consolidado disponível no momento.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Consulte o Ranking da Temporada 2026 no botão acima.
              </p>
            </div>
          ) : (
            dados.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-deep">
                    {r.nome} · Temporada {r.ano}
                  </h2>
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {r.ranking_classificacoes?.length ?? 0} atletas
                  </span>
                </div>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="p-3">Atleta</th>
                        <th>Nascimento</th>
                        <th>Categoria</th>
                        <th>Clube</th>
                        <th className="text-right p-3">Pontuação Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(r.ranking_classificacoes ?? [])
                        .sort(
                          (a, b) => Number(b.pontuacao_final) - Number(a.pontuacao_final),
                        )
                        .map((a, idx) => (
                          <tr key={a.id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
                            <td className="p-3 font-semibold text-deep">
                              <span className="mr-2 text-xs text-muted-foreground">{idx + 1}º</span>
                              {a.atleta_nome}
                            </td>
                            <td>{a.ano_nascimento || "—"}</td>
                            <td>{a.categoria || "—"}</td>
                            <td>{a.clube || "—"}</td>
                            <td className="text-right p-3 font-bold text-primary">{a.pontuacao_final}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
