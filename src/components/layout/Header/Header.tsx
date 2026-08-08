import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, LogIn, Shield, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import logoFCDA from "@/assets/logoFCDA.png";
import { DesktopNav } from "./DesktopNav";
import { TopBar } from "./TopBar";

const nav = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "A FCDA" },
  { to: "/modalidades", label: "Modalidades" },
  { to: "/eventos", label: "Competições" },
  { to: "/noticias", label: "Notícias" },
  { to: "/transparencia", label: "Transparência" },
  { to: "/contato", label: "Contato" },
] as const;

const modalidades = [
  { label: "Natação", icon: "🏊" },
  { label: "Polo Aquático", icon: "🤽" },
  { label: "Águas Abertas", icon: "🌊" },
  { label: "Nado Artístico", icon: "🎨" },
  { label: "Saltos Ornamentais", icon: "🏊" },
  { label: "Masters", icon: "🏅" },
  { label: "Paralímpico", icon: "♿" },
] as const;

const competicoes = [
  { label: "Calendário", to: "/eventos" },
  { label: "Ranking", to: "/rankings" },
  { label: "Recordes", to: "/recordes" },
  { label: "Fotos", to: "/eventos" },
] as const;

function MobileMenuItem({
  to,
  label,
  onClick,
  children,
}: {
  to?: string;
  label: string;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className="flex items-center justify-between px-4 py-3 text-base font-semibold text-foreground/80 hover:text-deep hover:bg-secondary/50 transition-colors"
      >
        {label}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-3 text-base font-semibold text-foreground/80 hover:text-deep hover:bg-secondary/50 transition-colors text-left"
    >
      {label}
      {children}
    </button>
  );
}

function MobileSubMenu({
  isOpen,
  items,
  onItemClick,
  onBack,
}: {
  isOpen: boolean;
  items: Array<{ label: string; to?: string; icon?: string }>;
  onItemClick: () => void;
  onBack: () => void;
}) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="px-4 py-2 bg-secondary/30">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.to || "/modalidades"}
            onClick={onItemClick}
            className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-deep hover:bg-secondary/50 transition-colors rounded-lg"
          >
            {item.icon && (
              <span className="text-xl" aria-hidden="true">
                {item.icon}
              </span>
            )}
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [modalidadesOpen, setModalidadesOpen] = useState(false);
  const [competicoesOpen, setCompeticoesOpen] = useState(false);
  const { user, isEditor } = useAuth();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        setModalidadesOpen(false);
        setCompeticoesOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280 && open) {
        setOpen(false);
        setModalidadesOpen(false);
        setCompeticoesOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setModalidadesOpen(false);
    setCompeticoesOpen(false);
  };

  const toggleModalidades = () => {
    setModalidadesOpen(!modalidadesOpen);
    setCompeticoesOpen(false);
  };

  const toggleCompeticoes = () => {
    setCompeticoesOpen(!competicoesOpen);
    setModalidadesOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <TopBar />
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
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

        <div className="hidden xl:flex items-center gap-1">
          <DesktopNav />

          {isEditor ? (
            <Link
              to="/admin"
              className="ml-2 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-deep hover:bg-gold/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Shield className="h-3.5 w-3.5" aria-hidden="true" /> Painel
            </Link>
          ) : !user ? (
            <Link
              to="/login"
              className="ml-2 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-deep/70 hover:text-deep transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              title="Acesso administrativo"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" /> Admin
            </Link>
          ) : null}

          <Link
            to="/filie-se"
            className="ml-3 inline-flex items-center rounded-full bg-deep px-5 py-2.5 text-sm font-bold text-deep-foreground hover:bg-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Filie-se
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="xl:hidden p-2 text-deep rounded-lg hover:bg-secondary/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`xl:hidden border-t border-border bg-background transition-all duration-300 ease-in-out ${
          open ? "max-h-screen opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div className="px-6 py-4 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
          {nav.map((item) => (
            <MobileMenuItem key={item.to} to={item.to} label={item.label} onClick={closeMenu} />
          ))}

          {/* Mobile Submenu - Modalidades */}
          <div className="border-t border-border/50 mt-2">
            <MobileMenuItem label="Modalidades" onClick={toggleModalidades}>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${modalidadesOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </MobileMenuItem>
            <MobileSubMenu
              isOpen={modalidadesOpen}
              items={[...modalidades]}
              onItemClick={closeMenu}
              onBack={() => setModalidadesOpen(false)}
            />
          </div>

          {/* Mobile Submenu - Competições */}
          <div className="border-t border-border/50">
            <MobileMenuItem label="Competições" onClick={toggleCompeticoes}>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${competicoesOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </MobileMenuItem>
            <MobileSubMenu
              isOpen={competicoesOpen}
              items={[...competicoes]}
              onItemClick={closeMenu}
              onBack={() => setCompeticoesOpen(false)}
            />
          </div>

          {/* Cursos Link */}
          <div className="border-t border-border/50">
            <Link
              to="/cursos"
              className="flex items-center justify-between px-4 py-3 text-base font-semibold text-foreground/80 hover:text-deep hover:bg-secondary/50 transition-colors"
            >
              Cursos
            </Link>
          </div>

          {/* Admin Link */}
          <div className="border-t border-border/50 mt-2">
            {isEditor ? (
              <Link
                to="/admin"
                onClick={closeMenu}
                className="flex items-center justify-between px-4 py-3 text-base font-semibold text-deep hover:bg-secondary/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  Painel admin
                </span>
              </Link>
            ) : !user ? (
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex items-center justify-between px-4 py-3 text-base font-semibold text-deep/70 hover:bg-secondary/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Acesso admin
                </span>
              </Link>
            ) : null}
          </div>

          {/* Filie-se Button */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <Link
              to="/filie-se"
              onClick={closeMenu}
              className="w-full inline-flex items-center justify-center rounded-full bg-deep px-5 py-3 text-sm font-bold text-deep-foreground hover:bg-primary transition-colors"
            >
              Filie-se
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
