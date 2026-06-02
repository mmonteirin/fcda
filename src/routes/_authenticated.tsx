import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/use-auth";
import {
  Newspaper,
  Calendar,
  Waves as WavesIcon,
  Users,
  LogOut,
  ExternalLink,
  UserCog,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { loading, session, isEditor, signOut, user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Carregando painel...
      </div>
    );
  }

  if (!isEditor) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="max-w-md text-center rounded-2xl border border-border bg-card p-8 shadow-card">
          <h1 className="text-2xl font-bold text-deep">Acesso restrito</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sua conta ({user?.email}) está autenticada, mas não tem permissão de admin/editor.
            Solicite a um administrador da FCDA para liberar seu acesso.
          </p>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/login", replace: true });
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>
    );
  }

  const items = [
    { to: "/admin", label: "Visão geral", icon: ExternalLink, exact: true },
    { to: "/admin/banner", label: "Banner", icon: Newspaper },
    { to: "/admin/noticias", label: "Notícias", icon: Newspaper },
    { to: "/admin/eventos", label: "Eventos", icon: Calendar },
    { to: "/admin/eventos-pdfs", label: "PDFs Eventos", icon: Newspaper },
    { to: "/admin/categorias-modalidades", label: "Categorias", icon: WavesIcon },
    { to: "/admin/modalidades", label: "Modalidades", icon: WavesIcon },
    { to: "/admin/diretores", label: "Diretoria", icon: Users },
    { to: "/admin/usuarios", label: "Usuários", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-gradient grid place-items-center">
              <WavesIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Painel
              </div>
              <div className="font-bold text-deep text-sm">FCDA Admin</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-deep">
              Ver site
            </Link>
            <span className="text-muted-foreground hidden sm:inline">·</span>
            <span className="text-muted-foreground hidden sm:inline">{user?.email}</span>
            <button
              onClick={async () => {
                await signOut();
                navigate({ to: "/login", replace: true });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-semibold hover:bg-secondary"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto">
            {items.map((it) => {
              const active = it.exact ? path === it.to : path.startsWith(it.to);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap ${
                    active
                      ? "bg-deep text-deep-foreground"
                      : "text-foreground/70 hover:bg-secondary"
                  }`}
                >
                  <it.icon className="h-4 w-4" /> {it.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
