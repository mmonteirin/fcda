import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { eventosQuery, eventosPdfsQuery, type Evento, type EventoPdf } from "@/lib/site-queries";
import { Calendar, MapPin, FileText, Download, ExternalLink, Filter } from "lucide-react";
import { useState } from "react";

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

function getTipoLabel(tipo: EventoPdf["tipo"]) {
  return PDF_TIPOS.find((t) => t.value === tipo)?.label || tipo;
}

function Eventos() {
  const [anoFilter, setAnoFilter] = useState<number | undefined>(undefined);
  const eventos = useSuspenseQuery(eventosQuery(anoFilter)).data;
  const pdfs = useSuspenseQuery(eventosPdfsQuery).data;

  // Get unique years from events
  const anos = Array.from(
    new Set(eventos.map((e) => e.ano).filter((a): a is number => a !== null)),
  ).sort((a, b) => b - a);

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

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          {anos.length > 0 && (
            <div className="mb-8 flex items-center gap-3">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <select
                value={anoFilter ?? ""}
                onChange={(e) => setAnoFilter(e.target.value ? Number(e.target.value) : undefined)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-deep"
              >
                <option value="">Todas as temporadas</option>
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
                return (
                  <div
                    key={evento.id}
                    className="rounded-2xl bg-card border border-border/60 overflow-hidden shadow-card"
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-gradient grid place-items-center text-primary-foreground">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div className="font-bold text-deep">{evento.data_texto}</div>
                          </div>
                          <h2 className="text-2xl font-bold text-deep mb-2">{evento.nome}</h2>
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" /> {evento.local}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Modalidade: {evento.modalidade}
                          </div>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-gold/15 text-deep border border-gold/30">
                          {evento.modalidade}
                        </span>
                      </div>

                      {eventoPdfs.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-border">
                          <h3 className="text-sm font-semibold text-deep mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Documentos disponíveis
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {eventoPdfs.map((pdf) => (
                              <a
                                key={pdf.id}
                                href={pdf.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors group"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-deep truncate">
                                      {getTipoLabel(pdf.tipo)}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {pdf.nome_arquivo}
                                    </div>
                                  </div>
                                </div>
                                <Download className="h-4 w-4 text-muted-foreground group-hover:text-deep" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
