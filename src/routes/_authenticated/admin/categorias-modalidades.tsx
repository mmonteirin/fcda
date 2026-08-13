import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { categoriasModalidadesQuery, type CategoriaModalidade } from "@/lib/site-queries";
import { saveCategoriaModalidade, deleteCategoriaModalidade } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AdminToolbar, AdminTable, RowActions, Modal, Field } from "@/components/admin/ui";
import { inputClass, useInvalidate } from "@/components/admin/utils";
import { ErrorMessage, getFriendlyErrorMessage } from "@/components/admin/error-message";

export const Route = createFileRoute("/_authenticated/admin/categorias-modalidades")({
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriasModalidadesQuery),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: AdminCategoriasModalidades,
});

function AdminCategoriasModalidades() {
  const { user } = useAuth();
  const categorias = useSuspenseQuery(categoriasModalidadesQuery).data;
  const [editing, setEditing] = useState<Partial<CategoriaModalidade> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const invalidate = useInvalidate(["categorias-modalidades"]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setErr(null);
    try {
      // Gera ou valida o slug
      let slug = editing.slug || slugify(editing.nome || "");
      slug = validateAndFixSlug(slug);
      
      await saveCategoriaModalidade(supabase, user!.id, {
        id: editing.id,
        nome: editing.nome || "",
        slug: slug,
        descricao: editing.descricao || null,
        ordem: Number(editing.ordem ?? 0),
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

  function slugify(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);
  }

  function validateAndFixSlug(slug: string): string {
    const fixed = slug
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);
    
    if (!fixed) {
      return `categoria-${Date.now()}`;
    }
    
    return fixed;
  }

  return (
    <div>
      <AdminToolbar
        title="Categorias de Modalidades"
        onNew={() =>
          setEditing({
            nome: "",
            slug: "",
            descricao: "",
            ordem: categorias.length + 1,
          })
        }
      />

      <AdminTable>
        <thead className="bg-secondary/60 text-deep text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left px-4 py-3 w-16">#</th>
            <th className="text-left px-4 py-3">Nome</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">Slug</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">Descrição</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {categorias.map((c) => (
            <tr key={c.id} className="border-t border-border">
              <td className="px-4 py-3 font-bold text-deep">{c.ordem}</td>
              <td className="px-4 py-3">
                <div className="font-semibold text-deep">{c.nome}</div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground font-mono text-xs">
                {c.slug}
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                {c.descricao}
              </td>
              <td className="px-4 py-3">
                <RowActions
                  onEdit={() => setEditing(c)}
                  onDelete={async () => {
                    await deleteCategoriaModalidade(supabase, user!.id, c.id);
                    invalidate();
                  }}
                />
              </td>
            </tr>
          ))}
          {categorias.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                Nenhuma categoria cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </AdminTable>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Editar categoria" : "Nova categoria"}
      >
        {editing && (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-[1fr_120px] gap-4">
              <Field label="Nome">
                <input
                  className={inputClass}
                  value={editing.nome ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      nome: e.target.value,
                      slug: slugify(e.target.value),
                    })
                  }
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
                onChange={(e) => {
                  const value = e.target.value;
                  const validValue = value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "-")
                    .replace(/-+/g, "-")
                    .slice(0, 100);
                  setEditing({ ...editing, slug: validValue });
                }}
                required
                placeholder="competitivo"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {editing.slug?.length || 0}/100 caracteres • Apenas letras, números e hífens
              </p>
            </Field>
            <Field label="Descrição (opcional)">
              <textarea
                className={inputClass}
                rows={4}
                value={editing.descricao ?? ""}
                onChange={(e) => setEditing({ ...editing, descricao: e.target.value })}
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
