import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import pictogramas from "@/assets/pictogramas/modalidades.png";
import masters from "@/assets/pictogramas/masters.png";

type ModalidadeMenu = { label: string; position: string; source?: string };

const modalidades: readonly ModalidadeMenu[] = [
  { label: "Natação", position: "0% 0%" },
  { label: "Polo Aquático", position: "50% 0%" },
  { label: "Águas Abertas", position: "50% 100%" },
  { label: "Nado Artístico", position: "0% 100%" },
  { label: "Saltos Ornamentais", position: "100% 0%" },
  { label: "Masters", position: "center", source: masters },
  { label: "Paralímpico", position: "100% 100%" },
];

const competicoes = [
  { label: "Calendário", to: "/eventos" },
  { label: "Ranking Temporada 2026", to: "/ranking-temporada-2026" },
  { label: "Rankings Anteriores", to: "/rankings" },
  { label: "Recordes", to: "/recordes" },
  { label: "Fotos", to: "/eventos" },
] as const;

type MegaMenuName = "modalidades" | "competicoes";

function MenuTrigger({
  label,
  isOpen,
  onClick,
  onKeyDown,
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-expanded={isOpen}
      aria-haspopup="true"
      className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {label}
      <ChevronDown
        className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        aria-hidden="true"
      />
    </button>
  );
}

function MegaMenuContent({
  isOpen,
  children,
  className = "",
}: {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstLink = menuRef.current.querySelector("a") as HTMLElement;
      firstLink?.focus();
    }
  }, [isOpen, menuRef]);

  return (
    <div
      ref={menuRef}
      className={`absolute left-0 top-full z-50 mt-3 rounded-2xl border border-border/80 bg-card p-3 shadow-elegant transition-all duration-200 ${
        isOpen
          ? "opacity-100 translate-y-0 visible"
          : "opacity-0 -translate-y-2 invisible pointer-events-none"
      } ${className}`}
      role="menu"
    >
      {children}
    </div>
  );
}

export function DesktopNav() {
  const [openMenu, setOpenMenu] = useState<MegaMenuName | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const clearMenuTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMenuEnter = (menu: MegaMenuName) => {
    clearMenuTimeout();
    setOpenMenu(menu);
  };

  const handleMenuLeave = () => {
    clearMenuTimeout();
    timeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 150);
  };

  const handleMenuClick = (menu: MegaMenuName) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleKeyDown = (e: React.KeyboardEvent, menu: MegaMenuName) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpenMenu(openMenu === menu ? null : menu);
    } else if (e.key === "Escape") {
      setOpenMenu(null);
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpenMenu(null);
    }
  };

  // Close menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (openMenu) {
        setOpenMenu(null);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [openMenu]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Navegação principal">
      <Link
        to="/"
        className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        activeOptions={{ exact: true }}
        activeProps={{ className: "text-deep" }}
      >
        Início
      </Link>
      <Link
        to="/sobre"
        className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        activeProps={{ className: "text-deep" }}
      >
        A FCDA
      </Link>

      <div
        className="relative"
        onMouseEnter={() => handleMenuEnter("modalidades")}
        onMouseLeave={handleMenuLeave}
      >
        <MenuTrigger
          label="Modalidades"
          isOpen={openMenu === "modalidades"}
          onClick={() => handleMenuClick("modalidades")}
          onKeyDown={(e) => handleKeyDown(e, "modalidades")}
        />
        <MegaMenuContent isOpen={openMenu === "modalidades"} className="w-[34rem]">
          <div className="grid grid-cols-2 gap-1" role="none">
            {modalidades.map((modalidade) => (
              <Link
                key={modalidade.label}
                to="/modalidades"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-deep transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                role="menuitem"
                tabIndex={-1}
              >
                <span
                  className="h-8 w-8 shrink-0 rounded-lg bg-white bg-no-repeat"
                  style={{
                    backgroundImage: `url(${modalidade.source ?? pictogramas})`,
                    backgroundPosition: modalidade.position,
                    backgroundSize: modalidade.source ? "cover" : "300% 200%",
                  }}
                  aria-hidden="true"
                />
                {modalidade.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <Link
              to="/modalidades"
              className="inline-flex px-3 py-2 text-sm font-bold text-primary transition-colors hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              role="menuitem"
              tabIndex={-1}
            >
              Conheça todas as modalidades →
            </Link>
          </div>
        </MegaMenuContent>
      </div>

      <div
        className="relative"
        onMouseEnter={() => handleMenuEnter("competicoes")}
        onMouseLeave={handleMenuLeave}
      >
        <MenuTrigger
          label="Competições"
          isOpen={openMenu === "competicoes"}
          onClick={() => handleMenuClick("competicoes")}
          onKeyDown={(e) => handleKeyDown(e, "competicoes")}
        />
        <MegaMenuContent isOpen={openMenu === "competicoes"} className="w-56">
          <div className="space-y-1" role="none">
            {competicoes.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-deep transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                role="menuitem"
                tabIndex={-1}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <Link
              to="/eventos"
              className="inline-flex px-3 py-2 text-sm font-bold text-primary transition-colors hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              role="menuitem"
              tabIndex={-1}
            >
              Ver calendário completo →
            </Link>
          </div>
        </MegaMenuContent>
      </div>

      <Link
        to="/noticias"
        className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        activeProps={{ className: "text-deep" }}
      >
        Notícias
      </Link>
      <Link
        to="/cursos"
        className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        activeProps={{ className: "text-deep" }}
      >
        Cursos
      </Link>
      <Link
        to="/transparencia"
        className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        activeProps={{ className: "text-deep" }}
      >
        Transparência
      </Link>
      <Link
        to="/contato"
        className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        activeProps={{ className: "text-deep" }}
      >
        Contato
      </Link>
    </nav>
  );
}
