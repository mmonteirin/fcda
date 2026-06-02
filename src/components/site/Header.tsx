import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LogIn, Shield } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import logoFCDA from "@/assets/logoFCDA.png";

const nav = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "A Federação" },
  { to: "/modalidades", label: "Modalidades" },
  { to: "/eventos", label: "Eventos" },
  { to: "/noticias", label: "Notícias" },
  { to: "/inscricoes", label: "Inscrições" },
  { to: "/contato", label: "Contato" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isEditor } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logoFCDA} alt="FCDA Logo" className="h-11 w-auto" />
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Federação Cearense de Desportos Aquáticos
            </div>
            <div className="font-bold text-deep">
              FCDA <span className="text-gold">Ceará</span>
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-deep transition-colors rounded-md"
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-deep" }}
            >
              {item.label}
            </Link>
          ))}

          {isEditor ? (
            <Link
              to="/admin"
              className="ml-2 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-deep hover:bg-gold/20"
            >
              <Shield className="h-3.5 w-3.5" /> Painel
            </Link>
          ) : !user ? (
            <Link
              to="/login"
              className="ml-2 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-deep/70 hover:text-deep"
              title="Acesso administrativo"
            >
              <LogIn className="h-3.5 w-3.5" /> Admin
            </Link>
          ) : null}

          <Link
            to="/contato"
            className="ml-3 inline-flex items-center rounded-full bg-deep px-5 py-2.5 text-sm font-bold text-deep-foreground hover:bg-primary transition-colors"
          >
            Filie-se
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 text-deep"
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="px-6 py-4 flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-base font-semibold text-foreground/80 hover:text-deep"
              >
                {item.label}
              </Link>
            ))}
            {isEditor ? (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-base font-semibold text-deep"
              >
                Painel admin
              </Link>
            ) : !user ? (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-base font-semibold text-deep/70"
              >
                Acesso admin
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
