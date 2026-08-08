import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { parceirosQuery, type Parceiro } from "@/lib/site-queries";
import {
  saveParceiro,
  deleteParceiro,
  assertEditor,
  uploadParceiroLogo,
} from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { Building2, Handshake, Medal, Plus, ExternalLink, X, Upload } from "lucide-react";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { createFileRoute } from "@tanstack/react-router";
import { AdminToolbar, AdminTable, RowActions, Modal, Field } from "@/components/admin/ui";
import { inputClass, useInvalidate } from "@/components/admin/utils";

export const Route = createFileRoute("/_authenticated/admin/parceiros")({
  loader: ({ context }) => context.queryClient.ensureQueryData(parceirosQuery(false)),
  errorComponent: ({ error }: { error: { message: string } }) => (
    <div className="text-destructive">Erro: {error.message}</div>
  ),
  component: ParceirosAdmin,
});

function ParceirosAdmin() {
  const { data: parceiros } = useSuspenseQuery(parceirosQuery(false));
  const { user } = useAuth();
  const supabase = supabaseClient;
  const invalidate = useInvalidate(["parceiros"]);

  const [editingParceiro, setEditingParceiro] = useState<Parceiro | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    logo_url: "",
    site_url: "",
    categoria: "apoio_institucional" as "apoio_institucional" | "patrocinio" | "parceria",
    ordem: 0,
    ativo: true,
  });

  const categoriaOptions = [
    { value: "apoio_institucional", label: "Apoio Institucional", icon: Building2 },
    { value: "patrocinio", label: "Patrocínio", icon: Medal },
    { value: "parceria", label: "Parceria", icon: Handshake },
  ] as const;

  const handleNew = () => {
    setEditingParceiro(null);
    setFormData({
      nome: "",
      logo_url: "",
      site_url: "",
      categoria: "apoio_institucional",
      ordem: 0,
      ativo: true,
    });
    setErr(null);
  };

  const handleEdit = (parceiro: Parceiro) => {
    setEditingParceiro(parceiro);
    setFormData({
      nome: parceiro.nome,
      logo_url: parceiro.logo_url || "",
      site_url: parceiro.site_url || "",
      categoria: parceiro.categoria,
      ordem: parceiro.ordem,
      ativo: parceiro.ativo,
    });
    setErr(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este parceiro?")) return;
    if (!user) return;
    try {
      await assertEditor(supabase, user.id);
      await deleteParceiro(supabase, user.id, id);
      invalidate();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao excluir parceiro");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await assertEditor(supabase, user.id);
      const data = editingParceiro ? { ...formData, id: editingParceiro.id } : formData;

      await saveParceiro(supabase, user.id, data);
      setEditingParceiro(null);
      invalidate();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao salvar parceiro");
    }
  };

  const uploadLogo = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErr("O arquivo deve ser uma imagem");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadParceiroLogo(supabase, file);
      setFormData({ ...formData, logo_url: url });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao fazer upload do logo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminToolbar 
        title="Parceiros" 
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Parceiros", to: "/admin/parceiros" }
        ]}
        onNew={handleNew}
      />

      {err && <div className="bg-destructive/10 text-destructive p-4 rounded-lg">{err}</div>}

      <AdminTable>
        <thead className="bg-slate-100 dark:bg-slate-800 text-deep dark:text-white text-xs uppercase tracking-wider font-semibold">
          <tr>
            <th className="text-left px-5 py-4">Nome</th>
            <th className="text-left px-5 py-4">Categoria</th>
            <th className="text-left px-5 py-4 hidden md:table-cell">Ordem</th>
            <th className="text-left px-5 py-4">Status</th>
            <th className="px-5 py-4" />
          </tr>
        </thead>
        <tbody>
          {parceiros.map((parceiro) => (
            <tr key={parceiro.id} className="border-t border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {parceiro.logo_url && (
                    <img
                      src={parceiro.logo_url}
                      alt={parceiro.nome}
                      className="h-10 w-10 object-contain rounded-lg bg-white dark:bg-slate-800 p-1"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-deep dark:text-white">{parceiro.nome}</div>
                    {parceiro.site_url && (
                      <a
                        href={parceiro.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Site
                      </a>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                {(() => {
                  const cat = categoriaOptions.find((c) => c.value === parceiro.categoria);
                  return cat ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <cat.icon className="h-4 w-4" />
                      {cat.label}
                    </div>
                  ) : (
                    parceiro.categoria
                  );
                })()}
              </td>
              <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">{parceiro.ordem}</td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex text-xs font-bold uppercase rounded-full px-3 py-1.5 ${
                    parceiro.ativo
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {parceiro.ativo ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="px-5 py-4">
                <RowActions
                  onEdit={() => handleEdit(parceiro)}
                  onDelete={() => handleDelete(parceiro.id)}
                />
              </td>
            </tr>
          ))}
          {parceiros.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Handshake className="h-12 w-12 text-muted-foreground/50" />
                  <p>Nenhum parceiro cadastrado.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </AdminTable>

      <Modal
        open={!!editingParceiro}
        onClose={() => setEditingParceiro(null)}
        title={editingParceiro?.id ? "Editar Parceiro" : "Novo Parceiro"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Nome">
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className={inputClass}
              required
            />
          </Field>

          <Field label="Logo">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
              className={inputClass}
              disabled={uploading}
            />
            {uploading && (
              <p className="mt-1 text-xs text-muted-foreground">Enviando logo...</p>
            )}
            {formData.logo_url && (
              <div className="mt-2">
                <img
                  src={formData.logo_url}
                  alt="Logo do parceiro"
                  className="h-16 w-auto object-contain rounded-lg border border-border"
                />
              </div>
            )}
          </Field>

          <Field label="URL do Site">
            <input
              type="url"
              value={formData.site_url}
              onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
              className={inputClass}
              placeholder="https://exemplo.com"
            />
          </Field>

          <Field label="Categoria">
            <select
              value={formData.categoria}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoria: e.target.value as
                    "apoio_institucional" | "patrocinio" | "parceria",
                })
              }
              className={inputClass}
            >
              {categoriaOptions.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Ordem">
            <input
              type="number"
              value={formData.ordem}
              onChange={(e) =>
                setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })
              }
              className={inputClass}
              min="0"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              className="rounded border-border"
            />
            <span className="font-semibold text-deep dark:text-white">Ativo</span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setEditingParceiro(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-deep text-deep-foreground px-4 py-2 text-sm font-bold"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
