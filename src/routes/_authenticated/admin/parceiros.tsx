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
import { AdminToolbar } from "@/components/admin/ui";

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

  const [modalOpen, setModalOpen] = useState(false);
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
    setModalOpen(true);
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
    setModalOpen(true);
    setErr(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este parceiro?")) return;
    if (!user) return;
    try {
      await assertEditor(supabase, user.id);
      await deleteParceiro(supabase, user.id, id);
      window.location.reload();
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
      setModalOpen(false);
      window.location.reload();
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

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/30">
              <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Categoria</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Ordem</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {parceiros.map((parceiro) => (
              <tr key={parceiro.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {parceiro.logo_url && (
                      <img
                        src={parceiro.logo_url}
                        alt={parceiro.nome}
                        className="h-8 w-8 object-contain rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{parceiro.nome}</div>
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
                <td className="px-4 py-3">
                  {(() => {
                    const cat = categoriaOptions.find((c) => c.value === parceiro.categoria);
                    return cat ? (
                      <div className="flex items-center gap-2 text-sm">
                        <cat.icon className="h-4 w-4 text-muted-foreground" />
                        {cat.label}
                      </div>
                    ) : (
                      parceiro.categoria
                    );
                  })()}
                </td>
                <td className="px-4 py-3">{parceiro.ordem}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      parceiro.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {parceiro.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleEdit(parceiro)}
                    className="text-sm text-primary hover:underline mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(parceiro.id)}
                    className="text-sm text-destructive hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {editingParceiro ? "Editar Parceiro" : "Novo Parceiro"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
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
                      className="h-16 w-auto object-contain rounded border"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL do Site</label>
                <input
                  type="url"
                  value={formData.site_url}
                  onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  placeholder="https://exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoria *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoria: e.target.value as
                        "apoio_institucional" | "patrocinio" | "parceria",
                    })
                  }
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                >
                  {categoriaOptions.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ordem</label>
                <input
                  type="number"
                  value={formData.ordem}
                  onChange={(e) =>
                    setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })
                  }
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="ativo" className="text-sm">
                  Ativo
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
