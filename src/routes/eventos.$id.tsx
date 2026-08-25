import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import {
  eventoByIdQuery,
  eventosQuery,
  eventosPdfsQuery,
  type Evento,
  type EventoPdf,
} from "@/lib/site-queries";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ExternalLink,
  Download,
  FileText,
  Link as LinkIcon,
  Share2,
  Facebook,
  Linkedin,
  Youtube,
} from "lucide-react";

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

export const Route = createFileRoute("/eventos/$id")({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(eventoByIdQuery(params.id)),
      context.queryClient.ensureQueryData(eventosQuery()),
      context.queryClient.ensureQueryData(eventosPdfsQuery),
    ]),
  head: ({ loaderData }) => {
    const evento = loaderData?.[0];
    return {
      meta: [
        { title: evento ? `${evento.nome} — FCDA` : "Evento — FCDA" },
        {
          name: "description",
          content: evento?.descricao ?? `Informações sobre ${evento?.nome || "evento"} da FCDA.`,
        },
        { property: "og:title", content: evento?.nome ?? "FCDA" },
        { property: "og:description", content: evento?.descricao ?? "" },
        ...(evento?.imagem_url ? [{ property: "og:image", content: evento.imagem_url }] : []),
      ],
    };
  },
  component: EventoDetalhes,
});

