import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { cursosQuery, type Curso } from "@/lib/site-queries";
import { saveCurso, deleteCurso, uploadImage } from "@/lib/admin.functions";
import { AdminToolbar, AdminTable, RowActions, Modal, Field } from "@/components/admin/ui";
import { inputClass, useInvalidate } from "@/components/admin/utils";
import { Upload, X, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/cursos")({
  loader: ({ context }) => context.queryClient.ensureQueryData(cursosQuery(false)),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: AdminCursos,
});

function AdminCursos() {
  const cursos = useSuspenseQuery(cursosQuery(false)).data;
  const [editing, setEditing] = useState<Partial<Curso> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const invalidate = useInvalidate(["cursos"]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploading(true);
    setErr(null);
    try {
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await uploadImage({
        data: {
          fileName: file.name,
          fileType: file.type,
          fileData,
          folder: "cursos",
        },
      });
      setEditing({ ...editing, imagem_url: result.url });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setErr(null);
    try {
      const { supabase, userId } = await import("@/lib/admin.functions").then(m => m.useAdminContext());
      await saveCurso(supabase, userId, {
        id: editing.id,
        titulo: editing.titulo || "",
        resumo: editing.resumo || "",
        descricao: editing.descricao || null,
        data_inicio: editing.data_inicio || null,
        data_fim: editing.data_fim || null,
        local: editing.local || null,
        carga_horaria: editing.carga_horaria || null,
        imagem_url: editing.imagem_url || null,
        link_inscricao: editing.link_inscricao || null,
        publicado: editing.publicado ?? true,
      });
      invalidate();
      setEditing(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { supabase, userId } = await import("@/lib/admin.functions").then(m => m.useAdminContext());
      await deleteCurso(supabase, userId, id);
      invalidate();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  return (
    <div className="space-y-6">
      <AdminToolbar 
        title="Cursos" 
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Cursos", to: "/admin/cursos" }
        ]}
        onNew={() =>
          setEditing({
            titulo: "",
            resumo: "",
            publicado: true,
          })
        }
      />

      <AdminTable>
        <thead className="bg-slate-100 dark:bg-slate-800 text-deep dark:text-white text-xs uppercase tracking-wider font-semibold">
          <tr>
            <th className="text-left px-5 py-4">Título</th>
            <th className="text-left px-5 py-4 hidden md:table-cell">Data</th>
            <th className="text-left px-5 py-4 hidden md:table-cell">Local</th>
            <th className="text-left px-5 py-4">Status</th>
            <th className="px-5 py-4" />
          </tr>
        </thead>
        <tbody>
          {cursos.map((c) => (
            <tr key={c.id} className="border-t border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-5 py-4">
                <div className="font-semibold text-deep dark:text-white">{c.titulo}</div>
                {c.imagem_url && (
                  <div className="mt-2">
                    <img
                      src={c.imagem_url}
                      alt=""
                      className="h-12 w-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </td>
              <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">
                {c.data_inicio || "-"}
              </td>
              <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">
                {c.local || "-"}
              </td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex text-xs font-bold uppercase rounded-full px-3 py-1.5 ${
                    c.publicado
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {c.publicado ? "Publicado" : "Rascunho"}
                </span>
              </td>
              <td className="px-5 py-4">
                <RowActions
                  onEdit={() => setEditing(c)}
                  onDelete={() => handleDelete(c.id)}
                />
              </td>
            </tr>
          ))}
          {cursos.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
                  <p>Nenhum curso cadastrado.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </AdminTable>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Editar curso" : "Novo curso"}
      >
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Título">
              <input
                className={inputClass}
                value={editing.titulo ?? ""}
                onChange={(e) => setEditing({ ...editing, titulo: e.target.value })}
                required
              />
            </Field>
            <Field label="Resumo">
              <textarea
                className={inputClass}
                rows={3}
                value={editing.resumo ?? ""}
                onChange={(e) => setEditing({ ...editing, resumo: e.target.value })}
                required
              />
            </Field>
            <Field label="Descrição (opcional)">
              <textarea
                className={inputClass}
                rows={6}
                value={editing.descricao ?? ""}
                onChange={(e) => setEditing({ ...editing, descricao: e.target.value })}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
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
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Local">
                <input
                  className={inputClass}
                  value={editing.local ?? ""}
                  onChange={(e) => setEditing({ ...editing, local: e.target.value })}
                />
              </Field>
              <Field label="Carga horária">
                <input
                  className={inputClass}
                  value={editing.carga_horaria ?? ""}
                  onChange={(e) => setEditing({ ...editing, carga_horaria: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Link de inscrição">
              <input
                type="url"
                className={inputClass}
                value={editing.link_inscricao ?? ""}
                onChange={(e) => setEditing({ ...editing, link_inscricao: e.target.value })}
                placeholder="https://..."
              />
            </Field>
            <Field label="Imagem">
              <div className="space-y-3">
                {editing.imagem_url && (
                  <div className="relative">
                    <img
                      src={editing.imagem_url}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, imagem_url: null })}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg px-4 py-3 cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {uploading ? "Enviando..." : "Fazer upload"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <input
                    className={`${inputClass} flex-1`}
                    value={editing.imagem_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, imagem_url: e.target.value })}
                    placeholder="Ou cole URL..."
                  />
                </div>
              </div>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.publicado ?? true}
                onChange={(e) => setEditing({ ...editing, publicado: e.target.checked })}
              />
              <span className="font-semibold text-deep">Publicado</span>
            </label>

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
