import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { asDynamicSupabase } from "@/lib/supabase-helpers";
import { Users, Building2 } from "lucide-react";

type Atleta = {
  id: string;
  registro: string;
  nome: string;
  clube: string;
  data_nascimento: string | null;
  vinculo: "confederado" | "vinculado";
  status: string;
};
export const Route = createFileRoute("/transparencia/atletas")({ component: AtletasTransparencia });
function AtletasTransparencia() {
  const [items, setItems] = useState<Atleta[]>([]);
  const [tipo, setTipo] = useState("todos");
  const [busca, setBusca] = useState("");
  useEffect(() => {
    void (async () => {
      const { data } = await asDynamicSupabase(supabase)
        .from("atletas_transparencia")
        .select("*")
        .order("nome");
      setItems(data ?? []);
    })();
  }, []);
  const clubes = useMemo(
    () =>
      Object.entries(
        items.reduce<Record<string, number>>(
          (a, x) => ({ ...a, [x.clube]: (a[x.clube] ?? 0) + 1 }),
          {},
        ),
      ).sort((a, b) => b[1] - a[1]),
    [items],
  );
  const lista = items.filter(
    (x) =>
      (tipo === "todos" || x.vinculo === tipo) &&
      `${x.nome} ${x.clube}`.toLowerCase().includes(busca.toLowerCase()),
  );
  return (
    <SiteLayout>
      <section className="bg-hero py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">
            Portal da Transparência
          </p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Atletas da FCDA</h1>
          <p className="mt-4 text-primary-foreground/80">
            Relação de atletas confederados e vinculados à Federação Cearense de Desportos
            Aquáticos.
          </p>
        </div>
      </section>
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-12">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <Users className="text-primary" />
            <strong className="mt-3 block text-3xl text-deep">{items.length}</strong>
            <span className="text-sm text-muted-foreground">Atletas ativos</span>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <strong className="block text-3xl text-deep">
              {items.filter((x) => x.vinculo === "confederado").length}
            </strong>
            <span className="text-sm text-muted-foreground">Confederados</span>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <strong className="block text-3xl text-deep">
              {items.filter((x) => x.vinculo === "vinculado").length}
            </strong>
            <span className="text-sm text-muted-foreground">Vinculados</span>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-deep">Dashboard por clube</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clubes.map(([clube, total]) => (
              <div
                key={clube}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <Building2 className="text-primary" />
                <span className="flex-1 font-semibold text-deep">{clube}</span>
                <strong>{total}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar atleta ou clube"
              className="flex-1 rounded-lg border border-border px-3 py-2"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="rounded-lg border border-border px-3 py-2"
            >
              <option value="todos">Todos os vínculos</option>
              <option value="confederado">Confederados</option>
              <option value="vinculado">Vinculados</option>
            </select>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="p-3">Atleta</th>
                  <th>Clube</th>
                  <th>Vínculo</th>
                  <th>Nascimento</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((x) => (
                  <tr key={x.id} className="border-b">
                    <td className="p-3 font-semibold text-deep">{x.nome}</td>
                    <td>{x.clube}</td>
                    <td className="capitalize">{x.vinculo}</td>
                    <td>
                      {x.data_nascimento
                        ? new Date(`${x.data_nascimento}T00:00:00`).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
