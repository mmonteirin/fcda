import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminToolbar } from "@/components/admin/ui";

type Ranking = {
  id: string;
  nome: string;
  ano: number;
  descricao: string | null;
  publicado: boolean;
};
type Evento = { id: string; nome: string; data_texto: string };
const initial = {
  nome: "",
  ano: new Date().getFullYear(),
  descricao: "",
  publicado: false,
  eventos: [] as string[],
};

export const Route = createFileRoute("/_authenticated/admin/rankings")({
  component: AdminRankings,
});

function AdminRankings() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [form, setForm] = useState(initial);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const db = supabase as unknown as {
      from: (table: string) => {
        select: (columns: string) => {
          order: (
            column: string,
            options: { ascending: boolean },
          ) => {
            then: <T>(resolve: (value: T) => unknown) => Promise<T>;
          };
        };
      };
    };
    const [{ data: rankingData }, { data: eventoData }] = await Promise.all([
      db
        .from("rankings")
        .select("*")
        .order("ano", { ascending: false })
        .then((data) => data),
      db
        .from("eventos")
        .select("id,nome,data_texto")
        .order("data_inicio", { ascending: false })
        .then((data) => data),
    ]);
    setRankings((rankingData as unknown[]) ?? []);
    setEventos(eventoData ?? []);
  };
  useEffect(() => {
    load();
  }, []);
  const toggle = (id: string) =>
    setForm((f) => ({
      ...f,
      eventos: f.eventos.includes(id)
        ? f.eventos.filter((x: string) => x !== id)
        : [...f.eventos, id],
    }));
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const db = supabase as unknown as {
      from: (table: string) => {
        insert: (data: Record<string, unknown>) => {
          then: <T>(resolve: (value: T) => unknown) => Promise<T>;
        };
        update: (data: Record<string, unknown>) => {
          eq: (
            column: string,
            value: unknown,
          ) => {
            then: <T>(resolve: (value: T) => unknown) => Promise<T>;
          };
        };
      };
    };
    const { data, error } = await db
      .from("rankings")
      .insert({
        nome: form.nome,
        ano: form.ano,
        descricao: form.descricao || null,
        publicado: form.publicado,
      })
      .select("id")
      .single();
    if (!error && data)
      await db
        .from("ranking_competicoes")
        .insert(form.eventos.map((evento_id) => ({ ranking_id: data.id, evento_id })));
    if (!error) {
      setOpen(false);
      setForm(initial);
      load();
    }
    setBusy(false);
  };
  return (
    <div>
      <AdminToolbar
        title="Rankings"
        onNew={() => {
          setForm(initial);
          setOpen(true);
        }}
      />
      <p className="mb-6 text-sm text-muted-foreground">
        Crie rankings por temporada e escolha quais competições serão consideradas.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {rankings.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-bold text-primary">TEMPORADA {r.ano}</p>
            <h2 className="mt-1 text-lg font-bold text-deep">{r.nome}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {r.publicado ? "Publicado" : "Rascunho"}
            </p>
          </div>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 overflow-auto bg-deep/40 p-6">
          <form onSubmit={save} className="mx-auto max-w-2xl space-y-4 rounded-2xl bg-card p-6">
            <h2 className="text-xl font-bold text-deep">Novo Ranking</h2>
            <label className="block text-sm font-semibold">
              Nome
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Ano
              <input
                required
                type="number"
                value={form.ano}
                onChange={(e) => setForm({ ...form, ano: Number(e.target.value) })}
                className="mt-1 w-full rounded border p-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Descrição
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="mt-1 w-full rounded border p-2"
              />
            </label>
            <fieldset>
              <legend className="text-sm font-bold">Competições válidas</legend>
              <div className="mt-2 max-h-48 space-y-2 overflow-auto rounded border p-3">
                {eventos.map((e) => (
                  <label key={e.id} className="flex gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.eventos.includes(e.id)}
                      onChange={() => toggle(e.id)}
                    />
                    {e.data_texto} — {e.nome}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.publicado}
                onChange={(e) => setForm({ ...form, publicado: e.target.checked })}
              />
              Publicar ranking
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button disabled={busy} className="rounded bg-deep px-4 py-2 font-bold text-white">
                {busy ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
