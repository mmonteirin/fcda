import { Mail, MapPin, Phone } from "lucide-react";

export function TopBar() {
  return (
    <div className="hidden border-b border-deep-foreground/15 bg-deep text-deep-foreground lg:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-6 text-xs">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5 text-deep-foreground/80">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Fortaleza, CE
          </span>
          <a
            href="mailto:secretaria@fcda.org.br"
            className="inline-flex items-center gap-1.5 text-deep-foreground/80 transition-colors hover:text-gold"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            secretaria@fcda.org.br
          </a>
          <a
            href="tel:+5585981877327"
            className="inline-flex items-center gap-1.5 text-deep-foreground/80 transition-colors hover:text-gold"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            (85) 98187-7327
          </a>
        </div>
        <span className="font-medium uppercase tracking-[0.14em] text-deep-foreground/65">
          Federação Cearense de Desportos Aquáticos
        </span>
      </div>
    </div>
  );
}
