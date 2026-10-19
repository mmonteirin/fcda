import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/use-auth";
import { Waves, LogOut, ChevronDown, UserCircle, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { loading, session, isEditor, isAdmin, signOut, user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const displayName =
    user?.user_metadata?.nome ??
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Usuário";
  const roleLabel = isAdmin ? "Administrador" : "Editor";
  const avatarUrl = [
    user?.user_metadata?.avatar_url,
    user?.user_metadata?.picture,
    user?.user_metadata?.photo_url,
    user?.user_metadata?.avatar,
  ].find((value): value is string => typeof value === "string" && value.length > 0);
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

  const isAdminRoute = path.startsWith("/admin");

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-[1800px] items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-deep text-primary-foreground shadow-sm">
              <Waves className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Administração
              </div>
              <div className="font-bold tracking-tight text-deep">FCDA</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              to="/"
              aria-label="Abrir o site da FCDA"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-2.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:px-3.5"
            >
              <ExternalLink aria-hidden="true" className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Ver site</span>
            </Link>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 text-left transition hover:border-border hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label={`Menu do usuário ${displayName}`}
              >
                <Avatar className="h-10 w-10 rounded-xl border border-primary/15 shadow-sm">
                  {avatarUrl && (
                    <AvatarImage
                      src={avatarUrl}
                      alt={`Foto de ${displayName}`}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="rounded-xl bg-primary text-xs font-bold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block">
                  <span className="block text-sm font-bold text-deep">{displayName}</span>
                  <span className="block text-xs text-muted-foreground">{roleLabel}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-elegant"
                >
                  <Link
                    to="/admin/perfil"
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <UserCircle className="h-4 w-4" /> Perfil
                  </Link>
                  <div className="my-2 border-t border-border" />
                  <button
                    onClick={async () => {
                      await signOut();
                      navigate({ to: "/login", replace: true });
                    }}
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-destructive transition hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {isAdminRoute ? (
        <Outlet />
      ) : (
        <main className="mx-auto max-w-5xl px-6 py-8">
          <Outlet />
        </main>
      )}
    </div>
  );
}
