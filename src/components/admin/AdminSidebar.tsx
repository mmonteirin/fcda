import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  ChevronDown,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
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

function NavigationLinks({
  compact = false,
  collapsed = false,
}: {
  compact?: boolean;
  collapsed?: boolean;
}) {
  const location = useLocation();
  const currentGroup =
    navGroups.find((group) => group.items.some((item) => isActivePath(location.pathname, item.to)))
      ?.label ?? "Visão geral";
  const [expandedGroup, setExpandedGroup] = useState(currentGroup);
  const [query, setQuery] = useState("");

  useEffect(() => setExpandedGroup(currentGroup), [currentGroup]);
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const hasResults = navGroups.some((group) =>
    group.items.some(
      (item) =>
        !normalizedQuery ||
        `${group.label} ${item.label}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
    ),
  );

  return (
    <>
      {!compact && !collapsed && (
        <label className="relative mb-4 block">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar no menu"
            aria-label="Buscar página administrativa"
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-400 focus-visible:border-emerald-400/50 focus-visible:ring-2 focus-visible:ring-emerald-400/30"
          />
        </label>
      )}
      {!compact && !collapsed && normalizedQuery && !hasResults && (
        <p className="px-3 py-2 text-xs text-slate-400">Nenhuma tela encontrada.</p>
      )}
      {navGroups.map((group) => {
        const items = group.items.filter(
          (item) =>
            !normalizedQuery ||
            `${group.label} ${item.label}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
        );
        const isOpen = Boolean(normalizedQuery) || expandedGroup === group.label;
        if (!items.length) return null;
        return (
          <section key={group.label} className={compact ? "contents" : "mb-3"}>
            {!compact && !collapsed && (
              <button
                type="button"
                onClick={() =>
                  setExpandedGroup((current) => (current === group.label ? "" : group.label))
                }
                aria-expanded={isOpen}
                className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                {group.label}
                <ChevronDown
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            )}
            <div className={compact ? "flex gap-2" : "space-y-1"}>
              {(compact || collapsed || isOpen) &&
                items.map((item) => {
                  const active = isActivePath(location.pathname, item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setQuery("")}
                      title={compact || collapsed ? item.label : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 motion-reduce:transition-none",
                        compact
                          ? "shrink-0 gap-2.5 px-3 py-2.5"
                          : collapsed
                            ? "justify-center px-2 py-3"
                            : "gap-3 px-3 py-2",
                        active
                          ? "bg-emerald-500/15 text-emerald-100 ring-1 ring-inset ring-emerald-400/20"
                          : "text-slate-300 hover:bg-white/[0.07] hover:text-white",
                      )}
                    >
                      <item.icon
                        aria-hidden="true"
                        className={cn("h-4 w-4 shrink-0", active && "text-emerald-300")}
                      />
                      {!collapsed && (
                        <span className={compact ? "whitespace-nowrap" : undefined}>
                          {item.label}
                        </span>
                      )}
                      {active && !compact && !collapsed && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      )}
                    </Link>
                  );
                })}
            </div>
          </section>
        );
      })}
    </>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("fcda-admin-sidebar-collapsed") === "true");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("fcda-admin-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={`sticky top-16 hidden h-[calc(100vh-64px)] shrink-0 overflow-y-auto border-r border-white/10 bg-[#0b1f1b] text-white shadow-xl transition-[width] duration-200 motion-reduce:transition-none lg:block ${collapsed ? "w-[76px]" : "w-[250px]"}`}
    >
      <div className={`min-h-full pt-4 ${collapsed ? "px-2" : "p-3"}`}>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className={`mb-3 flex h-10 items-center rounded-xl text-slate-300 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${collapsed ? "mx-auto w-10 justify-center" : "w-full justify-end px-3"}`}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
          ) : (
            <>
              <span className="mr-2 text-xs font-semibold">Recolher menu</span>
              <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
            </>
          )}
        </button>
        <nav aria-label="Navegação administrativa">
          <NavigationLinks collapsed={collapsed} />
        </nav>
      </div>
    </aside>
  );
}

export function AdminMobileNavigation() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const currentItem = navGroups
    .flatMap((group) => group.items)
    .find((item) => isActivePath(location.pathname, item.to));

  return (
    <nav
      aria-label="Navegação administrativa"
      className="sticky top-16 z-30 border-b border-border bg-card/95 px-4 py-2 shadow-sm backdrop-blur lg:hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="admin-mobile-nav-panel"
        className="flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-sm font-semibold text-deep transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span>{currentItem?.label ?? "Navegação"}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id="admin-mobile-nav-panel"
          className="absolute left-0 right-0 top-full max-h-[70vh] overflow-y-auto border-b border-border bg-card p-4 shadow-xl"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {navGroups.map((group) => (
              <section key={group.label}>
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </h2>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActivePath(location.pathname, item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"}`}
                      >
                        <item.icon aria-hidden="true" className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
