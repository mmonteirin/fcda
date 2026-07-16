import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold text-deep">Meu perfil</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Atualize as informações exibidas no painel.
      </p>
      <form
        onSubmit={salvar}
        className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <label className="block text-sm font-semibold text-deep">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal"
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
        {status && <p className="text-sm text-primary">{status}</p>}
        <button
          disabled={busy}
          className="rounded-lg bg-deep px-4 py-2 text-sm font-bold text-deep-foreground disabled:opacity-60"
        >
          {busy ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>
    </div>
  );
}
