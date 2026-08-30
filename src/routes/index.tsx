import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { HeroBanner } from "@/components/hero-banner";
import { SkeletonGrid, SkeletonHero } from "@/components/skeleton";
import { FeatureCard } from "@/components/ui/feature-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import {
  modalidadesQuery,
  noticiasQuery,
  eventosQuery,
  modalidadeImg,
  parceirosQuery,
} from "@/lib/site-queries";
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
} from "lucide-react";
import hero from "@/assets/hero-swimmer.jpg";

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

  // Filtrar eventos futuros — useMemo garante que new Date() é avaliado
  // apenas uma vez por render, evitando divergência server/cliente.
  const eventosFuturos = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return eventos.filter((e) => {
      if (!e.data_inicio) return false;
      const dataEvento = new Date(e.data_inicio);
      dataEvento.setHours(0, 0, 0, 0);
      return dataEvento >= hoje;
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

    // Adicionar notícias importantes com imagem
    noticias.slice(0, 3).forEach((noticia) => {
      if (noticia.imagem_url) {
        slides.push({
          id: noticia.id,
          title: noticia.titulo,
          description: noticia.resumo,
          image: noticia.imagem_url,
          link: `/noticias/${noticia.slug}`,
          linkText: "Ler mais",
        });
      }
    });

    // Se não tiver notícias suficientes, adicionar eventos futuros
    if (slides.length < 3) {
      eventosFuturos.slice(0, 3 - slides.length).forEach((evento) => {
        slides.push({
          id: `evento-${evento.id}`,
          title: evento.nome,
          description: `${evento.data_texto} • ${evento.local}`,
          image: hero,
          link: "/eventos",
          linkText: "Ver evento",
        });
      });
    }

    // Se ainda não tiver slides, adicionar um padrão
    if (slides.length === 0) {
      slides.push({
        id: "default",
        title: "Bem-vindo à FCDA",
        description: "Formando campeões no Ceará desde 1958",
        image: hero,
        link: "/sobre",
        linkText: "Conheça a FCDA",
      });
    }

    return slides;
  }, [noticias, eventosFuturos]);

  return (
    <SiteLayout>
      {/* HERO BANNER */}
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

      {/* LINKS RÁPIDOS */}
      <section className="py-24 animate-fade-in-up">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Acesso Rápido
            </div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-deep">O que você procura?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/clubes">
              <FeatureCard
                icon={Users}
                title="Conheça os Clubes"
                description="Encontre clubes de natação no Ceará"
                variant="emerald"
              />
            </Link>
            <Link to="/cursos">
              <FeatureCard
                icon={GraduationCap}
                title="Cursos e Capacitações"
                description="Formação em desportos aquáticos"
                variant="blue"
              />
            </Link>
            <Link to="/filie-se">
              <FeatureCard
                icon={Award}
                title="Filiação"
                description="Filie-se seu clube à FCDA"
                variant="gold"
              />
            </Link>
            <Link to="/transparencia">
              <FeatureCard
                icon={FileText}
                title="Portal da Transparência"
                description="Acesse documentos e informações"
                variant="purple"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* MODALIDADES */}
      <section className="py-24 bg-secondary/30 animate-fade-in-up">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Modalidades
            </div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-deep">Desportos Aquáticos</h2>
          </div>
          {modalidades.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modalidades.map((mod) => (
                <Link
                  key={mod.id}
                  to="/modalidades"
                  className="group rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-square rounded-t-2xl overflow-hidden bg-gradient-to-br from-secondary to-secondary/50">
                    <img
                      src={modalidadeImg(mod)}
                      alt={mod.nome}
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-deep group-hover:text-primary transition-colors">
                      {mod.nome}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <SkeletonGrid count={4} />
          )}
        </div>
      </section>

      {/* NOTÍCIAS */}
      <section className="py-24 animate-fade-in-up">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                Notícias
              </div>
              <h2 className="mt-3 text-4xl md:text-5xl font-bold text-deep">Últimas Informações</h2>
            </div>
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {noticias.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticias.slice(0, 3).map((n) => (
                <Link
                  key={n.id}
                  to="/noticias/$id"
                  params={{ id: n.slug }}
                  className="group rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-[16/9] rounded-t-2xl overflow-hidden bg-gradient-to-br from-secondary to-secondary/50">
                    <img
                      src={n.imagem_url ?? hero}
                      alt={n.titulo}
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-xs text-muted-foreground">{formatData(n.data)}</div>
                    <h3 className="mt-3 text-lg font-bold text-deep leading-tight group-hover:text-primary transition-colors">
                      {n.titulo}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{n.resumo}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <SkeletonGrid count={3} />
          )}
        </div>
      </section>

      {/* CALENDÁRIO */}
      {eventosFuturos.length > 0 && (
        <section className="py-24 bg-hero text-primary-foreground">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid lg:grid-cols-3 gap-12">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-gold font-bold">
                  Calendário
                </div>
                <h2 className="mt-3 text-4xl md:text-5xl font-bold">Próximas competições</h2>
                <p className="mt-6 text-primary-foreground/70 leading-relaxed">
                  Acompanhe as datas das principais competições oficiais organizadas pela FCDA.
                </p>
                <Link to="/eventos">
                  <ShimmerButton shimmerColor="rgba(201, 168, 76, 0.4)" className="mt-8 rounded-full">
                    Ver calendário completo <ArrowRight className="h-4 w-4 ml-2" />
                  </ShimmerButton>
                </Link>
              </div>
              <div className="lg:col-span-2 divide-y divide-primary-foreground/10">
                {eventosFuturos.slice(0, 5).map((e) => (
                  <div
                    key={e.id}
                    className="grid grid-cols-[auto_1fr_auto] gap-6 items-center py-5"
                  >
                    <div className="text-gold font-bold text-lg w-28">{e.data_texto}</div>
                    <div>
                      <div className="font-bold text-lg">{e.nome}</div>
                      <div className="text-sm text-primary-foreground/60">{e.local}</div>
                    </div>
                    <div className="hidden sm:block text-xs uppercase tracking-wider text-primary-foreground/60 border border-primary-foreground/20 rounded-full px-3 py-1">
                      {e.modalidade}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ESTATÍSTICAS */}
      <section className="py-24 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-gold font-bold">
              Números da FCDA
            </div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold">Nossa História</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-gold mb-2">67+</div>
              <div className="text-lg text-primary-foreground/80">Anos de História</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-gold mb-2">5</div>
              <div className="text-lg text-primary-foreground/80">Modalidades</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-gold mb-2">100+</div>
              <div className="text-lg text-primary-foreground/80">Clubes Filiados</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-gold mb-2">1000+</div>
              <div className="text-lg text-primary-foreground/80">Atletas</div>
            </div>
          </div>
        </div>
      </section>

      {/* LINKS IMPORTANTES */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Informações Importantes
            </div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-deep">Links Úteis</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/transparencia">
              <FeatureCard
                icon={Shield}
                title="Código de Conduta"
                description="Políticas de combate ao assédio"
                variant="emerald"
                size="sm"
              />
            </Link>
            <a
              href="https://www.cbda.org.br/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FeatureCard
                icon={Trophy}
                title="CBDA"
                description="Confederação Brasileira"
                variant="gold"
                size="sm"
              />
            </a>
            <Link to="/contato">
              <FeatureCard
                icon={MapPin}
                title="Onde Treinar"
                description="Encontre piscinas no Ceará"
                variant="blue"
                size="sm"
              />
            </Link>
            <Link to="/cursos">
              <FeatureCard
                icon={GraduationCap}
                title="Formação"
                description="Cursos e capacitações"
                variant="purple"
                size="sm"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* PARCEIROS */}
      {parceiros.length > 0 && (
        <section className="py-24 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-12">
              <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                Nossos Parceiros
              </div>
              <h2 className="mt-3 text-4xl md:text-5xl font-bold text-deep">
                Quem apoia o esporte aquático no Ceará
              </h2>
            </div>

            {/* Apoio Institucional */}
            {parceiros.filter((p) => p.categoria === "apoio_institucional").length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <Building2 className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-deep">Apoio Institucional</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {parceiros
                    .filter((p) => p.categoria === "apoio_institucional")
                    .map((parceiro) => (
                      <ParceiroCard key={parceiro.id} parceiro={parceiro} />
                    ))}
                </div>
              </div>
            )}

            {/* Patrocínio */}
            {parceiros.filter((p) => p.categoria === "patrocinio").length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <Medal className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-deep">Patrocinadores</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                <div className="flex items-center gap-3 mb-8">
                  <Handshake className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-deep">Parcerias Estratégicas</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        className="group relative flex items-center justify-center p-6 rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all duration-300 hover:border-primary/50"
      >
        {parceiro.logo_url ? (
          <img
            src={parceiro.logo_url}
            alt={parceiro.nome}
            className="max-h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        ) : (
          <div className="text-center">
            <div className="text-sm font-semibold text-deep group-hover:text-primary transition-colors">
              {parceiro.nome}
            </div>
          </div>
        )}
      </a>
    );
  }

  return (
    <div className="group relative flex items-center justify-center p-6 rounded-2xl bg-card border border-border/60 shadow-card">
      {parceiro.logo_url ? (
        <img
          src={parceiro.logo_url}
          alt={parceiro.nome}
          className="max-h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
        />
      ) : (
        <div className="text-center">
          <div className="text-sm font-semibold text-deep">{parceiro.nome}</div>
        </div>
      )}
    </div>
  );
}

function formatData(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}
