import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { modalidadesQuery, noticiasQuery, eventosQuery, modalidadeImg } from "@/lib/site-queries";
import { ArrowRight, Calendar, Trophy, Users, Waves } from "lucide-react";
import hero from "@/assets/hero-swimmer.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FCDA — Federação Cearense de Desportos Aquáticos" },
      {
        name: "description",
        content:
          "Entidade oficial dos desportos aquáticos do Ceará: natação, polo aquático, saltos, nado artístico e maratona aquática.",
      },
      { property: "og:title", content: "FCDA — Federação Cearense de Desportos Aquáticos" },
      {
        property: "og:description",
        content: "Notícias, calendário, modalidades e atletas dos esportes aquáticos do Ceará.",
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(modalidadesQuery),
      context.queryClient.ensureQueryData(noticiasQuery(true)),
      context.queryClient.ensureQueryData(eventosQuery()),
    ]),
  errorComponent: ({ error }) => <div className="p-12 text-destructive">Erro: {error.message}</div>,
  component: Home,
});

function formatData(d: string) {
  try {
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function Home() {
  const modalidades = useSuspenseQuery(modalidadesQuery).data;
  const noticias = useSuspenseQuery(noticiasQuery(true)).data;
  const eventos = useSuspenseQuery(eventosQuery()).data;

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
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep/95 via-deep/75 to-deep/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-32 w-full">
          <div className="max-w-2xl text-primary-foreground">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              <Waves className="h-3.5 w-3.5" /> Temporada 2026
            </div>
            <h1 className="mt-6 text-5xl md:text-7xl font-bold leading-[1.02]">
              A força das <span className="text-gold">águas</span>
              <br />
              do Ceará.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 leading-relaxed max-w-xl">
              Seis décadas de dedicação aos esportes aquáticos, revelando talentos, promovendo
              conquistas e construindo histórias de sucesso no Ceará.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/modalidades"
                className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-bold text-deep hover:opacity-90 transition shadow-elegant"
              >
                Conheça as modalidades <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/noticias"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-7 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary-foreground/10 transition"
              >
                Calendário
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg border-t border-primary-foreground/15 pt-8">
              <div>
                <div className="text-3xl font-bold text-gold">60+</div>
                <div className="text-xs uppercase tracking-wider text-primary-foreground/60 mt-1">
                  Anos de história
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold">7</div>
                <div className="text-xs uppercase tracking-wider text-primary-foreground/60 mt-1">
                  Clubes filiados
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold">291</div>
                <div className="text-xs uppercase tracking-wider text-primary-foreground/60 mt-1">
                  Atletas ativos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESTAQUE / MISSÃO */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Trophy,
              title: "Competições oficiais",
              desc: "Organizamos todos os campeonatos estaduais reconhecidos pela CBDA.",
            },
            {
              icon: Users,
              title: "Formação de atletas",
              desc: "Investimos em programas de base e categorias formadoras em todo o estado.",
            },
            {
              icon: Calendar,
              title: "Calendário ativo",
              desc: "Mais de 30 competições oficiais e festivais ao longo da temporada.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-card p-8 shadow-card border border-border/60"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-gradient grid place-items-center text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-deep">{f.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODALIDADES GRID */}
      <section className="py-24 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                Modalidades
              </div>
              <h2 className="mt-3 text-4xl md:text-5xl font-bold text-deep">
                Cinco esportes,
                <br />
                uma mesma paixão.
              </h2>
            </div>
            <Link
              to="/modalidades"
              className="text-sm font-bold text-deep hover:text-primary inline-flex items-center gap-2"
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {modalidades.map((m, i) => (
              <Link
                key={m.id}
                to="/modalidades"
                className={`group relative overflow-hidden rounded-2xl shadow-card ${i === 0 ? "lg:row-span-2 lg:col-span-1" : ""}`}
              >
                <img
                  src={modalidadeImg(m)}
                  alt={m.nome}
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 ? "h-full min-h-[400px]" : "h-64"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                  <div className="text-xs uppercase tracking-widest text-gold mb-2">0{i + 1}</div>
                  <h3 className="text-2xl font-bold">{m.nome}</h3>
                  <p className="mt-2 text-sm text-primary-foreground/80 line-clamp-2">
                    {m.descricao}
                  </p>
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
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                  Últimas notícias
                </div>
                <h2 className="mt-3 text-4xl md:text-5xl font-bold text-deep">
                  O que acontece
                  <br />
                  nas águas cearenses.
                </h2>
              </div>
              <Link
                to="/noticias"
                className="text-sm font-bold text-deep hover:text-primary inline-flex items-center gap-2"
              >
                Todas as notícias <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {noticias.slice(0, 3).map((n) => (
                <Link
                  key={n.id}
                  to="/noticias/$id"
                  params={{ id: n.id }}
                  className="group rounded-2xl bg-card border border-border/60 overflow-hidden shadow-card hover:shadow-elegant transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] bg-emerald-gradient relative overflow-hidden">
                    {n.imagem_url && (
                      <img
                        src={n.imagem_url}
                        alt={n.titulo}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1 text-xs font-bold text-deep uppercase tracking-wider">
                      {n.categoria}
                    </div>
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
    </SiteLayout>
  );
}
