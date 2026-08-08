import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  GraduationCap,
  Building2,
  Waves,
  Users,
  UserCog,
  Handshake,
  Mail,
  FileText,
  Trophy,
  Award,
  Settings,
  Bell,
  History,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Visão geral",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Conteúdo e competições",
    items: [
      { to: "/admin/banner", label: "Banner", icon: Newspaper },
      { to: "/admin/noticias", label: "Notícias", icon: Newspaper },
      { to: "/admin/eventos", label: "Competições", icon: Calendar },
      { to: "/admin/eventos-pdfs", label: "Documentos de eventos", icon: FileText },
      { to: "/admin/rankings", label: "Rankings", icon: Trophy },
      { to: "/admin/recordes", label: "Recordes", icon: Award },
      { to: "/admin/cursos", label: "Cursos", icon: GraduationCap },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { to: "/admin/clubes", label: "Clubes", icon: Building2 },
      { to: "/admin/modalidades", label: "Modalidades", icon: Waves },
      { to: "/admin/categorias-modalidades", label: "Categorias", icon: Waves },
      { to: "/admin/diretores", label: "Diretoria", icon: Users },
      { to: "/admin/parceiros", label: "Parceiros", icon: Handshake },
    ],
  },
  {
    label: "Gestão",
    items: [
      { to: "/admin/filiacoes", label: "Inscrições", icon: Building2 },
      { to: "/admin/mensagens", label: "Mensagens", icon: Mail },
      { to: "/admin/transparencia", label: "Transparência", icon: FileText },
      { to: "/admin/usuarios", label: "Usuários", icon: UserCog },
      { to: "/admin/permissoes", label: "Permissões", icon: ShieldCheck },
      { to: "/admin/notificacoes", label: "Notificações", icon: Bell },
      { to: "/admin/historico", label: "Histórico", icon: History },
    ],
  },
];

function isActivePath(pathname: string, to: string) {
  return to === "/admin"
    ? pathname === "/admin" || pathname === "/admin/"
    : pathname.startsWith(to);
}

function NavigationLinks({ compact = false }: { compact?: boolean }) {
  const location = useLocation();

  return (
    <>
      {navGroups.map((group) => (
        <section key={group.label} className={compact ? "contents" : "mb-5"}>
          {!compact && (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {group.label}
            </p>
          )}
          <div className={compact ? "flex gap-2" : "space-y-1"}>
            {group.items.map((item) => {
              const active = isActivePath(location.pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={compact ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl text-sm font-medium transition-all",
                    compact ? "shrink-0 px-3 py-2" : "px-3 py-2.5",
                    active
                      ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-slate-100 hover:text-deep dark:hover:bg-slate-800 dark:hover:text-white",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!compact && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden h-[calc(100vh-73px)] w-72 shrink-0 overflow-y-auto border-r border-border bg-white shadow-sm lg:block dark:bg-slate-900">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 grid place-items-center text-white shadow-lg">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-deep dark:text-white text-lg">FCDA Admin</div>
            <div className="text-xs text-muted-foreground">Painel Administrativo</div>
          </div>
        </div>

        <nav aria-label="Navegação administrativa">
          <NavigationLinks />
        </nav>

        <div className="mt-8 pt-6 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-deep dark:hover:text-white transition-all group"
          >
            <Settings className="h-5 w-5 text-muted-foreground group-hover:text-deep dark:group-hover:text-white" />
            <span>Voltar ao site</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function AdminMobileNavigation() {
  return (
    <nav
      aria-label="Navegação administrativa"
      className="flex gap-2 overflow-x-auto border-b border-border bg-white px-4 py-3 lg:hidden dark:bg-slate-900"
    >
      <NavigationLinks compact />
    </nav>
  );
}
