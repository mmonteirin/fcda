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
  Bell,
  History,
  ShieldCheck,
  Waves as LogoWaves,
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
        <section key={group.label} className={compact ? "contents" : "mb-6"}>
          {!compact && (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
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
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 motion-reduce:transition-none",
                    compact ? "shrink-0 gap-2.5 px-3 py-2.5" : "gap-3 px-3 py-2.5",
                    active
                      ? "bg-emerald-500/15 text-emerald-100 ring-1 ring-inset ring-emerald-400/20"
                      : "text-slate-300 hover:bg-white/[0.07] hover:text-white",
                  )}
                >
                  <item.icon
                    aria-hidden="true"
                    className={cn("h-4 w-4 shrink-0", active && "text-emerald-300")}
                  />
                  <span className={compact ? "whitespace-nowrap" : undefined}>{item.label}</span>
                  {active && !compact && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  )}
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
    <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-[270px] shrink-0 overflow-y-auto border-r border-white/10 bg-[#0b1f1b] text-white shadow-xl lg:block">
      <div className="flex min-h-full flex-col p-4">
        <div className="mb-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-950/30">
            <LogoWaves className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-white">
              FCDA <span className="text-emerald-300">Admin</span>
            </div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
              Gestão do portal
            </div>
          </div>
        </div>

        <nav aria-label="Navegação administrativa">
          <NavigationLinks />
        </nav>
      </div>
    </aside>
  );
}

export function AdminMobileNavigation() {
  return (
    <nav
      aria-label="Navegação administrativa"
      className="sticky top-16 z-30 flex gap-2 overflow-x-auto border-b border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden"
    >
      <NavigationLinks compact />
    </nav>
  );
}
