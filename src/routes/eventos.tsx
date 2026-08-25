import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { eventosQuery, eventosPdfsQuery, type Evento, type EventoPdf } from "@/lib/site-queries";
import {
  Calendar,
  MapPin,
  FileText,
  Download,
  ExternalLink,
  Filter,
  Clock,
  Link as LinkIcon,
} from "lucide-react";
import { useState, useEffect } from "react";

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

export const Route = createFileRoute("/eventos")({
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
  // Detectar temporada atual automaticamente
  const getCurrentSeason = () => {
    const now = new Date();
    return now.getFullYear();
  };

  const [anoFilter, setAnoFilter] = useState<number>(getCurrentSeason());
  const todosEventos = useSuspenseQuery(eventosQuery()).data;
  const eventos = todosEventos.filter((evento) => evento.ano === anoFilter);
  const pdfs = useSuspenseQuery(eventosPdfsQuery).data;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const proximosEventos = eventos
    .filter((evento) => evento.data_inicio && new Date(evento.data_inicio) >= hoje)
    .slice(0, 3);
  const resultados = pdfs.filter((pdf) =>
    ["resultados", "resultados_gerais", "pontuacao", "eficiencia", "recordes", "ranking"].includes(
      pdf.tipo,
    ),
  );

  // Get unique years from events
  const anos = Array.from(
    new Set(todosEventos.map((e) => e.ano).filter((a): a is number => a !== null)),
  ).sort((a, b) => b - a);

  // Atualizar temporada automaticamente na virada do ano
  useEffect(() => {
    const currentSeason = getCurrentSeason();
    if (anoFilter !== currentSeason) {
      setAnoFilter(currentSeason);
    }
  }, [anoFilter]);

  // Group PDFs by evento_id
  const pdfsByEvento = pdfs.reduce(
    (acc, pdf) => {
      if (!acc[pdf.evento_id]) acc[pdf.evento_id] = [];
      acc[pdf.evento_id].push(pdf);
      return acc;
    },
    {} as Record<string, EventoPdf[]>,
  );

  return (
    <SiteLayout>
      <section className="py-24 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs uppercase tracking-[0.25em] text-gold font-bold">Competições</div>
          <h1 className="mt-4 text-5xl md:text-6xl font-bold">Eventos</h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl">
            Calendário oficial de competições de desportos aquáticos no Ceará. Acesse as fichas de
            inscrição e resultados.
          </p>
        </div>
      </section>

      <nav className="border-b border-border bg-card" aria-label="Seções de eventos">
        <div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-6 py-4 text-sm font-semibold text-muted-foreground">
          <a href="#calendario" className="whitespace-nowrap hover:text-primary">
            Calendário
          </a>
          <a href="#proximos-eventos" className="whitespace-nowrap hover:text-primary">
            Próximos eventos
          </a>
          <a href="#resultados" className="whitespace-nowrap hover:text-primary">
            Resultados
          </a>
          <a href="#fotos" className="whitespace-nowrap hover:text-primary">
            Fotos
          </a>
          <a href="#documentos" className="whitespace-nowrap hover:text-primary">
            Documentos
          </a>
        </div>
      </nav>

      <section id="proximos-eventos" className="scroll-mt-32 py-16 bg-secondary/35">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-deep">Próximos eventos</h2>
          {proximosEventos.length === 0 ? (
            <p className="mt-4 text-muted-foreground">Nenhum evento futuro cadastrado.</p>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {proximosEventos.map((evento) => {
                const statusInfo = getStatusLabel(evento.status || null);
                return (
                  <Link
                    key={evento.id}
                    to="/eventos/$id"
                    params={{ id: evento.id }}
                    className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elegant transition-all block"
                  >
                    {evento.imagem_url && (
                      <div className="aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-secondary">
                        <img
                          src={evento.imagem_url}
                          alt={evento.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-primary">{evento.data_texto}</p>
                      {evento.status && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-deep mb-2">{evento.nome}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{evento.local}</p>
                    {evento.descricao && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {evento.descricao}
                      </p>
                    )}
                    <InscricaoButton link={evento.link_inscricao} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="resultados" className="scroll-mt-32 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-deep">Resultados</h2>
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
                  className="rounded-xl border border-border bg-card p-4 font-semibold text-deep hover:border-primary"
                >
                  {getTipoLabel(pdf.tipo)}
                  <span className="mt-1 block text-sm font-normal text-muted-foreground">
                    {pdf.nome_arquivo}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="fotos" className="scroll-mt-32 py-16 bg-secondary/35">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-deep">Fotos</h2>
          <p className="mt-3 text-muted-foreground">
            A galeria oficial das competições será publicada nesta área.
          </p>
        </div>
      </section>

      <section id="calendario" className="scroll-mt-32 py-24">
        <div className="mx-auto max-w-7xl px-6">
          {anos.length > 0 && (
            <div className="mb-8 flex items-center gap-3">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <select
                value={anoFilter}
                onChange={(e) => setAnoFilter(Number(e.target.value))}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-deep"
              >
                {anos.map((a) => (
                  <option key={a} value={a}>
                    Temporada {a}
                  </option>
                ))}
              </select>
            </div>
          )}
          {eventos.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum evento cadastrado.</p>
          ) : (
            <div className="space-y-8">
              {eventos.map((evento) => {
                const eventoPdfs = pdfsByEvento[evento.id] || [];
                const statusInfo = getStatusLabel(evento.status || null);
                return (
                  <Link
                    key={evento.id}
                    to="/eventos/$id"
                    params={{ id: evento.id }}
                    className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-card block hover:shadow-elegant transition-all"
                  >
                    {evento.imagem_url && (
                      <div className="aspect-[16/9] overflow-hidden bg-secondary">
                        <img
                          src={evento.imagem_url}
                          alt={evento.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-gradient grid place-items-center text-primary-foreground">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div className="font-bold text-deep">{evento.data_texto}</div>
                            {evento.status && (
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.color}`}
                              >
                                {statusInfo.label}
                              </span>
                            )}
                          </div>
                          <h2 className="text-2xl font-bold text-deep mb-2">{evento.nome}</h2>
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                            <MapPin className="h-3.5 w-3.5" /> {evento.local}
                          </div>
                          {evento.data_fim && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                              <Clock className="h-3.5 w-3.5" /> Até {formatData(evento.data_fim)}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground mb-3">
                            Modalidade: {evento.modalidade}
                          </div>
                          {evento.descricao && (
                            <p className="text-sm text-muted-foreground mb-4">{evento.descricao}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
