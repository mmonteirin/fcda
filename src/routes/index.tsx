import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { HeroBanner } from "@/components/features/hero";
import { SkeletonGrid, SkeletonHero } from "@/components/skeleton";
import {
  modalidadesQuery,
  noticiasQuery,
  eventosQuery,
  modalidadeImg,
  parceirosQuery,
} from "@/lib/api/site-queries";
import {
  ArrowRight,
  Calendar,
  Trophy,
  Users,
  Waves,
  Building2,
  Handshake,
  Medal,
  Shield,
  FileText,
  MapPin,
  GraduationCap,
  Award,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Phone,
  Mail,
} from "lucide-react";
import hero from "@/assets/images/hero-swimmer.jpg";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(modalidadesQuery),
      context.queryClient.ensureQueryData(noticiasQuery(true)),
      context.queryClient.ensureQueryData(eventosQuery()),
      context.queryClient.ensureQueryData(parceirosQuery(true)),
    ]),
  component: Home,
});

function Home() {
  const modalidades = useSuspenseQuery(modalidadesQuery).data;
  const noticias = useSuspenseQuery(noticiasQuery(true)).data;
  const eventos = useSuspenseQuery(eventosQuery()).data;
  const parceiros = useSuspenseQuery(parceirosQuery(true)).data;

  // Filtrar eventos futuros ordenados cronologicamente
  const eventosFuturos = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return eventos
      .filter((e) => {
        if (!e.data_inicio) return false;
        const dataEvento = new Date(e.data_inicio);
        dataEvento.setHours(0, 0, 0, 0);
        return dataEvento >= hoje;
      })
      .sort((a, b) => {
        if (!a.data_inicio) return 1;
        if (!b.data_inicio) return -1;
        return new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime();
      });
  }, [eventos]);

  // Criar slides para o banner de destaque
  const bannerSlides = useMemo(() => {
    const slides: Array<{
      id: string;
      title: string;
      description: string;
      image: string;
      link?: string;
      linkText?: string;
    }> = [];

    // Adicionar notícias com imagem ou texto
    noticias.slice(0, 3).forEach((noticia) => {
      slides.push({
        id: noticia.id,
        title: noticia.titulo,
        description: noticia.resumo,
        image: noticia.imagem_url || hero,
        link: `/noticias/${noticia.slug}`,
        linkText: "Ler matéria completa",
      });
    });

    // Se não tiver notícias suficientes, preencher com os próximos eventos
    if (slides.length < 3) {
      eventosFuturos.slice(0, 3 - slides.length).forEach((evento) => {
        slides.push({
          id: `evento-${evento.id}`,
          title: evento.nome,
          description: `${evento.data_texto || ""} • ${evento.local || ""}`,
          image: evento.imagem_url || hero,
          link: `/eventos/${evento.id}`,
          linkText: "Ver detalhes da prova",
        });
      });
    }

    if (slides.length === 0) {
      slides.push({
        id: "default",
        title: "Federação Cearense de Desportos Aquáticos",
        description: "Formando campeões e desenvolvendo a natação no Ceará desde 1958.",
        image: hero,
        link: "/sobre",
        linkText: "Conheça a FCDA",
      });
    }

    return slides;
  }, [noticias, eventosFuturos]);

  return (
    <SiteLayout>
      {/* ── HERO BANNER INSTITUCIONAL DE ALTO IMPACTO ── */}
      {bannerSlides.length > 0 ? (
        <HeroBanner
          slides={bannerSlides}
          eventos={eventosFuturos}
          autoPlay={true}
          interval={5000}
        />
      ) : (
        <SkeletonHero />
      )}

      {/* ── PORTAIS & SERVIÇOS FCDA (ACESSO RÁPIDO) ── */}
      <section className="py-20 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-bold">
                Serviços & Portais
              </div>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-deep tracking-tight">
                Acesso Rápido
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Acesse os sistemas oficiais de filiação, rankings, eventos e prestação de contas da
              FCDA.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Calendário & Inscrições */}
            <Link
              to="/eventos"
              className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-elegant"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 mb-5 group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-deep mb-2 group-hover:text-primary transition-colors">
                  Calendário de Eventos
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Confira datas de todas as etapas, balizamentos, regulamentos e links de inscrição
                  oficiais.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold text-primary">
                <span>Acessar calendário</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Ranking Temporada 2026 */}
            <Link
              to="/ranking-temporada-2026"
              className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-elegant"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold mb-5 group-hover:scale-110 transition-transform">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-deep mb-2 group-hover:text-primary transition-colors">
                  Ranking Temporada 2026
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tabela acumulada de pontuação por clubes e atletas no Circuito Cearense de
                  Natação.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold text-gold">
                <span>Ver pontuação geral</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. Clubes Filiados */}
            <Link
              to="/clubes"
              className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-elegant"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-700 dark:text-blue-300 mb-5 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-deep mb-2 group-hover:text-primary transition-colors">
                  Clubes Filiados
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Encontre agremiações, academias e polos de treinamento de natação cadastrados no
                  Ceará.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold text-primary">
                <span>Conhecer a rede</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 4. Portal da Transparência */}
            <Link
              to="/transparencia"
              className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/50 hover:shadow-elegant"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-700 dark:text-purple-300 mb-5 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-deep mb-2 group-hover:text-primary transition-colors">
                  Portal da Transparência
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Boletins oficiais, regulamentos, prestações de contas, atas e relação oficial de
                  atletas.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold text-primary">
                <span>Consultar documentos</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 5. Cursos & Capacitação */}
            <Link
              to="/cursos"
              className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/50 hover:shadow-elegant"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300 mb-5 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-deep mb-2 group-hover:text-primary transition-colors">
                  Cursos & Capacitação
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Programas de formação e atualização profissional para técnicos, árbitros e
                  preparadores físicos.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold text-primary">
                <span>Ver cursos abertos</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 6. Filiação & Vinculação */}
            <Link
              to="/filie-se"
              className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-elegant"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold mb-5 group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-deep mb-2 group-hover:text-primary transition-colors">
                  Filiação Oficial
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Saiba como filiar seu clube à FCDA e garantir a participação oficial no calendário
                  esportivo.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold text-gold">
                <span>Filie seu clube</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── MODALIDADES AQUÁTICAS EM CORES VIBRANTES ── */}
      <section className="py-20 lg:py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-bold">
                Esportes Federados
              </div>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-deep tracking-tight">
                Nossas Modalidades
              </h2>
            </div>
            <Link
              to="/modalidades"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-deep hover:underline"
            >
              Ver todas as modalidades <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {modalidades.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {modalidades.map((mod) => (
                <Link
                  key={mod.id}
                  to="/modalidades"
                  className="group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-border/70 bg-card min-h-[300px] shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-elegant hover:border-primary/50"
                >
                  <img
                    src={modalidadeImg(mod)}
                    alt={mod.nome}
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  {/* Gradiente escuro para legibilidade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-transparent" />

                  <div className="relative z-10 p-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold mb-1 block">
                      FCDA • Oficial
                    </span>
                    <h3 className="text-2xl font-black text-white leading-tight group-hover:text-gold transition-colors">
                      {mod.nome}
                    </h3>
                    {mod.descricao && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-white/80 leading-relaxed">
                        {mod.descricao}
                      </p>
                    )}
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-gold group-hover:translate-x-1 transition-transform">
                      <span>Saiba mais</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <SkeletonGrid count={4} />
          )}
        </div>
      </section>

      {/* ── NOTÍCIAS & COMUNICAÇÃO OFICIAL ── */}
      <section className="py-20 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-bold">
                Comunicação
              </div>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-deep tracking-tight">
                Últimas Notícias
              </h2>
            </div>
            <Link
              to="/noticias"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-deep hover:underline"
            >
              Portal de notícias completo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {noticias.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticias.slice(0, 3).map((n) => (
                <Link
                  key={n.id}
                  to="/noticias/$id"
                  params={{ id: n.slug }}
                  className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant hover:border-primary/50"
                >
                  <div>
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
                      <img
                        src={n.imagem_url || hero}
                        alt={n.titulo}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-gold/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-deep shadow-xs">
                          {n.categoria}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground font-semibold">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatData(n.data)}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-deep leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {n.titulo}
                      </h3>
                      {n.resumo && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {n.resumo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-border/40 mt-4 flex items-center justify-between text-xs font-bold text-primary">
                    <span>Ler matéria completa</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <SkeletonGrid count={3} />
          )}
        </div>
      </section>

      {/* ── PRÓXIMAS COMPETIÇÕES (CALENDÁRIO DINÂMICO) ── */}
      {eventosFuturos.length > 0 && (
        <section className="py-20 lg:py-24 bg-hero text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 items-start">
              {/* Coluna Esquerda: Apresentação */}
              <div className="lg:col-span-4 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold border border-gold/30">
                  <Calendar className="h-3.5 w-3.5" />
                  Calendário Oficial
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Próximas Competições
                </h2>

                <p className="text-base text-primary-foreground/80 leading-relaxed">
                  Confira as etapas e festivais homologados pela FCDA no estado do Ceará. Fique
                  atento às datas de balizamento e encerramento das inscrições.
                </p>

                <div className="pt-2">
                  <Link
                    to="/eventos"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold px-6 py-3.5 text-sm font-bold text-deep shadow-[0_4px_20px_rgba(212,175,55,0.35)] transition-all hover:scale-105 active:scale-95"
                  >
                    Ver Calendário Anual 2026
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Coluna Direita: Lista de Próximos Eventos */}
              <div className="lg:col-span-8 space-y-3.5">
                {eventosFuturos.slice(0, 4).map((e) => (
                  <Link
                    key={e.id}
                    to="/eventos/$id"
                    params={{ id: e.id }}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-gold/40 hover:shadow-card"
                  >
                    <div className="flex items-start gap-4">
                      {/* Box com Data em Destaque */}
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gold-gradient text-deep font-black shadow-xs">
                        <Calendar className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gold">
                            {e.data_texto ||
                              (e.data_inicio ? formatData(e.data_inicio) : "Data a definir")}
                          </span>
                          <span className="text-white/40">•</span>
                          <span className="text-[11px] font-semibold text-primary-foreground/75 uppercase tracking-wider">
                            {e.modalidade || "Natação"}
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-gold transition-colors leading-snug">
                          {e.nome}
                        </h3>

                        {e.local && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-primary-foreground/70">
                            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{e.local}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="text-xs font-bold text-gold group-hover:translate-x-1 transition-transform">
                        Detalhes do evento
                      </span>
                      <ChevronRight className="h-4 w-4 text-gold group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── PARCEIROS & APOIO INSTITUCIONAL ── */}
      {parceiros.length > 0 && (
        <section className="py-20 lg:py-24 bg-background border-t border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-xs uppercase tracking-[0.22em] text-primary font-bold">
                Parcerias
              </div>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-deep tracking-tight">
                Quem Apoia o Esporte Aquático no Ceará
              </h2>
            </div>

            {/* Apoio Institucional */}
            {parceiros.filter((p) => p.categoria === "apoio_institucional").length > 0 && (
              <div className="mb-14">
                <div className="flex items-center gap-2.5 mb-6 text-sm font-bold text-deep uppercase tracking-wider">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span>Apoio Institucional</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {parceiros
                    .filter((p) => p.categoria === "apoio_institucional")
                    .map((parceiro) => (
                      <ParceiroCard key={parceiro.id} parceiro={parceiro} />
                    ))}
                </div>
              </div>
            )}

            {/* Patrocinadores */}
            {parceiros.filter((p) => p.categoria === "patrocinio").length > 0 && (
              <div className="mb-14">
                <div className="flex items-center gap-2.5 mb-6 text-sm font-bold text-deep uppercase tracking-wider">
                  <Medal className="h-5 w-5 text-gold" />
                  <span>Patrocinadores Oficiais</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {parceiros
                    .filter((p) => p.categoria === "patrocinio")
                    .map((parceiro) => (
                      <ParceiroCard key={parceiro.id} parceiro={parceiro} />
                    ))}
                </div>
              </div>
            )}

            {/* Parcerias */}
            {parceiros.filter((p) => p.categoria === "parceria").length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-6 text-sm font-bold text-deep uppercase tracking-wider">
                  <Handshake className="h-5 w-5 text-primary" />
                  <span>Parcerias Estratégicas</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {parceiros
                    .filter((p) => p.categoria === "parceria")
                    .map((parceiro) => (
                      <ParceiroCard key={parceiro.id} parceiro={parceiro} />
                    ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── BANNER FINAL DE CONVERSÃO / PARTICIPAÇÃO ── */}
      <section className="py-16 bg-gradient-to-br from-deep via-deep/95 to-[#021712] text-primary-foreground relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold border border-gold/30">
            <Waves className="h-3.5 w-3.5 text-gold" />
            Faça Parte da Natação Cearense
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto">
            Filie seu clube ou atleta e participe do circuito oficial
          </h2>

          <p className="text-base sm:text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            A Federação Cearense de Desportos Aquáticos apoia atletas, clubes e técnicos com
            competições de padrão nacional, capacitação e homologação de recordes.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/filie-se"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold px-7 py-3.5 text-sm sm:text-base font-bold text-deep shadow-[0_4px_20px_rgba(212,175,55,0.35)] transition-all hover:scale-105 active:scale-95"
            >
              Iniciar Filiação
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/contato"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-7 py-3.5 text-sm sm:text-base font-bold text-white backdrop-blur-md transition-all active:scale-95"
            >
              Fale com a Secretaria
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function ParceiroCard({ parceiro }: { parceiro: any }) {
  /* eslint-enable @typescript-eslint/no-explicit-any */
  if (parceiro.site_url) {
    return (
      <a
        href={parceiro.site_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center p-5 rounded-2xl bg-card border border-border/70 shadow-sm hover:shadow-card hover:border-primary/50 transition-all duration-300 min-h-[90px]"
        title={parceiro.nome}
      >
        {parceiro.logo_url ? (
          <img
            src={parceiro.logo_url}
            alt={parceiro.nome}
            className="max-h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-center text-xs font-bold text-deep group-hover:text-primary transition-colors">
            {parceiro.nome}
          </div>
        )}
      </a>
    );
  }

  return (
    <div className="relative flex items-center justify-center p-5 rounded-2xl bg-card border border-border/70 shadow-sm min-h-[90px]">
      {parceiro.logo_url ? (
        <img
          src={parceiro.logo_url}
          alt={parceiro.nome}
          className="max-h-12 w-auto object-contain"
        />
      ) : (
        <div className="text-center text-xs font-bold text-deep">{parceiro.nome}</div>
      )}
    </div>
  );
}

function formatData(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return dateStr;
  }
}
