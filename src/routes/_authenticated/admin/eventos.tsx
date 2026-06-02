import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { eventosQuery, type Evento } from "@/lib/site-queries";
import { saveEvento, deleteEvento } from "@/lib/admin.functions";
import { AdminToolbar, AdminTable, RowActions, Modal, Field } from "@/components/admin/ui";
import { inputClass, useInvalidate } from "@/components/admin/utils";
import { Filter } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/eventos")({
  loader: ({ context }) => context.queryClient.ensureQueryData(eventosQuery()),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: AdminEventos,
});

function AdminEventos() {
  const [anoFilter, setAnoFilter] = useState<number | undefined>(undefined);
  const eventos = useSuspenseQuery(eventosQuery(anoFilter)).data;
  const [editing, setEditing] = useState<Partial<Evento> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = useServerFn(saveEvento);
  const del = useServerFn(deleteEvento);
  const invalidate = useInvalidate(["eventos"]);

  // Get unique years from events
  const anos = Array.from(
    new Set(eventos.map((e) => e.ano).filter((a): a is number => a !== null)),
  ).sort((a, b) => b - a);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setErr(null);
    try {
      await save({
        data: {
          id: editing.id,
          data_texto: editing.data_texto || "",
          data_inicio: editing.data_inicio || null,
          nome: editing.nome || "",
          local: editing.local || "",
          modalidade: editing.modalidade || "",
          ano: editing.ano ?? null,
        },
      });
      invalidate();
      setEditing(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminToolbar
        title="Eventos"
        onNew={() =>
          setEditing({
            data_texto: "",
            data_inicio: new Date().toISOString().slice(0, 10),
            nome: "",
            local: "",
            modalidade: "Natação",
            ano: new Date().getFullYear(),
          })
        }
      />

      {anos.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <select
            value={anoFilter ?? ""}
            onChange={(e) => setAnoFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-deep"
          >
            <option value="">Todas as temporadas</option>
            {anos.map((a) => (
              <option key={a} value={a}>
                Temporada {a}
              </option>
            ))}
          </select>
        </div>
      )}

      <AdminTable>
        <thead className="bg-secondary/60 text-deep text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left px-4 py-3">Data</th>
            <th className="text-left px-4 py-3">Nome</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">Local</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">Modalidade</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {eventos.map((e) => (
            <tr key={e.id} className="border-t border-border">
              <td className="px-4 py-3 font-bold text-deep">{e.data_texto}</td>
              <td className="px-4 py-3">{e.nome}</td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{e.local}</td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                {e.modalidade}
              </td>
              <td className="px-4 py-3">
                <RowActions
                  onEdit={() => setEditing(e)}
                  onDelete={async () => {
                    await del({ data: { id: e.id } });
                    invalidate();
                  }}
                />
              </td>
            </tr>
          ))}
          {eventos.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                Nenhum evento cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </AdminTable>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Editar evento" : "Novo evento"}
      >
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Nome do evento">
              <input
                className={inputClass}
                value={editing.nome ?? ""}
                onChange={(e) => setEditing({ ...editing, nome: e.target.value })}
                required
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Data (exibição, ex: 12—14 Jun)">
                <input
                  className={inputClass}
                  value={editing.data_texto ?? ""}
                  onChange={(e) => setEditing({ ...editing, data_texto: e.target.value })}
                  required
                />
              </Field>
              <Field label="Data de início (ordenação)">
                <input
                  type="date"
                  className={inputClass}
                  value={editing.data_inicio ?? ""}
                  onChange={(e) => setEditing({ ...editing, data_inicio: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Local">
              <input
                className={inputClass}
                value={editing.local ?? ""}
                onChange={(e) => setEditing({ ...editing, local: e.target.value })}
                required
              />
            </Field>
            <Field label="Modalidade">
              <input
                className={inputClass}
                value={editing.modalidade ?? ""}
                onChange={(e) => setEditing({ ...editing, modalidade: e.target.value })}
                required
              />
            </Field>
            <Field label="Ano (temporada)">
              <input
                type="number"
                className={inputClass}
                value={editing.ano ?? ""}
                onChange={(e) => setEditing({ ...editing, ano: Number(e.target.value) })}
                placeholder="2024"
              />
            </Field>

            {err && <div className="text-sm text-destructive">{err}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                disabled={busy}
                className="rounded-lg bg-deep text-deep-foreground px-4 py-2 text-sm font-bold disabled:opacity-60"
              >
                {busy ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
