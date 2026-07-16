import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

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
  "Calendário",
  "Resultados",
  "Ranking",
  "Recordes",
  "Regulamentos",
  "Start Lists",
  "Fotos",
] as const;

type MegaMenuName = "modalidades" | "competicoes";

function MenuTrigger({
  label,
  isOpen,
  onClick,
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {label}
      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
    </button>
  );
}

export function DesktopNav() {
  const [openMenu, setOpenMenu] = useState<MegaMenuName | null>(null);

  const menuEvents = (menu: MegaMenuName) => ({
    onMouseEnter: () => setOpenMenu(menu),
    onMouseLeave: () => setOpenMenu(null),
    onFocus: () => setOpenMenu(menu),
    onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenu(null);
    },
  });

  return (
    <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Navegação principal">
      <Link
        to="/"
        className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep"
        activeOptions={{ exact: true }}
        activeProps={{ className: "text-deep" }}
      >
        Início
      </Link>
      <Link
        to="/sobre"
        className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep"
        activeProps={{ className: "text-deep" }}
      >
        A FCDA
      </Link>

      <div className="relative" {...menuEvents("modalidades")}>
        <MenuTrigger
          label="Modalidades"
          isOpen={openMenu === "modalidades"}
          onClick={() => setOpenMenu(openMenu === "modalidades" ? null : "modalidades")}
        />
        {openMenu === "modalidades" && (
          <div className="absolute left-0 top-full z-50 mt-3 w-[34rem] rounded-2xl border border-border/80 bg-card p-3 shadow-elegant">
            <div className="grid grid-cols-2 gap-1">
              {modalidades.map((modalidade) => (
                <Link
                  key={modalidade.label}
                  to="/modalidades"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-deep transition-colors hover:bg-secondary"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-base">
                    {modalidade.icon}
                  </span>
                  {modalidade.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <Link
                to="/modalidades"
                className="inline-flex px-3 py-2 text-sm font-bold text-primary transition-colors hover:text-deep"
              >
                Conheça todas as modalidades →
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="relative" {...menuEvents("competicoes")}>
        <MenuTrigger
          label="Competições"
          isOpen={openMenu === "competicoes"}
          onClick={() => setOpenMenu(openMenu === "competicoes" ? null : "competicoes")}
        />
        {openMenu === "competicoes" && (
          <div className="absolute left-0 top-full z-50 mt-3 w-60 rounded-2xl border border-border/80 bg-card p-3 shadow-elegant">
            <div className="space-y-1">
              {competicoes.map((item) => (
                <Link
                  key={item}
                  to="/eventos"
                  className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-deep transition-colors hover:bg-secondary"
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <Link
                to="/eventos"
                className="inline-flex px-3 py-2 text-sm font-bold text-primary transition-colors hover:text-deep"
              >
                Ver calendário completo →
              </Link>
            </div>
          </div>
        )}
      </div>

      <Link
        to="/noticias"
        className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep"
        activeProps={{ className: "text-deep" }}
      >
        Notícias
      </Link>
      <a
        href="mailto:secretaria@fcda.org.br?subject=Informa%C3%A7%C3%B5es%20sobre%20cursos"
        className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep"
      >
        Cursos
      </a>
      <Link
        to="/transparencia"
        className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep"
        activeProps={{ className: "text-deep" }}
      >
        Transparência
      </Link>
      <Link
        to="/contato"
        className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-deep"
        activeProps={{ className: "text-deep" }}
      >
        Contato
      </Link>
    </nav>
  );
}
