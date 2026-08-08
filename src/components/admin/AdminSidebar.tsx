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
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-emerald-gradient grid place-items-center text-white">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-deep">FCDA Admin</div>
            <div className="text-xs text-muted-foreground">Painel Administrativo</div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive(item.to)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-deep"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-border">
          <Link
            to="/admin/perfil"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-deep transition-all"
          >
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
