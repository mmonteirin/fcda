import { Link, useLocation } from "@tanstack/react-router";
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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: any;
  badge?: number;
  highlight?: boolean;
}

const navItems: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/noticias", label: "Notícias", icon: Newspaper },
  { to: "/admin/eventos", label: "Competições", icon: Calendar },
  { to: "/admin/cursos", label: "Cursos", icon: GraduationCap },
  { to: "/admin/clubes", label: "Clubes", icon: Building2 },
  { to: "/admin/modalidades", label: "Modalidades", icon: Waves },
  { to: "/admin/diretores", label: "Diretoria", icon: Users },
  { to: "/admin/usuarios", label: "Usuários", icon: UserCog },
  { to: "/admin/parceiros", label: "Parceiros", icon: Handshake },
  { to: "/admin/mensagens", label: "Mensagens", icon: Mail },
  { to: "/admin/filiacoes", label: "Inscrições", icon: Building2 },
  { to: "/admin/transparencia", label: "Documentos", icon: FileText },
  { to: "/admin/rankings", label: "Rankings", icon: Trophy },
  { to: "/admin/recordes", label: "Recordes", icon: Award },
];

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/_authenticated/admin";
    }
    return location.pathname.startsWith(to);
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-border h-screen sticky top-0 overflow-y-auto shadow-lg">
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

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                isActive(item.to)
                  ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-deep dark:hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive(item.to) ? "text-white" : "text-muted-foreground group-hover:text-deep dark:group-hover:text-white")} />
              <span className="flex-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
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