function formatData(d: string) {
  try {
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
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
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-deep hover:shadow-md"
    >
      <LinkIcon className="h-4 w-4" /> Inscreva-se
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

function EventoDetalhes() {
  const { id } = Route.useParams();
  const evento = useSuspenseQuery(eventoByIdQuery(id)).data;
  const eventos = useSuspenseQuery(eventosQuery()).data;
  const pdfs = useSuspenseQuery(eventosPdfsQuery).data;

  // PDFs deste evento
  const eventoPdfs = pdfs.filter((pdf) => pdf.evento_id === id);

  // Outros eventos (excluindo o atual)
  const outrosEventos = eventos.filter((e) => e.id !== id).slice(0, 3);

  if (!evento) {
    return (
      <SiteLayout>
        <div className="py-32 text-center">
          <p className="text-muted-foreground text-lg">Evento não encontrado.</p>
          <Link
            to="/eventos"
            className="inline-flex items-center gap-2 mt-6 text-primary font-semibold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para eventos
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const statusInfo = getStatusLabel(evento.status || null);
  const url = typeof window === "undefined" ? "" : window.location.href;

  return (
    <SiteLayout>
      {/* ── HERO ── */}
      {evento.imagem_url ? (
        <div className="relative aspect-[16/7] min-h-[360px] max-h-[560px] overflow-hidden">
          <img
            src={evento.imagem_url}
            alt={evento.nome}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* gradiente sobre a imagem */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-deep/10" />

          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="mx-auto w-full max-w-4xl px-6 pb-12">
              <Link
                to="/eventos"
                className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-6"
              >
                <ArrowLeft className="h-4 w-4" /> Todos os eventos
              </Link>

              {evento.status && (
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </div>
              )}

              <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">
                {evento.nome}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-primary-foreground/70 text-sm">
                {evento.data_texto && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {evento.data_texto}
                  </div>
                )}
                {evento.local && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {evento.local}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sem imagem: hero escuro simples */
        <section className="py-20 bg-hero text-primary-foreground">
          <div className="mx-auto max-w-4xl px-6">
            <Link
              to="/eventos"
              className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" /> Todos os eventos
            </Link>

            {evento.status && (
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 ${statusInfo.color}`}
              >
                {statusInfo.label}
              </div>
            )}

            <h1 className="text-3xl md:text-5xl font-bold leading-tight">{evento.nome}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-primary-foreground/70 text-sm">
              {evento.data_texto && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {evento.data_texto}
                </div>
              )}
              {evento.local && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {evento.local}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <nav
        className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur"
        aria-label="Seções do evento"
      >
        <div className="mx-auto flex max-w-4xl gap-6 overflow-x-auto px-6 py-4 text-sm font-bold text-muted-foreground">
          <a href="#informacoes" className="whitespace-nowrap hover:text-primary">
            Informações
          </a>
          <a href="#documentos" className="whitespace-nowrap hover:text-primary">
            Documentos ({eventoPdfs.length})
          </a>
          <a href="#links" className="whitespace-nowrap hover:text-primary">
            Links
          </a>
        </div>
      </nav>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <article id="informacoes" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-4xl px-6">
          {/* Botão de inscrição */}
          <div className="mb-8">
            <InscricaoButton link={evento.link_inscricao} />
          </div>

          {/* Descrição */}
          {evento.descricao && (
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground font-medium leading-relaxed mb-10 pb-10 border-b border-border">
                {evento.descricao}
              </p>
            </div>
          )}

          {/* Informações do evento */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {evento.data_inicio && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-deep">Data</h3>
                </div>
                <p className="text-muted-foreground">
                  {evento.data_texto || formatData(evento.data_inicio)}
                  {evento.data_fim && ` até ${formatData(evento.data_fim)}`}
                </p>
              </div>
            )}

            {evento.local && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-deep">Local</h3>
                </div>
                <p className="text-muted-foreground mb-2">{evento.local}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.local)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Ver no mapa <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {evento.modalidade && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-deep">Modalidade</h3>
                </div>
                <p className="text-muted-foreground">{evento.modalidade}</p>
              </div>
            )}

            {evento.ano && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-deep">Temporada</h3>
                </div>
                <p className="text-muted-foreground">{evento.ano}</p>
              </div>
            )}
          </div>

          {/* Documentos do evento */}
          {eventoPdfs.length > 0 && (
            <div id="documentos" className="scroll-mt-24 mb-12">
              <h2 className="text-2xl font-bold text-deep mb-6">Documentos da competição</h2>
              <div className="grid gap-4">
                {eventoPdfs.map((pdf) => (
                  <a
                    key={pdf.id}
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:shadow-card transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold text-deep">{getTipoLabel(pdf.tipo)}</p>
                        <p className="text-sm text-muted-foreground">{pdf.nome_arquivo}</p>
                      </div>
                    </div>
                    <Download className="h-5 w-5 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Links importantes */}
          <div id="links" className="scroll-mt-24 mb-12">
            <h2 className="text-2xl font-bold text-deep mb-6">Links importantes</h2>
            <div className="flex flex-wrap gap-3">
              {evento.link_inscricao && (
                <a
                  href={evento.link_inscricao}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
                >
                  <LinkIcon className="h-4 w-4" /> Inscrições
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <a
                href="/transparencia"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                <FileText className="h-4 w-4" /> Transparência
              </a>
              <a
                href="/noticias"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                <FileText className="h-4 w-4" /> Notícias
              </a>
            </div>
          </div>

          {/* Compartilhar */}
          <div className="pt-8 border-t border-border">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Share2 className="h-4 w-4" />
                <span className="font-semibold text-deep">Compartilhar este evento</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border p-2 text-primary hover:bg-secondary"
                  aria-label="Compartilhar no Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border p-2 text-designated hover:bg-secondary"
                  aria-label="Compartilhar no LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* ── OUTROS EVENTOS ── */}
      {outrosEventos.length > 0 && (
        <section className="py-16 bg-secondary/35">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-2xl font-bold text-deep mb-6">Outros eventos</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {outrosEventos.map((e) => (
                <Link
                  key={e.id}
                  to="/eventos/$id"
                  params={{ id: e.id }}
                  className="rounded-xl border border-border bg-card p-5 hover:shadow-card transition-all block"
                >
                  {e.imagem_url && (
                    <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3 bg-secondary">
                      <img src={e.imagem_url} alt={e.nome} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="text-sm font-bold text-primary mb-1">{e.data_texto}</div>
                  <h3 className="font-semibold text-deep line-clamp-2">{e.nome}</h3>
                  {e.local && (
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {e.local}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
