import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { clubesQuery, type Clube } from "@/lib/site-queries";
import { saveClube, deleteClube, assertEditor, uploadClubeLogo } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import {
  Plus,
  ExternalLink,
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building2,
  Upload,
} from "lucide-react";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import { createFileRoute } from "@tanstack/react-router";

// @ts-expect-error - Route type is complex and expected to have this pattern
export const Route = createFileRoute("/_authenticated/admin/clubes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(clubesQuery(false)),
  errorComponent: ({ error }: { error: { message: string } }) => (
    <div className="text-destructive">Erro: {error.message}</div>
  ),
  component: ClubesAdmin,
});

function ClubesAdmin() {
  const { data: clubes } = useSuspenseQuery(clubesQuery(false));
  const { user } = useAuth();
  const supabase = supabaseClient;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClube, setEditingClube] = useState<Clube | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    sigla: "",
    logo_url: "",
    cidade: "",
    estado: "",
    fundacao: "",
    email: "",
    telefone: "",
    site_url: "",
    endereco: "",
    ordem: 0,
    ativo: true,
  });

  const handleNew = () => {
    setEditingClube(null);
    setFormData({
      nome: "",
      sigla: "",
      logo_url: "",
      cidade: "",
      estado: "",
      fundacao: "",
      email: "",
      telefone: "",
      site_url: "",
      endereco: "",
      ordem: 0,
      ativo: true,
    });
    setModalOpen(true);
    setErr(null);
  };

  const handleEdit = (clube: Clube) => {
    setEditingClube(clube);
    setFormData({
      nome: clube.nome,
      sigla: clube.sigla || "",
      logo_url: clube.logo_url || "",
      cidade: clube.cidade || "",
      estado: clube.estado || "",
      fundacao: clube.fundacao || "",
      email: clube.email || "",
      telefone: clube.telefone || "",
      site_url: clube.site_url || "",
      endereco: clube.endereco || "",
      ordem: clube.ordem,
      ativo: clube.ativo,
    });
    setModalOpen(true);
    setErr(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este clube?")) return;
    if (!user) return;
    try {
      await assertEditor(supabase, user.id);
      await deleteClube(supabase, user.id, id);
      window.location.reload();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao excluir clube");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await assertEditor(supabase, user.id);
      const data = editingClube ? { ...formData, id: editingClube.id } : formData;

      await saveClube(supabase, user.id, data);
      setModalOpen(false);
      window.location.reload();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao salvar clube");
    }
  };

  const uploadLogo = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErr("O arquivo deve ser uma imagem");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadClubeLogo(supabase, file);
      setFormData({ ...formData, logo_url: url });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao fazer upload do logo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-deep">Clubes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os clubes de natação filiados à FCDA
          </p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Novo Clube
        </button>
      </div>

      {err && <div className="bg-destructive/10 text-destructive p-4 rounded-lg">{err}</div>}

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/30">
              <th className="px-4 py-3 text-left text-sm font-semibold">Nome</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Sigla</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Cidade/UF</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Fundação</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clubes.map((clube) => (
              <tr key={clube.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {clube.logo_url && (
                      <img
                        src={clube.logo_url}
                        alt={clube.nome}
                        className="h-8 w-8 object-contain rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{clube.nome}</div>
                      {clube.site_url && (
                        <a
                          href={clube.site_url}
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
                <td className="px-4 py-3">{clube.sigla || "-"}</td>
                <td className="px-4 py-3">
                  {clube.cidade && clube.estado ? `${clube.cidade}/${clube.estado}` : "-"}
                </td>
                <td className="px-4 py-3">{clube.fundacao || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      clube.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {clube.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleEdit(clube)}
                    className="text-sm text-primary hover:underline mr-3"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(clube.id)}
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
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingClube ? "Editar Clube" : "Novo Clube"}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium mb-1">Sigla</label>
                  <input
                    type="text"
                    value={formData.sigla}
                    onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                    className="w-full rounded-md border border-input px-3 py-2 text-sm"
                    placeholder="Ex: ACN"
                  />
                </div>
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
                      alt="Logo do clube"
                      className="h-16 w-auto object-contain rounded border"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full rounded-md border border-input px-3 py-2 text-sm"
                    placeholder="Ex: CE"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Fundação</label>
                  <input
                    type="date"
                    value={formData.fundacao}
                    onChange={(e) => setFormData({ ...formData, fundacao: e.target.value })}
                    className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  />
                </div>
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
                <label className="block text-sm font-medium mb-1">Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
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
