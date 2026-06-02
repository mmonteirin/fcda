import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Waves } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Nova senha — FCDA" }, { name: "robots", content: "noindex" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // O Supabase processa o token da URL automaticamente via onAuthStateChange
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setStatus("busy");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("done");
      setTimeout(() => navigate({ to: "/admin", replace: true }), 2000);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-elegant p-8">
        <Link to="/" className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-emerald-gradient grid place-items-center">
            <Waves className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Painel
            </div>
            <div className="font-bold text-deep">FCDA Admin</div>
          </div>
        </Link>

        <h1 className="text-2xl font-bold text-deep">Definir nova senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">Digite sua nova senha abaixo.</p>

        {status === "done" ? (
          <div className="mt-6 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-sm px-4 py-3">
            Senha atualizada! Redirecionando para o painel...
          </div>
        ) : !ready ? (
          <div className="mt-6 text-sm text-muted-foreground">
            Validando link... Se nada acontecer,{" "}
            <Link to="/login" className="underline hover:text-deep">
              volte ao login
            </Link>{" "}
            e solicite um novo link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nova senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirmar senha
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2">
                {error}
              </div>
            )}

            <button
              disabled={status === "busy"}
              className="w-full rounded-lg bg-deep text-deep-foreground font-bold py-3 hover:bg-primary transition-colors disabled:opacity-60"
            >
              {status === "busy" ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
