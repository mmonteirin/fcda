import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CalendarDays,
  Building2,
  MapPin,
  Sparkles,
  ShieldCheck,
  Trophy,
  Users,
  ChevronRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/images/hero-swimmer.webp";

interface BannerSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  linkText?: string;
}

interface Evento {
  id: string;
  nome: string;
  data_texto: string;
  local: string;
  modalidade?: string;
  status?: string | null;
  link?: string;
}

interface HeroBannerProps {
  slides: BannerSlide[];
  eventos: Evento[];
  autoPlay?: boolean;
  interval?: number;
}

function getFcdaAnniversary() {
  const today = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const parts = Object.fromEntries(today.map(({ type, value }) => [type, Number(value)]));
  const alreadyCelebrated = parts.month > 6 || (parts.month === 6 && parts.day >= 6);
  return {
    age: parts.year - 1958 - (alreadyCelebrated ? 0 : 1),
    year: parts.year,
  };
}

export function HeroBanner({ slides, eventos }: HeroBannerProps) {
  if (slides.length === 0) return null;

  const mainSlide = slides[0];
  const secondarySlide = slides[1] || slides[0];
  const proximoEvento = eventos.length > 0 ? eventos[0] : null;
  const aniversario = getFcdaAnniversary();

  return (
    <section className="relative overflow-hidden bg-hero text-primary-foreground pt-8 pb-12 lg:pt-12 lg:pb-16 animate-fade-in">
      {/* Luzes de fundo e textura sutil */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute top-0 right-1/4 -mt-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-20 h-80 w-80 rounded-full bg-gold/15 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* CABEÇALHO HERO COM IDENTIDADE OFICIAL */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-primary-foreground/15 pb-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gold border border-gold/30 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Desde 1958 • {aniversario.age} anos de história
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              O Esporte Aquático no Ceará em Movimento
            </h1>

            <p className="text-base sm:text-lg text-primary-foreground/80 leading-relaxed max-w-2xl">
              Acompanhe o calendário oficial de competições, rankings estaduais, recordes e as
              últimas notícias da natação e águas abertas cearenses.
            </p>
          </div>

          {/* Botões de Ação Rápida no Topo */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/eventos"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold px-5 py-3 text-sm font-bold text-deep shadow-[0_4px_20px_rgba(212,175,55,0.35)] transition-all hover:scale-105 hover:shadow-[0_6px_25px_rgba(212,175,55,0.45)] active:scale-95"
            >
              <Calendar className="h-4 w-4 text-deep" />
              Calendário 2026
            </Link>

            <Link
              to="/ranking-temporada-2026"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all active:scale-95"
            >
              <Trophy className="h-4 w-4 text-gold" />
              Rankings
            </Link>
          </div>
        </div>

        {/* BENTO GRID DE DESTAQUES VISUAIS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[460px]">
          {/* Card 1: Destaque Principal (7 Colunas) */}
          <Link
            to={mainSlide.link || "/noticias"}
            className="group relative lg:col-span-7 flex flex-col justify-end overflow-hidden rounded-3xl border border-white/15 bg-deep min-h-[340px] sm:min-h-[420px] shadow-elegant transition-all duration-500 hover:border-gold/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <img
              src={mainSlide.image || heroImg}
              alt={mainSlide.title}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-85"
            />
            {/* Gradiente escuro para legibilidade perfeita */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/10" />

            <div className="relative z-10 p-6 sm:p-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-deep shadow-xs">
                Destaque Principal
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight group-hover:text-gold transition-colors duration-300">
                {mainSlide.title}
              </h2>

              {mainSlide.description && (
                <p className="mt-2.5 line-clamp-2 text-sm sm:text-base text-white/85 max-w-xl">
                  {mainSlide.description}
                </p>
              )}

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold group-hover:translate-x-1 transition-transform">
                <span>{mainSlide.linkText || "Acessar conteúdo"}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* Coluna da Direita (5 Colunas: 2 Cards Empilhados) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Card 2: Próxima Competição em Destaque */}
            {proximoEvento ? (
              <Link
                to="/eventos"
                className="group relative flex-1 flex flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-emerald-950/80 via-deep/90 to-[#021712]/95 p-6 backdrop-blur-md shadow-card transition-all duration-300 hover:border-emerald-400/50 hover:shadow-elegant"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Próxima Competição
                  </div>
                  <span className="text-xs font-semibold text-primary-foreground/60 border border-white/15 rounded-full px-2.5 py-0.5">
                    {proximoEvento.modalidade || "Natação"}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gold font-bold text-sm mb-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{proximoEvento.data_texto}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors leading-snug line-clamp-2">
                    {proximoEvento.nome}
                  </h3>

                  {proximoEvento.local && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-primary-foreground/75 truncate">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{proximoEvento.local}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-gold">
                  <span>Ver calendário e inscrições</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ) : null}

            {/* Card 3: Notícia Secundária ou Destaque Esportivo */}
            {secondarySlide && secondarySlide.id !== mainSlide.id ? (
              <Link
                to={secondarySlide.link || "/noticias"}
                className="group relative flex-1 flex flex-col justify-end overflow-hidden rounded-3xl border border-white/15 bg-deep min-h-[190px] shadow-card transition-all duration-500 hover:border-gold/50"
              >
                <img
                  src={secondarySlide.image || heroImg}
                  alt={secondarySlide.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                <div className="relative z-10 p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold mb-1 inline-block">
                    Em Evidência
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors leading-snug line-clamp-2">
                    {secondarySlide.title}
                  </h3>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white/80">
                    Ler mais <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ) : (
              <Link
                to="/ranking-temporada-2026"
                className="group relative flex-1 flex flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-gold/20 via-deep/90 to-deep p-6 backdrop-blur-md shadow-card transition-all duration-300 hover:border-gold/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-deep font-bold shadow-xs">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gold">
                    Oficial FCDA
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors leading-snug">
                    Ranking da Temporada 2026
                  </h3>
                  <p className="mt-1 text-xs text-primary-foreground/75 leading-relaxed">
                    Confira a pontuação acumulada dos clubes e atletas nas etapas do campeonato
                    cearense.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-gold">
                  <span>Acessar tabela de pontuação</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* FAIXA INFERIOR COM NÚMEROS DA FEDERAÇÃO */}
        <section aria-label="Números da FCDA" className="mt-8 overflow-hidden rounded-3xl border border-white/15 bg-[#041c18]/70 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="grid grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
            {[
              { value: aniversario.age, label: "Anos de história", context: "Desde 6 de junho de 1958", icon: CalendarDays },
              { value: "2.062", label: "Atletas ativos", context: "Na entidade", icon: Users },
              { value: "107", label: "Clubes ativos", context: "Na entidade", icon: Building2 },
              { value: "84", label: "Árbitros ativos", context: "Na entidade", icon: ShieldCheck },
            ].map(({ value, label, context, icon: Icon }) => (
              <div key={label} className="group flex min-h-32 flex-col items-center justify-center px-3 py-5 text-center transition-colors hover:bg-white/5 motion-reduce:transition-none sm:min-h-36 sm:px-5">
                <Icon aria-hidden="true" className="mb-2 h-4 w-4 text-gold/90 transition-transform group-hover:-translate-y-0.5 motion-reduce:transition-none" />
                <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground/90 sm:text-sm">{label}</p>
                <p className="mt-1 text-[11px] text-primary-foreground/60">{context}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
