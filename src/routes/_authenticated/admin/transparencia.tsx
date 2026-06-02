import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { transparenciaQuery, type TransparenciaDocumento } from "@/lib/site-queries";
import {
  saveTransparencia,
  deleteTransparencia,
  uploadTransparenciaPdf,
} from "@/lib/admin.functions";
import { AdminToolbar, AdminTable, RowActions, Modal, Field } from "@/components/admin/ui";
import { inputClass, useInvalidate } from "@/components/admin/utils";
import { Upload, X, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/transparencia")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(transparenciaQuery(false)),
  errorComponent: ({ error }) => (
    <div className="text-destructive">Erro: {error.message}</div>
  ),
  component: AdminTransparencia,
});

function AdminTransparencia() {
  const documentos = useSuspenseQuery(transparenciaQuery(false)).data;
  const [editing, setEditing] = useState<Partial<TransparenciaDocumento> | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const save = useServerFn(saveTransparencia);
  const del = useServerFn(deleteTransparencia);
  const upload = useServerFn(uploadTransparenciaPdf);
  const invalidate = useInvalidate(["transparencia"]);

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
        },
      });
      setEditing({
        ...editing,
        arquivo_url: result.url,
        arquivo_nome: file.name,
      });
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
      await save({
        data: {
          id: editing.id,
          tipo: editing.tipo || "boletim",
          titulo: editing.titulo || "",
          descricao: editing.descricao || null,
          arquivo_url: editing.arquivo_url || "",
          arquivo_nome: editing.arquivo_nome || "",
          data_publicacao:
            editing.data_publicacao || new Date().toISOString().slice(0, 10),
          publicado: editing.publicado ?? true,
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

  function getTipoLabel(tipo: TransparenciaDocumento["tipo"]) {
    const labels = {
      boletim: "Boletim",
      edital: "Edital de Convocação",
      prestacao_contas: "Prestação de Contas",
    };
    return labels[tipo];
  }

  return (
    <div>
      <AdminToolbar
        title="Painel da Transparência"
        onNew={() =>
          setEditing({
            tipo: "boletim",
            data_publicacao: new Date().toISOString().slice(0, 10),
            titulo: "",
            descricao: "",
            arquivo_url: "",
            arquivo_nome: "",
            publicado: true,
          })
        }
      />

      <AdminTable>
        <thead className="bg-secondary/60 text-deep text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left px-4 py-3">Tipo</th>
            <th className="text-left px-4 py-3">Título</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">Data</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {documentos.map((d) => (
            <tr key={d.id} className="border-t border-border">
              <td className="px-4 py-3">
                <span className="text-xs font-semibold text-primary">
                  {getTipoLabel(d.tipo)}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold text-deep">{d.titulo}</td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                {d.data_publicacao}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-bold uppercase rounded-full px-2.5 py-1 ${
                    d.publicado
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {d.publicado ? "Publicado" : "Rascunho"}
                </span>
              </td>
              <td className="px-4 py-3">
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
          {documentos.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                Nenhum documento cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </AdminTable>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Editar documento" : "Novo documento"}
      >
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Tipo">
              <select
                className={inputClass}
                value={editing.tipo ?? "boletim"}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    tipo: e.target.value as TransparenciaDocumento["tipo"],
                  })
                }
                required
              >
                <option value="boletim">Boletim</option>
                <option value="edital">Edital de Convocação</option>
                <option value="prestacao_contas">Prestação de Contas</option>
              </select>
            </Field>
            <Field label="Título">
              <input
                className={inputClass}
                value={editing.titulo ?? ""}
                onChange={(e) => setEditing({ ...editing, titulo: e.target.value })}
                required
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Data de Publicação">
                <input
                  type="date"
                  className={inputClass}
                  value={editing.data_publicacao ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, data_publicacao: e.target.value })
                  }
                  required
                />
              </Field>
            </div>
            <Field label="Descrição (opcional)">
              <textarea
                className={inputClass}
                rows={3}
                value={editing.descricao ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, descricao: e.target.value })
                }
              />
            </Field>
            <Field label="Arquivo PDF">
              <div className="space-y-3">
                {editing.arquivo_url && (
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-deep truncate">
                        {editing.arquivo_nome}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {editing.arquivo_url}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          arquivo_url: "",
                          arquivo_nome: "",
                        })
                      }
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg px-4 py-6 cursor-pointer hover:border-primary transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-semibold text-deep">
                    {uploading ? "Enviando..." : "Fazer upload do PDF"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.publicado ?? true}
                onChange={(e) =>
                  setEditing({ ...editing, publicado: e.target.checked })
                }
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
