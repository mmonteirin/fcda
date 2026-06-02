import { Link } from "@tanstack/react-router";
import { Waves, Instagram, Facebook, Youtube, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-hero text-primary-foreground mt-24">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-gradient">
              <Waves className="h-5 w-5 text-deep" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
                FCDA
              </div>
              <div className="font-bold text-lg">Federação Cearense de Desportos Aquáticos</div>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm text-primary-foreground/70 leading-relaxed">
            Promovendo, organizando e desenvolvendo os desportos aquáticos no estado do Ceará desde
            1958. Filiada à Confederação Brasileira de Desportos Aquáticos.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Navegação</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/sobre" className="hover:text-gold">
                A Federação
              </Link>
            </li>
            <li>
              <Link to="/modalidades" className="hover:text-gold">
                Modalidades
              </Link>
            </li>
            <li>
              <Link to="/noticias" className="hover:text-gold">
                Notícias
              </Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-gold">
                Contato
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Contato</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gold" /> Fortaleza, Ceará
            </li>
            <li className="flex gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-gold" /> (85) 98187-7327
            </li>
            <li className="flex gap-2">
              <Mail className="h-4 w-4 mt-0.5 text-gold" /> secretaria@fcda.org.br
            </li>
          </ul>
          <div className="mt-5 flex gap-3">
            <a
              href="#"
              className="h-9 w-9 grid place-items-center rounded-full border border-primary-foreground/20 hover:bg-gold hover:text-deep hover:border-gold transition"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="h-9 w-9 grid place-items-center rounded-full border border-primary-foreground/20 hover:bg-gold hover:text-deep hover:border-gold transition"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="h-9 w-9 grid place-items-center rounded-full border border-primary-foreground/20 hover:bg-gold hover:text-deep hover:border-gold transition"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-primary-foreground/60 flex flex-col md:flex-row justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Federação Cearense de Desportos Aquáticos. Todos os
            direitos reservados.
          </span>
          <span>CNPJ 07.961.535/0001-78</span>
        </div>
      </div>
    </footer>
  );
}
