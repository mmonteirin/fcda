import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import {
  eventosQuery,
  eventosPdfsQuery,
  type Evento,
  type EventoPdf,
} from "@/lib/api/site-queries";
import {
  Calendar,
  MapPin,
  FileText,
  Download,
  ExternalLink,
  Filter,
  Clock,
  Link as LinkIcon,
  ArrowDown,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { useState, useMemo } from "react";

const PDF_TIPOS = [
  { value: "resultados", label: "Resultados" },
  { value: "pontuacao", label: "Pontuação" },
  { value: "eficiencia", label: "Eficiência" },
  { value: "recordes", label: "Recordes" },
  { value: "quadro_de_medalhas", label: "Quadro de Medalhas" },
  { value: "indice_tecnico", label: "Índice Técnico" },
  { value: "programa_de_provas", label: "Programa de Provas" },
  { value: "inscritos_por_clube", label: "Inscritos por Clube" },
  { value: "relacao_de_inscritos", label: "Relação de Inscritos" },
  { value: "balizamentos", label: "Balizamentos" },
  { value: "resultados_gerais", label: "Resultados Gerais" },
  { value: "regulamentos", label: "Regulamentos" },
  { value: "relacao_de_cortes", label: "Relação de Cortes" },
  { value: "mapa_de_inscricao", label: "Mapa de Inscrição" },
  { value: "indices", label: "Índices" },
  { value: "lista_de_hoteis", label: "Lista de Hotéis" },
  { value: "outros", label: "Outros" },
  { value: "sumula", label: "Súmula" },
  { value: "tabela_de_jogos", label: "Tabela de Jogos" },
  { value: "mapa_da_prova", label: "Mapa da Prova" },
  { value: "termo_de_responsabilidade", label: "Termo de Responsabilidade" },
  { value: "ranking", label: "Ranking" },
  { value: "inscricoes", label: "Ficha de Inscrição" },
] as const;

export const Route = createFileRoute("/eventos/")({
  head: () => ({
    meta: [
      { title: "Eventos — FCDA" },
      {
        name: "description",
        content: "Calendário oficial de competições de desportos aquáticos no Ceará.",
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(eventosQuery()),
      context.queryClient.ensureQueryData(eventosPdfsQuery),
    ]),
  errorComponent: ({ error }) => (
    <div className="p-12 text-destructive">Erro ao carregar: {error.message}</div>
  ),
  component: Eventos,
});

function formatData(d: string) {
  try {
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return d;
  }
}

function getStatusLabel(status: string | null) {
  const statusMap: Record<string, { label: string; color: string }> = {
    planejado: { label: "Planejado", color: "bg-gray-100 text-gray-700" },
    confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
    inscricoes_abertas: { label: "Inscrições Abertas", color: "bg-green-100 text-green-700" },
    inscricoes_fechadas: { label: "Inscrições Fechadas", color: "bg-yellow-100 text-yellow-700" },
    em_andamento: { label: "Em Andamento", color: "bg-purple-100 text-purple-700" },
    finalizado: { label: "Finalizado", color: "bg-slate-100 text-slate-700" },
    cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700" },
  };
  return statusMap[status || ""] || { label: status || "", color: "bg-gray-100 text-gray-700" };
}

function getTipoLabel(tipo: EventoPdf["tipo"]) {
  return PDF_TIPOS.find((t) => t.value === tipo)?.label || tipo;
}

function InscricaoButton({ link }: { link: string | null | undefined }) {
  const url = link?.trim();
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-deep hover:shadow-md"
    >
      <LinkIcon className="h-4 w-4" /> Inscreva-se
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

function Eventos() {
  const todosEventos: Evento[] = useSuspenseQuery(eventosQuery()).data;
  const pdfs: EventoPdf[] = useSuspenseQuery(eventosPdfsQuery).data;

  // Obter anos únicos dos eventos
  const anos = useMemo(() => {
    const list = Array.from(
      new Set(todosEventos.map((e) => e.ano).filter((a): a is number => a !== null)),
    ).sort((a, b) => b - a);
    const currentYear = new Date().getFullYear();
    if (!list.includes(currentYear)) {
      list.unshift(currentYear);
    }
    return list;
  }, [todosEventos]);

  const [anoFilter, setAnoFilter] = useState<number>(() => {
    const currentYear = new Date().getFullYear();
    return currentYear;
  });

  const eventos = useMemo(
    () => todosEventos.filter((evento) => evento.ano === anoFilter),
    [todosEventos, anoFilter],
  );

  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const proximosEventos = useMemo(
    () =>
      eventos
        .filter((evento) => evento.data_inicio && new Date(evento.data_inicio) >= hoje)
        .slice(0, 3),
    [eventos, hoje],
  );

  const resultados = useMemo(
    () =>
      pdfs.filter((pdf) =>
        [
          "resultados",
          "resultados_gerais",
          "pontuacao",
          "eficiencia",
          "recordes",
          "ranking",
        ].includes(pdf.tipo),
      ),
    [pdfs],
  );

  const documentos = useMemo(
    () => pdfs.filter((pdf) => !resultados.some((resultado) => resultado.id === pdf.id)),
    [pdfs, resultados],
  );

  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero text-primary-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-14 h-64 w-64 rounded-full border border-white/10"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-[1fr_auto] md:items-end md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> Competições
            </div>
            <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-7xl">Eventos</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-primary-foreground/80 md:text-lg">
              Acompanhe o calendário oficial da natação cearense. Encontre datas, locais, inscrições
              e resultados em um só lugar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#calendario"
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 font-bold text-deep transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Ver calendário <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="https://www.swimsystem.app/meets/org/8db472d3-cb28-4f0f-b9f3-c673c95ab0c6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Calendário ao vivo <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="hidden rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm md:block">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground/60">
              Temporada em destaque
            </p>
            <p className="mt-2 text-4xl font-bold text-gold">{new Date().getFullYear()}</p>
            <p className="mt-1 text-sm text-primary-foreground/75">
              {todosEventos.filter((evento) => evento.ano === new Date().getFullYear()).length}{" "}
              eventos no calendário
            </p>
          </div>
        </div>
      </section>

      <nav className="border-b border-border/80 bg-card shadow-sm" aria-label="Seções de eventos">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-3 text-sm font-semibold text-muted-foreground">
          <a
            href="#calendario"
            className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-secondary hover:text-primary"
          >
            Calendário
          </a>
          <a
            href="#proximos-eventos"
            className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-secondary hover:text-primary"
          >
            Próximos eventos
          </a>
          <a
            href="#resultados"
            className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-secondary hover:text-primary"
          >
            Resultados
          </a>
          <a
            href="#fotos"
            className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-secondary hover:text-primary"
          >
            Fotos
          </a>
          <a
            href="#documentos"
            className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-secondary hover:text-primary"
          >
            Documentos
          </a>
        </div>
      </nav>

      <section id="proximos-eventos" className="scroll-mt-24 bg-secondary/35 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Agenda</p>
              <h2 className="mt-2 text-3xl font-bold text-deep md:text-4xl">Próximos eventos</h2>
              <p className="mt-2 text-muted-foreground">
                Prepare-se para as próximas disputas da temporada.
              </p>
            </div>
            <a
              href="#calendario"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              Calendário completo <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          {proximosEventos.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center">
              <p className="font-semibold text-deep">Nenhum evento futuro cadastrado para esta temporada.</p>
              <p className="mt-2 text-sm text-muted-foreground">Enquanto isso, consulte as competições e resultados já publicados.</p>
              <a href="#calendario" className="mt-5 inline-flex items-center gap-2 rounded-full bg-deep px-5 py-2.5 text-sm font-bold text-deep-foreground transition hover:bg-primary">Abrir calendário completo <ArrowRight aria-hidden="true" className="h-4 w-4"/></a>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {proximosEventos.map((evento) => {
                const statusInfo = getStatusLabel(evento.status || null);
                return (
                  <article
                    key={evento.id}
                    className="group motion-safe:animate-fade-in-up overflow-hidden rounded-2xl border border-border bg-card shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-elegant motion-reduce:transition-none"
                  >
                    {evento.imagem_url ? (
                      <div className="aspect-[16/9] overflow-hidden bg-secondary">
                        <img
                          src={evento.imagem_url}
                          alt={evento.nome}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex h-3 bg-emerald-gradient" />
                    )}
                    <div className="p-5 md:p-6">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-primary">{evento.data_texto}</p>
                        {evento.status && (
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-deep">{evento.nome}</h3>
                      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0 text-primary" />
                        {evento.local}
                      </p>
                      {evento.descricao && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {evento.descricao}
                        </p>
                      )}
                      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                        <Link
                          to="/eventos/$id"
                          params={{ id: evento.id }}
                          className="text-sm font-bold text-deep hover:text-primary"
                        >
                          Detalhes do evento <span aria-hidden="true">→</span>
                        </Link>
                        <InscricaoButton link={evento.link_inscricao} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="resultados" className="scroll-mt-24 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Arquivo oficial
          </p>
          <h2 className="mt-2 text-3xl font-bold text-deep md:text-4xl">Resultados</h2>
          <p className="mt-2 text-muted-foreground">
            Resultados, rankings, recordes e documentos técnicos publicados.
          </p>
          {resultados.length === 0 ? (
            <p className="mt-6 text-muted-foreground">Nenhum resultado publicado ainda.</p>
          ) : (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {resultados.map((pdf) => (
                <a
                  key={pdf.id}
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-deep group-hover:text-primary">
                      {getTipoLabel(pdf.tipo)}
                    </span>
                    <span className="mt-1 block truncate text-sm font-normal text-muted-foreground">
                      {pdf.nome_arquivo}
                    </span>
                  </span>
                  <Download className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="fotos" className="scroll-mt-24 bg-secondary/35 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Memórias da temporada
              </p>
              <h2 className="mt-2 text-2xl font-bold text-deep">Fotos</h2>
              <p className="mt-2 text-muted-foreground">
                A galeria oficial das competições será publicada nesta área.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="hidden h-20 w-32 items-center justify-center rounded-xl bg-emerald-gradient text-white/80 sm:flex"
            >
              <Trophy className="h-8 w-8" />
            </div>
          </div>
        </div>
      </section>

      <section id="calendario" className="scroll-mt-24 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Planeje sua temporada
              </p>
              <h2 className="mt-2 text-3xl font-bold text-deep md:text-4xl">Calendário</h2>
              <p className="mt-2 text-muted-foreground">
                Consulte datas, locais e informações de cada competição.
              </p>
            </div>
            {anos.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <select
                  value={anoFilter}
                  onChange={(e) => setAnoFilter(Number(e.target.value))}
                  aria-label="Filtrar calendário por temporada"
                  className="bg-transparent text-sm font-semibold text-deep outline-none"
                >
                  {anos.map((a) => (
                    <option key={a} value={a}>
                      Temporada {a}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="mb-5 text-sm text-muted-foreground">
            {eventos.length} {eventos.length === 1 ? "evento" : "eventos"} na temporada {anoFilter}
          </div>
          {eventos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Nenhum evento cadastrado para esta temporada.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {eventos.map((evento) => {
                const statusInfo = getStatusLabel(evento.status || null);
                return (
                  <article
                    key={evento.id}
                    className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
                  >
                    <div className="flex min-h-36">
                      {evento.imagem_url ? (
                        <div className="hidden w-36 shrink-0 overflow-hidden bg-secondary sm:block">
                          <img
                            src={evento.imagem_url}
                            alt={evento.nome}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="hidden w-2 shrink-0 bg-emerald-gradient sm:block" />
                      )}
                      <div className="min-w-0 flex-1 p-5 md:p-6">
                        <div className="flex items-start gap-3">
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-primary">
                              {evento.data_texto}
                            </div>
                            <Link
                              to="/eventos/$id"
                              params={{ id: evento.id }}
                              className="mt-1 block text-lg font-bold leading-snug text-deep hover:text-primary"
                            >
                              {evento.nome}
                            </Link>
                          </div>
                          {evento.status && (
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                          )}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" /> {evento.local}
                          </div>
                          {evento.data_fim && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" /> Até {formatData(evento.data_fim)}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {evento.modalidade}
                        </div>
                        {evento.descricao && (
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {evento.descricao}
                          </p>
                        )}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                          <Link
                            to="/eventos/$id"
                            params={{ id: evento.id }}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-deep hover:text-primary"
                          >
                            Ver detalhes <ArrowRight className="h-4 w-4" />
                          </Link>
                          <InscricaoButton link={evento.link_inscricao} />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section
        id="documentos"
        className="scroll-mt-24 border-t border-border bg-secondary/35 py-16 md:py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Materiais de apoio
          </p>
          <h2 className="mt-2 text-3xl font-bold text-deep md:text-4xl">Documentos</h2>
          <p className="mt-2 text-muted-foreground">
            Regulamentos, balizamentos, listas e outros arquivos das competições.
          </p>
          {documentos.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center text-muted-foreground">
              Nenhum documento publicado no momento.
            </div>
          ) : (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {documentos.map((pdf) => {
                const eventoNome = todosEventos.find((evento) => evento.id === pdf.evento_id)?.nome;
                return (
                  <a
                    key={pdf.id}
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-w-0 items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-deep group-hover:text-primary">
                        {getTipoLabel(pdf.tipo)}
                      </span>
                      <span className="mt-1 block truncate text-sm text-muted-foreground">
                        {eventoNome || pdf.nome_arquivo}
                      </span>
                    </span>
                    <Download className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
