import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useState } from "react";
import { bannerQuery, type BannerConfig } from "@/lib/site-queries";
import { saveBanner } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AdminToolbar, Field } from "@/components/admin/ui";
import { useInvalidate, inputClass } from "@/components/admin/utils";

export const Route = createFileRoute("/_authenticated/admin/banner")({
  loader: ({ context }) => context.queryClient.ensureQueryData(bannerQuery),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: AdminBanner,
});

function AdminBanner() {
  const { user } = useAuth();
  const banner = useSuspenseQuery(bannerQuery).data as BannerConfig;

  const invalidate = useInvalidate(["banner"]);
  const [texto, setTexto] = useState(banner.texto);
  const [link, setLink] = useState(banner.link || "");
  const [ativo, setAtivo] = useState(banner.ativo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await saveBanner(supabase, user!.id, { texto, link: link || null, ativo });
      invalidate();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar banner");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminToolbar title="Banner de Aviso" />

      <div className="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          <Field label="Texto do banner">
            <textarea
              className={inputClass}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={3}
              required
              maxLength={500}
            />
            <p className="mt-1 text-xs text-muted-foreground">Máximo 500 caracteres</p>
          </Field>

          <Field label="Link do botão (opcional)">
            <input
              type="url"
              className={inputClass}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://exemplo.com"
            />
          </Field>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="ativo" className="text-sm font-semibold">
              Banner ativo
            </label>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              disabled={busy}
              className="rounded-lg bg-deep text-deep-foreground px-4 py-2 text-sm font-bold disabled:opacity-60"
            >
              {busy ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>

        {ativo && (
          <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/30 text-primary">
            <p className="font-semibold">Preview do banner:</p>
            <p className="mt-2">{texto}</p>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold underline"
              >
                {link}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
