import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { noticiasQuery, type Noticia } from "@/lib/site-queries";
import { saveNoticia, deleteNoticia, uploadImage } from "@/lib/admin.functions";
import { AdminToolbar, AdminTable, RowActions, Modal, Field } from "@/components/admin/ui";
import { inputClass, useInvalidate } from "@/components/admin/utils";
import { ErrorMessage, getFriendlyErrorMessage } from "@/components/admin/error-message";
import { Upload, X, Newspaper } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/noticias")({
  loader: ({ context }) => context.queryClient.ensureQueryData(noticiasQuery(false)),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: AdminNoticias,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function validateAndFixSlug(slug: string): string {
  // Remove caracteres inválidos e normaliza
  const fixed = slug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  
  // Se o resultado estiver vazio, gera um slug aleatório
  if (!fixed) {
    return `noticia-${Date.now()}`;
  }
  
  return fixed;
}

function AdminNoticias() {
  const noticias = useSuspenseQuery(noticiasQuery(false)).data;
  const [editing, setEditing] = useState<Partial<Noticia> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const save = useServerFn(saveNoticia);
  const del = useServerFn(deleteNoticia);
  const upload = useServerFn(uploadImage);
  const invalidate = useInvalidate(["noticias"]);

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
          folder: "noticias",
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
      // Gera ou valida o slug
      let slug = editing.slug || slugify(editing.titulo || "");
      slug = validateAndFixSlug(slug);
      
      await save({
        data: {
          id: editing.id,
          slug: slug,
          categoria: editing.categoria || "Geral",
          data: editing.data || new Date().toISOString().slice(0, 10),
          titulo: editing.titulo || "",
          resumo: editing.resumo || "",
          conteudo: editing.conteudo || null,
          imagem_url: editing.imagem_url || null,
          publicado: editing.publicado ?? true,
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
        title="Notícias"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Notícias", to: "/admin/noticias" }
        ]}
        onNew={() =>
          setEditing({
            slug: "",
            categoria: "Geral",
            data: new Date().toISOString().slice(0, 10),
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
            <th className="text-left px-5 py-4 hidden md:table-cell">Categoria</th>
            <th className="text-left px-5 py-4 hidden md:table-cell">Data</th>
            <th className="text-left px-5 py-4">Status</th>
            <th className="px-5 py-4" />
          </tr>
        </thead>
        <tbody>
          {noticias.map((n) => (
            <tr key={n.id} className="border-t border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-5 py-4">
                <div className="font-semibold text-deep dark:text-white">{n.titulo}</div>
                {n.imagem_url && (
                  <div className="mt-2">
                    <img
                      src={n.imagem_url}
                      alt=""
                      className="h-12 w-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </td>
              <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">
                {n.categoria}
              </td>
              <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">{n.data}</td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex text-xs font-bold uppercase rounded-full px-3 py-1.5 ${
                    n.publicado
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {n.publicado ? "Publicada" : "Rascunho"}
                </span>
              </td>
              <td className="px-5 py-4">
                <RowActions
                  onEdit={() => setEditing(n)}
                  onDelete={async () => {
                    await del({ data: { id: n.id } });
                    invalidate();
                  }}
                />
              </td>
            </tr>
          ))}
          {noticias.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Newspaper className="h-12 w-12 text-muted-foreground/50" />
                  <p>Nenhuma notícia cadastrada.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </AdminTable>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Editar notícia" : "Nova notícia"}
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
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Categoria">
                <input
                  className={inputClass}
                  value={editing.categoria ?? ""}
                  onChange={(e) => setEditing({ ...editing, categoria: e.target.value })}
                  required
                />
              </Field>
              <Field label="Data">
                <input
                  type="date"
                  className={inputClass}
                  value={editing.data ?? ""}
                  onChange={(e) => setEditing({ ...editing, data: e.target.value })}
                  required
                />
              </Field>
            </div>
            <Field label="Slug (URL)">
              <input
                className={inputClass}
                placeholder="gerado-automaticamente"
                value={editing.slug ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Valida em tempo real e previne caracteres inválidos
                  const validValue = value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "-")
                    .replace(/-+/g, "-")
                    .slice(0, 120);
                  setEditing({ ...editing, slug: validValue });
                }}
                maxLength={120}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {editing.slug?.length || 0}/120 caracteres • Apenas letras, números e hífens
              </p>
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
            <Field label="Conteúdo (opcional)">
              <textarea
                className={inputClass}
                rows={6}
                value={editing.conteudo ?? ""}
                onChange={(e) => setEditing({ ...editing, conteudo: e.target.value })}
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
              <span className="font-semibold text-deep">Publicada</span>
            </label>

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
