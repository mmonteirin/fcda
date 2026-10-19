import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AdminToolbar } from "@/components/admin/ui";
import { inputClass } from "@/components/admin/utils";

export const Route = createFileRoute("/_authenticated/admin/perfil")({
  component: Perfil,
});

function Perfil() {
  const { user, isAdmin } = useAuth();
  const initialName =
    user?.user_metadata?.nome ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "";
  const [nome, setNome] = useState(initialName);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function salvar(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setStatus(null);
    const [{ error: profileError }, { error: authError }] = await Promise.all([
      supabase.from("profiles").update({ nome }).eq("id", user.id),
      supabase.auth.updateUser({ data: { nome } }),
    ]);
    setStatus(
      profileError || authError ? "Não foi possível atualizar o perfil." : "Perfil atualizado.",
    );
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <AdminToolbar title="Meu perfil" description="Atualize suas informações de acesso ao painel da FCDA." />
      <section className="max-w-2xl rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-6"><h2 className="text-lg font-bold text-deep">Dados da conta</h2><p className="mt-1 text-sm text-muted-foreground">Essas informações identificam você nas atividades administrativas.</p></div>
      <form
        onSubmit={salvar}
        className="space-y-5"
      >
        <label className="block text-sm font-semibold text-deep">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={`${inputClass} mt-2 font-normal`}
            required
          />
        </label>
        <div className="text-sm">
          <span className="font-semibold text-deep">E-mail: </span>
          <span className="text-muted-foreground">{user?.email}</span>
        </div>
        <div className="text-sm">
          <span className="font-semibold text-deep">Função: </span>
          <span className="text-muted-foreground">{isAdmin ? "Administrador" : "Editor"}</span>
        </div>
        {status && <p role="status" aria-live="polite" className={`rounded-xl px-4 py-3 text-sm ${status.includes("não") ? "bg-destructive/5 text-destructive" : "bg-primary/5 text-primary"}`}>{status}</p>}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>
      </section>
    </div>
  );
}
