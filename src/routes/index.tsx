import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
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

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <img
          src={hero}
          alt="Atleta de natação cearense"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep/95 via-deep/80 to-deep/60" />
        <div className="relative mx-auto max-w-7xl px-6 flex items-center">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.2em] text-gold font-bold">
              Federação Cearense de Desportos Aquáticos
            </div>
            <h1 className="mt-4 text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
              Formando Campeões no Ceará desde 1958
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed">
              A FCDA é a instituição oficial que organiza e regulamenta todas as competições de
              natação, pólo aquático, nado artístico e saltos ornamentais no estado do Ceará.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/filie-se"
                className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-bold text-deep hover:opacity-90 transition"
              >
                Filie-se <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/sobre"
                className="inline-flex items-center gap-2 rounded-full border border-gold px-6 py-3 text-sm font-bold text-gold hover:bg-gold/10 transition"
              >
                Conheça a FCDA
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LINKS RÁPIDOS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Acesso Rápido
            </div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-deep">O que você procura?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/clubes"
              className="group rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-8 hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold text-deep mb-2">Conheça os Clubes</h3>
              <p className="text-sm text-muted-foreground">Encontre clubes de natação no Ceará</p>
            </Link>
            <Link
              to="/cursos"
              className="group rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-8 hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <GraduationCap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold text-deep mb-2">Cursos e Capacitações</h3>
              <p className="text-sm text-muted-foreground">Formação em desportos aquáticos</p>
            </Link>
            <Link
              to="/filie-se"
              className="group rounded-2xl bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30 p-8 hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <Award className="h-10 w-10 text-gold mb-4" />
              <h3 className="text-xl font-bold text-deep mb-2">Filiação</h3>
              <p className="text-sm text-muted-foreground">Fili seu clube à FCDA</p>
            </Link>
            <Link
              to="/transparencia"
              className="group rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-8 hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <FileText className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold text-deep mb-2">Portal da Transparência</h3>
              <p className="text-sm text-muted-foreground">Acesse documentos e informações</p>
            </Link>
          </div>
        </div>
      </section>

      {/* MODALIDADES */}
      <section className="py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Modalidades
            </div>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-deep">Desportos Aquáticos</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modalidades.map((mod) => (
              <Link
                key={mod.id}
                to="/modalidades"
                className="group rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all hover:-translate-y-1"
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
        </div>
      </section>

      {/* NOTÍCIAS */}
      {noticias.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                  Notícias
                </div>
                <h2 className="mt-3 text-4xl md:text-5xl font-bold text-deep">
                  Últimas Informações
                </h2>
              </div>
              <Link
                to="/noticias"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticias.slice(0, 3).map((n) => (
                <Link
                  key={n.id}
                  to={`/noticias/${n.id}`}
                  className="group rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[16/9] rounded-t-2xl overflow-hidden bg-gradient-to-br from-secondary to-secondary/50">
                    <img
                      src={n.imagem_url}
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
          </div>
        </section>
      )}

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
                <Link
                  to="/eventos"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-bold text-deep hover:opacity-90 transition"
                >
                  Ver calendário completo <ArrowRight className="h-4 w-4" />
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
            <Link
              to="/transparencia"
              className="group rounded-2xl bg-card border border-border/60 p-6 hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-deep mb-2">Código de Conduta</h3>
              <p className="text-sm text-muted-foreground">Políticas de combate ao assédio</p>
            </Link>
            <a
              href="https://www.cbda.org.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-card border border-border/60 p-6 hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <Trophy className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-deep mb-2">CBDA</h3>
              <p className="text-sm text-muted-foreground">Confederação Brasileira</p>
            </a>
            <Link
              to="/contato"
              className="group rounded-2xl bg-card border border-border/60 p-6 hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <MapPin className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-deep mb-2">Onde Treinar</h3>
              <p className="text-sm text-muted-foreground">Encontre piscinas no Ceará</p>
            </Link>
            <Link
              to="/cursos"
              className="group rounded-2xl bg-card border border-border/60 p-6 hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <GraduationCap className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-deep mb-2">Formação</h3>
              <p className="text-sm text-muted-foreground">Cursos e capacitações</p>
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
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
