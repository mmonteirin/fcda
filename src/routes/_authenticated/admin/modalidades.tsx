import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { modalidadesQuery, categoriasModalidadesQuery, type Modalidade } from "@/lib/site-queries";
import { saveModalidade, deleteModalidade, uploadImage } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AdminToolbar, AdminTable, RowActions, Modal, Field } from "@/components/admin/ui";
import { inputClass, useInvalidate } from "@/components/admin/utils";
import { Upload, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/modalidades")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(modalidadesQuery),
      context.queryClient.ensureQueryData(categoriasModalidadesQuery),
    ]),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: AdminModalidades,
});

function AdminModalidades() {
  const modalidades = useSuspenseQuery(modalidadesQuery).data;
  const categorias = useSuspenseQuery(categoriasModalidadesQuery).data;
  const [editing, setEditing] = useState<Partial<Modalidade> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const upload = useServerFn(uploadImage);
  const invalidate = useInvalidate(["modalidades"]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    setUploading(true);
    setErr(null);
    try {
      // Convert File to base64 for serialization
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await upload({
        data: {
          fileName: file.name,
          fileType: file.type,
          fileData,
          folder: "modalidades",
        },
      });
      setEditing({ ...editing, img_url: result.url });
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
      await saveModalidade(supabase, user!.id, {
        id: editing.id,
        slug: editing.slug || "",
        nome: editing.nome || "",
        descricao: editing.descricao || "",
        img_url: editing.img_url || null,
        ordem: Number(editing.ordem ?? 0),
        categoria_id: editing.categoria_id || null,
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
        title="Modalidades"
        onNew={() =>
          setEditing({ slug: "", nome: "", descricao: "", ordem: modalidades.length + 1 })
        }
      />

      <AdminTable>
        <thead className="bg-secondary/60 text-deep text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left px-4 py-3 w-16">#</th>
            <th className="text-left px-4 py-3">Nome</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">Slug</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {modalidades.map((m) => (
            <tr key={m.id} className="border-t border-border">
              <td className="px-4 py-3 font-bold text-deep">{m.ordem}</td>
              <td className="px-4 py-3">
                <div className="font-semibold text-deep">{m.nome}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{m.descricao}</div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground font-mono text-xs">
                {m.slug}
              </td>
              <td className="px-4 py-3">
                <RowActions
                  onEdit={() => setEditing(m)}
                  onDelete={async () => {
                    await deleteModalidade(supabase, user!.id, m.id);
                    invalidate();
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Editar modalidade" : "Nova modalidade"}
      >
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-[1fr_120px] gap-4">
              <Field label="Nome">
                <input
                  className={inputClass}
                  value={editing.nome ?? ""}
                  onChange={(e) => setEditing({ ...editing, nome: e.target.value })}
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
            <Field label="Slug (URL)">
              <input
                className={inputClass}
                value={editing.slug ?? ""}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                required
                placeholder="natacao"
              />
            </Field>
            <Field label="Descrição">
              <textarea
                className={inputClass}
                rows={4}
                value={editing.descricao ?? ""}
                onChange={(e) => setEditing({ ...editing, descricao: e.target.value })}
                required
              />
            </Field>
            <Field label="Categoria (opcional)">
              <select
                className={inputClass}
                value={editing.categoria_id ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    categoria_id: e.target.value || null,
                  })
                }
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Imagem">
              <div className="space-y-3">
                {editing.img_url && (
                  <div className="relative">
                    <img
                      src={editing.img_url}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, img_url: null })}
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
                    value={editing.img_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, img_url: e.target.value })}
                    placeholder="Ou cole URL..."
                  />
                </div>
              </div>
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
