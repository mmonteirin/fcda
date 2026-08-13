import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { eventosQuery, type Evento } from "@/lib/site-queries";
import { saveEvento, deleteEvento } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AdminToolbar, AdminTable, RowActions, Modal, Field } from "@/components/admin/ui";
import { inputClass, useInvalidate } from "@/components/admin/utils";
import { ErrorMessage, getFriendlyErrorMessage } from "@/components/admin/error-message";
import { Filter, Calendar } from "lucide-react";

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
  const { user } = useAuth();
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
      await saveEvento(supabase, user!.id, {
        id: editing.id,
        data_texto: editing.data_texto || "",
        data_inicio: editing.data_inicio || null,
        data_fim: editing.data_fim || null,
        nome: editing.nome || "",
        local: editing.local || "",
        modalidade: editing.modalidade || "",
        ano: editing.ano ?? null,
        descricao: editing.descricao || null,
        status: editing.status || null,
        link_inscricao: editing.link_inscricao || null,
        imagem_url: editing.imagem_url || null,
      });
      invalidate();
      setEditing(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(getFriendlyErrorMessage(e));
      } else {
        setErr("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminToolbar 
        title="Competições" 
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Competições", to: "/admin/eventos" }
        ]}
        onNew={() =>
          setEditing({
            data_texto: "",
            data_inicio: new Date().toISOString().slice(0, 10),
            data_fim: null,
            nome: "",
            local: "",
            modalidade: "Natação",
            ano: new Date().getFullYear(),
            descricao: null,
            status: "planejado",
            link_inscricao: null,
            imagem_url: null,
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
        <thead className="bg-slate-100 dark:bg-slate-800 text-deep dark:text-white text-xs uppercase tracking-wider font-semibold">
          <tr>
            <th className="text-left px-5 py-4">Data</th>
            <th className="text-left px-5 py-4">Nome</th>
            <th className="text-left px-5 py-4 hidden md:table-cell">Local</th>
            <th className="text-left px-5 py-4 hidden md:table-cell">Modalidade</th>
            <th className="text-left px-5 py-4">Status</th>
            <th className="px-5 py-4" />
          </tr>
        </thead>
        <tbody>
          {eventos.map((e) => (
            <tr key={e.id} className="border-t border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-5 py-4 font-bold text-deep dark:text-white">{e.data_texto}</td>
              <td className="px-5 py-4">
                <div className="font-semibold text-deep dark:text-white">{e.nome}</div>
                {e.imagem_url && (
                  <div className="mt-2">
                    <img
                      src={e.imagem_url}
                      alt=""
                      className="h-12 w-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </td>
              <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">{e.local}</td>
              <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">
                {e.modalidade}
              </td>
              <td className="px-5 py-4">
                {e.status && (
                  <span className={`inline-flex text-xs font-bold uppercase rounded-full px-3 py-1.5 ${
                    e.status === 'planejado'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      : e.status === 'confirmado'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : e.status === 'inscricoes_abertas'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : e.status === 'inscricoes_fechadas'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : e.status === 'em_andamento'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                      : e.status === 'finalizado'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {e.status.replace(/_/g, ' ')}
                  </span>
                )}
              </td>
              <td className="px-5 py-4">
                <RowActions
                  onEdit={() => setEditing(e)}
                  onDelete={async () => {
                    await deleteEvento(supabase, user!.id, e.id);
                    invalidate();
                  }}
                />
              </td>
            </tr>
          ))}
          {eventos.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="h-12 w-12 text-muted-foreground/50" />
                  <p>Nenhum evento cadastrado.</p>
                </div>
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
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Data (exibição, ex: 12—14 Jun)">
                <input
                  className={inputClass}
                  value={editing.data_texto ?? ""}
                  onChange={(e) => setEditing({ ...editing, data_texto: e.target.value })}
                  required
                />
              </Field>
              <Field label="Data de início">
                <input
                  type="date"
                  className={inputClass}
                  value={editing.data_inicio ?? ""}
                  onChange={(e) => setEditing({ ...editing, data_inicio: e.target.value })}
                />
              </Field>
              <Field label="Data de fim">
                <input
                  type="date"
                  className={inputClass}
                  value={editing.data_fim ?? ""}
                  onChange={(e) => setEditing({ ...editing, data_fim: e.target.value })}
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
            <div className="grid sm:grid-cols-2 gap-4">
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
            </div>
            <Field label="Status">
              <select
                className={inputClass}
                value={editing.status ?? ""}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              >
                <option value="planejado">Planejado</option>
                <option value="confirmado">Confirmado</option>
                <option value="inscricoes_abertas">Inscrições Abertas</option>
                <option value="inscricoes_fechadas">Inscrições Fechadas</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </Field>
            <Field label="Descrição">
              <textarea
                className={inputClass}
                value={editing.descricao ?? ""}
                onChange={(e) => setEditing({ ...editing, descricao: e.target.value })}
                rows={3}
                placeholder="Descrição detalhada do evento..."
              />
            </Field>
            <Field label="Link de inscrição">
              <input
                type="url"
                className={inputClass}
                value={editing.link_inscricao ?? ""}
                onChange={(e) => setEditing({ ...editing, link_inscricao: e.target.value })}
                placeholder="https://..."
              />
            </Field>
            <Field label="URL da imagem">
              <input
                type="url"
                className={inputClass}
                value={editing.imagem_url ?? ""}
                onChange={(e) => setEditing({ ...editing, imagem_url: e.target.value })}
                placeholder="https://..."
              />
            </Field>

            <ErrorMessage error={err} />
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
