import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/rankings")({ component: Rankings });
function Rankings() {
  const [dados, setDados] = useState<any[]>([]);
  useEffect(() => {
    (supabase as any)
      .from("rankings")
      .select("*,ranking_classificacoes(*)")
      .eq("publicado", true)
      .order("ano", { ascending: false })
      .then(({ data }: any) => setDados(data ?? []));
  }, []);
  return (
    <SiteLayout>
      <section className="py-20 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Competições</p>
          <h1 className="mt-3 text-5xl font-bold">Rankings FCDA</h1>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 space-y-8">
          {dados.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold text-deep">
                {r.nome} · {r.ano}
              </h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th>Atleta</th>
                      <th>Nascimento</th>
                      <th>Categoria</th>
                      <th>Clube</th>
                      <th className="text-right">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(r.ranking_classificacoes ?? [])
                      .sort((a: any, b: any) => b.pontuacao_final - a.pontuacao_final)
                      .map((a: any) => (
                        <tr key={a.id} className="border-b">
                          <td className="py-3 font-semibold">{a.atleta_nome}</td>
                          <td>{a.ano_nascimento}</td>
                          <td>{a.categoria}</td>
                          <td>{a.clube}</td>
                          <td className="text-right font-bold">{a.pontuacao_final}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
          {!dados.length && <p className="text-muted-foreground">Nenhum ranking publicado.</p>}
        </div>
      </section>
    </SiteLayout>
  );
}
