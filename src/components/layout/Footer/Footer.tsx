import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Waves, Instagram, Facebook, Youtube, Mail, MapPin, Phone } from "lucide-react";

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
              <Link to="/cursos" className="hover:text-gold">
                Cursos
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
          <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Newsletter</h4>
          <p className="text-sm text-primary-foreground/70">
            Receba notícias e competições da FCDA.
          </p>
          <form onSubmit={subscribe} className="mt-3 flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="min-w-0 flex-1 rounded-lg bg-primary-foreground px-3 py-2 text-sm text-foreground"
            />
            <button className="rounded-lg bg-gold px-3 py-2 text-sm font-bold text-deep">
              Enviar
            </button>
          </form>
          {message && <p className="mt-2 text-xs text-gold">{message}</p>}
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
              href="https://www.instagram.com/fcdaquaticos/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 grid place-items-center rounded-full border border-primary-foreground/20 hover:bg-gold hover:text-deep hover:border-gold transition"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/fcdaquaticos/?locale=pt_BR"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 grid place-items-center rounded-full border border-primary-foreground/20 hover:bg-gold hover:text-deep hover:border-gold transition"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="h-9 w-9 grid place-items-center rounded-full border border-primary-foreground/20 hover:bg-gold hover:text-deep hover:border-gold transition opacity-50 cursor-not-allowed"
              aria-label="YouTube (em breve)"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-primary-foreground/60 flex flex-col md:flex-row justify-between gap-2">
          <span>Federação Cearense de Desportos Aquáticos.</span>
          <span>
            © {new Date().getFullYear()} Site desenvolvido e todos os direitos reservados por MMC
            Sistemas computacionais.{" "}
          </span>
          <span>CNPJ 07.961.535/0001-78</span>
        </div>
      </div>
    </footer>
  );
}
