import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Waves, Instagram, Facebook, Youtube, Mail, MapPin, Phone, Clock, FileText, Trophy, Users, Building2 } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const subscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    const { error } = await (supabase as any).from("newsletter_inscritos").insert({ email });
    setMessage(
      error ? "Este e-mail já está cadastrado ou não pôde ser salvo." : "Inscrição confirmada!",
    );
    if (!error) setEmail("");
  };
  return (
    <footer className="bg-hero text-primary-foreground mt-24">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
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
          <div className="mt-6 flex gap-3">
            <a
              href="https://www.instagram.com/fcdaquaticos/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 grid place-items-center rounded-full border border-primary-foreground/20 hover:bg-gold hover:text-deep hover:border-gold transition"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/fcdaquaticos/?locale=pt_BR"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 grid place-items-center rounded-full border border-primary-foreground/20 hover:bg-gold hover:text-deep hover:border-gold transition"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="h-10 w-10 grid place-items-center rounded-full border border-primary-foreground/20 hover:bg-gold hover:text-deep hover:border-gold transition opacity-50 cursor-not-allowed"
              aria-label="YouTube (em breve)"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Navegação</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/sobre" className="hover:text-gold transition-colors">
                A Federação
              </Link>
            </li>
            <li>
              <Link to="/modalidades" className="hover:text-gold transition-colors">
                Modalidades
              </Link>
            </li>
            <li>
              <Link to="/eventos" className="hover:text-gold transition-colors">
                Competições
              </Link>
            </li>
            <li>
              <Link to="/cursos" className="hover:text-gold transition-colors">
                Cursos
              </Link>
            </li>
            <li>
              <Link to="/noticias" className="hover:text-gold transition-colors">
                Notícias
              </Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-gold transition-colors">
                Contato
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Recursos</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/rankings" className="hover:text-gold transition-colors flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Rankings
              </Link>
            </li>
            <li>
              <Link to="/recordes" className="hover:text-gold transition-colors flex items-center gap-2">
                <FileText className="h-4 w-4" /> Recordes
              </Link>
            </li>
            <li>
              <Link to="/transparencia" className="hover:text-gold transition-colors flex items-center gap-2">
                <FileText className="h-4 w-4" /> Transparência
              </Link>
            </li>
            <li>
              <Link to="/filie-se" className="hover:text-gold transition-colors flex items-center gap-2">
                <Users className="h-4 w-4" /> Filie-se
              </Link>
            </li>
            <li>
              <Link to="/inscricoes" className="hover:text-gold transition-colors flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Inscrições
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Contato</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
              <span>Fortaleza, Ceará</span>
            </li>
            <li className="flex gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
              <span>(85) 98187-7327</span>
            </li>
            <li className="flex gap-2">
              <Mail className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
              <span>secretaria@fcda.org.br</span>
            </li>
            <li className="flex gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
              <span>Seg-Sex: 8h-18h</span>
            </li>
          </ul>
          <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-4 mt-6">Newsletter</h4>
          <p className="text-sm text-primary-foreground/70 mb-3">
            Receba notícias e competições da FCDA.
          </p>
          <form onSubmit={subscribe} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="min-w-0 flex-1 rounded-lg bg-primary-foreground px-3 py-2 text-sm text-foreground"
            />
            <button className="rounded-lg bg-gold px-3 py-2 text-sm font-bold text-deep hover:bg-gold/90 transition-colors">
              Enviar
            </button>
          </form>
          {message && <p className="mt-2 text-xs text-gold">{message}</p>}
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-primary-foreground/60 flex flex-col md:flex-row justify-between items-center gap-2">
          <span>Federação Cearense de Desportos Aquáticos</span>
          <span>CNPJ 07.961.535/0001-78</span>
          <span>
            © {new Date().getFullYear()} Site desenvolvido por MMC Sistemas computacionais. Todos os direitos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
}
