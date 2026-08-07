import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

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
export const Route = createFileRoute("/recordes")({ component: Recordes });

function Recordes() {
  const [recordes, setRecordes] = useState<Recorde[]>([]);
  const [piscina, setPiscina] = useState("olimpica");
  const [sexo, setSexo] = useState("masculino");
  useEffect(() => {
    (
      supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            eq: (
              column: string,
              value: unknown,
            ) => {
              order: (column: string) => {
                then: <T>(resolve: (value: T) => unknown) => Promise<T>;
              };
            };
          };
        };
      }
    )
      .from("recordes")
      .select("*")
      .eq("publicado", true)
      .order("prova")
      .then(({ data }: { data: unknown }) => setRecordes((data as Recorde[]) ?? []));
  }, []);
  const lista = useMemo(
    () => recordes.filter((r) => r.piscina === piscina && r.sexo === sexo),
    [recordes, piscina, sexo],
  );
  return (
    <SiteLayout>
      <section className="py-20 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Natação cearense</p>
          <h1 className="mt-3 text-5xl font-bold">Recordes FCDA</h1>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap gap-3">
            <select
              value={piscina}
              onChange={(e) => setPiscina(e.target.value)}
              className="rounded-lg border border-border px-3 py-2"
            >
              <option value="olimpica">Piscina Olímpica</option>
              <option value="semiolimpica">Piscina Semiolímpica</option>
            </select>
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              className="rounded-lg border border-border px-3 py-2"
            >
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="misto">Misto</option>
            </select>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((r) => (
              <article
                key={r.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
              >
                <div className="flex aspect-[3/4] items-center justify-center bg-secondary">
                  {r.foto_url ? (
                    <img
                      src={r.foto_url}
                      alt={r.atleta_nome}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🏊</span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-sm font-bold text-primary">{r.prova}</p>
                  <h2 className="mt-2 text-xl font-bold text-deep">{r.atleta_nome}</h2>
                  <p className="mt-3 text-3xl font-bold text-deep">{r.marca}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Estabelecido em {r.ano_estabelecimento}
                  </p>
                </div>
              </article>
            ))}
          </div>
          {lista.length === 0 && (
            <p className="mt-10 text-muted-foreground">
              Nenhum recorde publicado para este filtro.
            </p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
