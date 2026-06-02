import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Waves } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login — Painel FCDA" }, { name: "robots", content: "noindex" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/admin", replace: true });
    }
  }, [loading, session, navigate]);

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/admin",
      },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
    // se não houve erro, o browser vai redirecionar para o Google automaticamente
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin", replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome }, emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        navigate({ to: "/admin", replace: true });
      }
    } catch (e) {
      setError((e as Error).message ?? "Erro ao autenticar");
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin + "/login",
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (e) {
      setError((e as Error).message ?? "Erro ao enviar email de recuperação");
    } finally {
      setBusy(false);
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

        <h1 className="text-2xl font-bold text-deep">
          {mode === "login" ? "Acessar o painel" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login"
            ? "Entre com sua conta para gerenciar o conteúdo."
            : "Cadastre-se. Apenas contas autorizadas têm acesso ao painel."}
        </p>

        {!forgotMode && (
          <>
            {/* Botão Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="mt-6 w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-background py-2.5 text-sm font-semibold hover:bg-secondary transition disabled:opacity-60"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </>
        )}

        {forgotMode ? (
          <div className="mt-6">
            {forgotSent ? (
              <div className="rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-sm px-4 py-3">
                E-mail enviado! Verifique sua caixa de entrada.
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Seu e-mail
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2">
                    {error}
                  </div>
                )}
                <button
                  disabled={busy}
                  className="w-full rounded-lg bg-deep text-deep-foreground font-bold py-3 hover:bg-primary transition-colors disabled:opacity-60"
                >
                  {busy ? "Enviando..." : "Enviar link de redefinição"}
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setForgotSent(false);
                setError(null);
              }}
              className="mt-4 w-full text-sm text-muted-foreground hover:text-deep"
            >
              Voltar ao login
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nome
                </label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Senha
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

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2">
                {error}
              </div>
            )}

            <button
              disabled={busy}
              className="w-full rounded-lg bg-deep text-deep-foreground font-bold py-3 hover:bg-primary transition-colors disabled:opacity-60"
            >
              {busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        )}

        {!forgotMode && (
          <div className="mt-4 space-y-2">
            {mode === "login" && (
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="w-full text-sm text-muted-foreground hover:text-deep"
              >
                Esqueceu a senha?
              </button>
            )}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="w-full text-sm text-muted-foreground hover:text-deep"
            >
              {mode === "login" ? "Não tem conta? Cadastrar" : "Já tem conta? Entrar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
