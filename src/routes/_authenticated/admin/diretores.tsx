import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { diretoresQuery, type Diretor } from "@/lib/site-queries";
import { saveDiretor, deleteDiretor } from "@/lib/admin.functions";
import { AdminToolbar, AdminTable, RowActions, Modal, Field } from "@/components/admin/ui";
import { inputClass, useInvalidate } from "@/components/admin/utils";
import { ErrorMessage, getFriendlyErrorMessage } from "@/components/admin/error-message";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/diretores")({
  loader: ({ context }) => context.queryClient.ensureQueryData(diretoresQuery),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: AdminDiretores,
});

function AdminDiretores() {
  const diretores = useSuspenseQuery(diretoresQuery).data;
  const [editing, setEditing] = useState<Partial<Diretor> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = useServerFn(saveDiretor);
  const del = useServerFn(deleteDiretor);
  const invalidate = useInvalidate(["diretores"]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setErr(null);
    try {
      await save({
        data: {
          id: editing.id,
          nome: editing.nome || "",
          cargo: editing.cargo || "",
          ordem: Number(editing.ordem ?? 0),
        },
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
        title="Diretoria" 
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Diretoria", to: "/admin/diretores" }
        ]}
        onNew={() => setEditing({ nome: "", cargo: "", ordem: diretores.length + 1 })}
      />

      <AdminTable>
        <thead className="bg-slate-100 dark:bg-slate-800 text-deep dark:text-white text-xs uppercase tracking-wider font-semibold">
          <tr>
            <th className="text-left px-5 py-4 w-16">#</th>
            <th className="text-left px-5 py-4">Cargo</th>
            <th className="text-left px-5 py-4">Nome</th>
            <th className="px-5 py-4" />
          </tr>
        </thead>
        <tbody>
          {diretores.map((d) => (
            <tr key={d.id} className="border-t border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-5 py-4 font-bold text-deep dark:text-white">{d.ordem}</td>
              <td className="px-5 py-4 text-muted-foreground">{d.cargo}</td>
              <td className="px-5 py-4 font-semibold text-deep dark:text-white">{d.nome}</td>
              <td className="px-5 py-4">
                <RowActions
                  onEdit={() => setEditing(d)}
                  onDelete={async () => {
                    await del({ data: { id: d.id } });
                    invalidate();
                  }}
                />
              </td>
            </tr>
          ))}
          {diretores.length === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-16 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                  <p>Nenhum membro da diretoria cadastrado.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </AdminTable>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Editar diretor(a)" : "Novo membro"}
      >
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-[1fr_120px] gap-4">
              <Field label="Cargo">
                <input
                  className={inputClass}
                  value={editing.cargo ?? ""}
                  onChange={(e) => setEditing({ ...editing, cargo: e.target.value })}
                  required
                />
              </Field>
              <Field label="Ordem">
                <input
                  type="number"
                  className={inputClass}
                  value={editing.ordem ?? 0}
                  onChange={(e) => setEditing({ ...editing, ordem: Number(e.target.value) })}
                />
              </Field>
            </div>
            <Field label="Nome">
              <input
                className={inputClass}
                value={editing.nome ?? ""}
                onChange={(e) => setEditing({ ...editing, nome: e.target.value })}
                required
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
