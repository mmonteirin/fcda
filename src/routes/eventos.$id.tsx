import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import {
  eventoByIdQuery,
  eventosQuery,
  eventosPdfsQuery,
  type EventoPdf,
} from "@/lib/api/site-queries";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ExternalLink,
  Download,
  FileText,
  Share2,
  Facebook,
  Linkedin,
  MessageCircle,
  Copy,
  Trophy,
  Award,
  ChevronRight,
  Phone,
  Mail,
  Check,
  Sparkles,
  Waves,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

import imgNatacao from "@/assets/images/mod-natacao.webp";
import imgPolo from "@/assets/images/mod-polo.webp";
import imgSaltos from "@/assets/images/mod-saltos.webp";
import imgArtistico from "@/assets/images/mod-artistico.webp";
import imgAguas from "@/assets/images/mod-aguas.webp";
import heroSwimmer from "@/assets/images/hero-swimmer.webp";

const PDF_TIPOS = [
  { value: "resultados", label: "Resultados Oficiais" },
  { value: "pontuacao", label: "Pontuação por Equipes" },
  { value: "eficiencia", label: "Troféu Eficiência" },
  { value: "recordes", label: "Recordes Superados" },
  { value: "quadro_de_medalhas", label: "Quadro de Medalhas" },
  { value: "indice_tecnico", label: "Índice Técnico" },
  { value: "programa_de_provas", label: "Programa de Provas" },
  { value: "inscritos_por_clube", label: "Inscritos por Clube" },
  { value: "relacao_de_inscritos", label: "Relação de Inscritos" },
  { value: "balizamentos", label: "Balizamento Oficial" },
  { value: "resultados_gerais", label: "Resultados Gerais" },
  { value: "regulamentos", label: "Regulamento da Competição" },
  { value: "relacao_de_cortes", label: "Relação de Cortes" },
  { value: "mapa_de_inscricao", label: "Mapa de Inscrição" },
  { value: "indices", label: "Índices Técnicos Mínimos" },
  { value: "lista_de_hoteis", label: "Guia de Hotéis e Hospedagem" },
  { value: "outros", label: "Documentos Gerais" },
  { value: "sumula", label: "Súmula de Provas" },
  { value: "tabela_de_jogos", label: "Tabela de Jogos" },
  { value: "mapa_da_prova", label: "Mapa do Percurso" },
  { value: "termo_de_responsabilidade", label: "Termo de Responsabilidade" },
  { value: "ranking", label: "Ranking do Evento" },
  { value: "inscricoes", label: "Ficha e Boletim de Inscrição" },
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
        { title: evento ? `${evento.nome} — Calendário Oficial FCDA` : "Evento — FCDA" },
        {
          name: "description",
          content:
            evento?.descricao ??
            `Competição oficial da FCDA: ${evento?.nome || "Evento"} em ${evento?.local || "Ceará"}. Calendário, inscrições, balizamento e resultados.`,
        },
        { property: "og:title", content: evento?.nome ?? "FCDA - Competição Oficial" },
        {
          property: "og:description",
          content:
            evento?.descricao ||
            `Confira informações, local, balizamentos e resultados do ${evento?.nome || "evento"}.`,
        },
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
      timeZone: "UTC",
    });
  } catch {
    return d;
  }
}

function getFallbackImage(modalidade?: string | null) {
  const mod = (modalidade || "").toLowerCase();
  if (mod.includes("água") || mod.includes("aguas")) return imgAguas;
  if (mod.includes("polo")) return imgPolo;
  if (mod.includes("salto")) return imgSaltos;
  if (mod.includes("artístico") || mod.includes("artistico")) return imgArtistico;
  if (mod.includes("nata")) return imgNatacao;
  return heroSwimmer;
}

function getStatusConfig(status: string | null | undefined) {
  switch (status) {
    case "inscricoes_abertas":
      return {
        label: "Inscrições Abertas",
        badgeClass:
          "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]",
        dotClass: "bg-emerald-400 animate-pulse",
        bannerBg: "from-emerald-950/80 via-emerald-900/40 to-card",
        buttonText: "Inscreva-se Agora",
        ctaTitle: "Inscrições Abertas!",
        ctaDesc: "Garanta a vaga de seus atletas através do sistema oficial de inscrições online.",
      };
    case "em_andamento":
      return {
        label: "Em Andamento",
        badgeClass:
          "bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-[0_0_20px_rgba(14,165,233,0.25)]",
        dotClass: "bg-sky-400 animate-ping",
        bannerBg: "from-sky-950/80 via-sky-900/40 to-card",
        buttonText: "Acompanhar Provas",
        ctaTitle: "Competição Ao Vivo",
        ctaDesc: "O evento está sendo realizado neste momento. Acompanhe os resultados e súmulas.",
      };
    case "inscricoes_fechadas":
      return {
        label: "Inscrições Encerradas",
        badgeClass: "bg-amber-500/20 text-amber-300 border-amber-400/40",
        dotClass: "bg-amber-400",
        bannerBg: "from-amber-950/80 via-amber-900/40 to-card",
        buttonText: "Inscrições Finalizadas",
        ctaTitle: "Inscrições Fechadas",
        ctaDesc:
          "O período oficial de inscrições foi encerrado. Aguarde a publicação do balizamento.",
      };
    case "finalizado":
      return {
        label: "Evento Concluído",
        badgeClass: "bg-slate-500/20 text-slate-300 border-slate-400/40",
        dotClass: "bg-slate-400",
        bannerBg: "from-slate-900/80 via-slate-850/40 to-card",
        buttonText: "Resultados Disponíveis",
        ctaTitle: "Etapa Concluída",
        ctaDesc: "Confira os resultados oficiais, pontuação por equipes e quadros de medalhas.",
      };
    case "cancelado":
      return {
        label: "Cancelado",
        badgeClass: "bg-red-500/20 text-red-300 border-red-400/40",
        dotClass: "bg-red-400",
        bannerBg: "from-red-950/80 via-red-900/40 to-card",
        buttonText: "Evento Cancelado",
        ctaTitle: "Evento Cancelado",
        ctaDesc: "Esta competição foi cancelada ou adiada. Entre em contato para orientações.",
      };
    case "confirmado":
      return {
        label: "Data Confirmada",
        badgeClass: "bg-teal-500/20 text-teal-300 border-teal-400/40",
        dotClass: "bg-teal-400",
        bannerBg: "from-teal-950/80 via-teal-900/40 to-card",
        buttonText: "Ver Detalhes",
        ctaTitle: "Evento Confirmado",
        ctaDesc: "Data e local confirmados no calendário oficial da FCDA.",
      };
    case "planejado":
    default:
      return {
        label: "Calendário Oficial 2026",
        badgeClass: "bg-emerald-950/60 text-emerald-300 border-emerald-500/40",
        dotClass: "bg-emerald-400",
        bannerBg: "from-deep/90 via-deep/60 to-card",
        buttonText: "Consultar Calendário",
        ctaTitle: "Calendário Oficial FCDA",
        ctaDesc: "Competição programada pela Federação Cearense de Desportos Aquáticos.",
      };
  }
}

function getTipoLabel(tipo: EventoPdf["tipo"]) {
  return PDF_TIPOS.find((t) => t.value === tipo)?.label || tipo;
}

function EventoDetalhes() {
  const { id } = Route.useParams();
  const evento = useSuspenseQuery(eventoByIdQuery(id)).data;
  const eventos = useSuspenseQuery(eventosQuery()).data;
  const pdfs = useSuspenseQuery(eventosPdfsQuery).data;

  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!evento) {
    return (
      <SiteLayout>
        <div className="py-32 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Trophy className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-deep">Evento não encontrado</h1>
          <p className="mt-2 text-muted-foreground text-lg">
            A competição solicitada não foi encontrada ou foi removida do calendário.
          </p>
          <Link
            to="/eventos"
            className="inline-flex items-center gap-2 mt-8 rounded-full bg-deep px-6 py-3 text-sm font-bold text-deep-foreground transition-all hover:bg-primary shadow-card"
          >
            <ArrowLeft className="h-4 w-4" /> Ver calendário de eventos
          </Link>
        </div>
      </SiteLayout>
    );
  }

  // PDFs deste evento
  const eventoPdfs = pdfs.filter((pdf) => pdf.evento_id === id);

  // Outros eventos do mesmo ano ou modalidade (excluindo o atual)
  const outrosEventos = eventos
    .filter((e) => e.id !== id)
    .sort((a, b) => {
      if (a.modalidade === evento.modalidade && b.modalidade !== evento.modalidade) return -1;
      if (b.modalidade === evento.modalidade && a.modalidade !== evento.modalidade) return 1;
      return 0;
    })
    .slice(0, 3);

  const statusConfig = getStatusConfig(evento.status);
  const heroImage = evento.imagem_url || getFallbackImage(evento.modalidade);
  const isRegistrationOpen =
    evento.status === "inscricoes_abertas" && Boolean(evento.link_inscricao);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2500);
    } else if (navigator.share) {
      navigator.share({ title: evento.nome, url });
    }
  };

  const mapsQuery = encodeURIComponent(`${evento.local || "Fortaleza"}, Ceará, Brasil`);

  return (
    <SiteLayout>
      {/* ── HERO BANNER DINÂMICO DE ALTO IMPACTO ── */}
      <section className="relative overflow-hidden bg-deep text-primary-foreground min-h-[480px] lg:min-h-[540px] flex items-end">
        {/* Imagem de Fundo com Tratamento Artístico */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={evento.nome}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center scale-105 filter brightness-75 contrast-110 motion-safe:animate-fade-in"
          />
          {/* Overlay gradiente suave com as cores institucionais da FCDA */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/80 to-deep/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep/90 via-deep/60 to-transparent" />
          {/* Textura sutil de água / mesh */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 w-full pb-12 pt-28 md:pt-36">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Navegação e Trilha (Breadcrumbs) */}
            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-primary-foreground/75">
              <Link
                to="/eventos"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Calendário de Eventos
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-primary-foreground/40" />
              <span className="rounded-full bg-gold/20 px-3 py-1 font-bold uppercase tracking-wider text-gold border border-gold/30">
                {evento.modalidade || "Desportos Aquáticos"}
              </span>
              {evento.ano && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-primary-foreground/40" />
                  <span className="text-primary-foreground/60">Temporada {evento.ano}</span>
                </>
              )}
            </div>

            {/* Badges de Status & Categoria */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${statusConfig.badgeClass}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`} />
                {statusConfig.label}
              </div>

              {evento.ano && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/15">
                  <Trophy className="h-3.5 w-3.5 text-gold" />
                  Circuito Cearense {evento.ano}
                </div>
              )}
            </div>

            {/* Título Principal */}
            <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.12]">
              {evento.nome}
            </h1>

            {/* Metadados Rápidos (Data & Local) */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm sm:text-base text-primary-foreground/90">
              {evento.data_texto && (
                <div className="flex items-center gap-2 rounded-xl bg-black/25 px-3.5 py-2 backdrop-blur-md border border-white/10">
                  <Calendar className="h-4 w-4 text-gold shrink-0" />
                  <span className="font-semibold">{evento.data_texto}</span>
                </div>
              )}

              {evento.local && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 rounded-xl bg-black/25 px-3.5 py-2 backdrop-blur-md border border-white/10 transition-colors hover:bg-black/40 hover:text-white"
                  title="Abrir no Google Maps"
                >
                  <MapPin className="h-4 w-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>{evento.local}</span>
                  <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </a>
              )}
            </div>

            {/* Ação Rápida no Hero (se inscrições abertas) */}
            {isRegistrationOpen && evento.link_inscricao && (
              <div className="mt-8">
                <a
                  href={evento.link_inscricao}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold px-7 py-3.5 text-base font-bold text-deep shadow-[0_10px_25px_rgba(212,175,55,0.35)] transition-all hover:scale-105 hover:shadow-[0_15px_30px_rgba(212,175,55,0.45)] active:scale-95"
                >
                  <Sparkles className="h-5 w-5 text-deep" />
                  Inscreva-se na Competição
                  <ExternalLink className="h-4 w-4 opacity-75" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CORPO PRINCIPAL COM GRID RESPONSIVO MODERNO ── */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* COLUNA PRINCIPAL (Esquerda - 8 colunas) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Card de Destaque para Inscrições (quando ativas) */}
              {isRegistrationOpen && (
                <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-gold/10 p-6 sm:p-8 shadow-card">
                  <div className="absolute top-0 right-0 -mr-12 -mt-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Inscrições Oficiais FCDA
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-deep">
                        Participe desta etapa oficial
                      </h2>
                      <p className="text-sm text-muted-foreground max-w-xl">
                        Acesse o sistema de inscrições online para cadastrar atletas, equipes e
                        provas nesta competição.
                      </p>
                    </div>

                    {evento.link_inscricao && (
                      <a
                        href={evento.link_inscricao}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-deep px-6 py-3.5 text-sm font-bold text-deep-foreground transition-all hover:bg-primary hover:shadow-elegant active:scale-95"
                      >
                        Inscrever-se Agora
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Informações Estruturadas (Grid de 4 Cards Elegantes) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Data e Período */}
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-gradient text-white shadow-xs">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Cronograma Oficial
                      </span>
                      <h3 className="font-bold text-deep text-lg">Data do Evento</h3>
                    </div>
                  </div>
                  <p className="text-foreground font-semibold text-base mt-2">
                    {evento.data_texto ||
                      (evento.data_inicio ? formatData(evento.data_inicio) : "Data a definir")}
                  </p>
                  {evento.data_fim && evento.data_fim !== evento.data_inicio && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Término previsto: {formatData(evento.data_fim)}
                    </p>
                  )}
                </div>

                {/* 2. Local e Como Chegar */}
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-gradient text-white shadow-xs">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Sede da Competição
                      </span>
                      <h3 className="font-bold text-deep text-lg">Local de Realização</h3>
                    </div>
                  </div>
                  <p className="text-foreground font-semibold text-base mt-2">
                    {evento.local || "Local a ser divulgado"}
                  </p>
                  {evento.local && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-primary hover:underline"
                    >
                      <Compass className="h-3.5 w-3.5" /> Traçar rota no Google Maps
                    </a>
                  )}
                </div>

                {/* 3. Modalidade Esportiva */}
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-gradient text-deep shadow-xs">
                      <Waves className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Desporto Aquático
                      </span>
                      <h3 className="font-bold text-deep text-lg">Modalidade</h3>
                    </div>
                  </div>
                  <p className="text-foreground font-semibold text-base mt-2">
                    {evento.modalidade || "Natação / Águas Abertas"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supervisionado pela Federação Cearense (FCDA/CBDA)
                  </p>
                </div>

                {/* 4. Temporada e Validação */}
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-gradient text-white shadow-xs">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Circuito Estadual
                      </span>
                      <h3 className="font-bold text-deep text-lg">Temporada</h3>
                    </div>
                  </div>
                  <p className="text-foreground font-semibold text-base mt-2">
                    {evento.ano ? `Edição ${evento.ano}` : "Circuito Cearense Oficial"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pontuação e índices homologados pela Federação
                  </p>
                </div>
              </div>

              {/* Descrição do Evento */}
              {evento.descricao ? (
                <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-primary">
                    <FileText className="h-4 w-4" />
                    Sobre a Competição
                  </div>
                  <h3 className="text-2xl font-bold text-deep mb-4">Informações Gerais</h3>
                  <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed space-y-4">
                    {evento.descricao.split("\n\n").map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-base sm:text-lg text-muted-foreground leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-deep">Competição Oficial Homologada</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        Evento integrante do calendário anual dos desportos aquáticos do Ceará. Os
                        detalhes técnicos, balizamentos de séries e programa oficial de provas são
                        atualizados continuamente nesta página pela coordenação de natação e águas
                        abertas da FCDA.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Documentos e Anexos da Competição */}
              <div
                id="documentos"
                className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-primary">
                      Arquivos e Publicações
                    </div>
                    <h3 className="text-2xl font-bold text-deep mt-1">Documentos da Competição</h3>
                  </div>
                  <span className="rounded-full bg-secondary px-3.5 py-1 text-xs font-bold text-muted-foreground">
                    {eventoPdfs.length} {eventoPdfs.length === 1 ? "arquivo" : "arquivos"}
                  </span>
                </div>

                {eventoPdfs.length > 0 ? (
                  <div className="grid gap-3 sm:gap-4">
                    {eventoPdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:bg-card hover:border-primary/50 hover:shadow-card"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 font-bold text-xs uppercase border border-red-500/20">
                            PDF
                          </div>
                          <div className="min-w-0">
                            <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[11px] font-bold text-deep uppercase tracking-wider mb-1">
                              {getTipoLabel(pdf.tipo)}
                            </span>
                            <p className="font-semibold text-deep text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                              {pdf.nome_arquivo}
                            </p>
                            {pdf.data_upload && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Publicado em {formatData(pdf.data_upload)}
                              </p>
                            )}
                          </div>
                        </div>

                        <a
                          href={pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-xs transition-colors hover:bg-deep shrink-0"
                        >
                          <Download className="h-4 w-4" /> Baixar PDF
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-secondary/30 p-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-deep text-base">
                      Nenhum documento anexado ainda
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                      Balizamentos, boletins de horário e resultados serão publicados aqui assim que
                      emitidos pela mesa técnica da federação.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* COLUNA LATERAL (Direita - 4 colunas sticky) */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              {/* Card de Inscrição / Ação Principal */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-card space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Status do Evento
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusConfig.badgeClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
                    {statusConfig.label}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-deep text-lg">Inscrições e Participação</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isRegistrationOpen
                      ? "As inscrições estão abertas para atletas vinculados e clubes filiados. Garanta sua participação dentro do prazo estipulado."
                      : "Consulte o calendário oficial para prazos de abertura, balizamentos e regulamentos desta prova."}
                  </p>

                  {isRegistrationOpen && evento.link_inscricao ? (
                    <a
                      href={evento.link_inscricao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-deep hover:shadow-lg active:scale-98"
                    >
                      Acessar Sistema de Inscrição
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      to="/eventos"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/50 px-5 py-3 text-sm font-bold text-deep transition-colors hover:bg-secondary"
                    >
                      Ver Calendário Completo
                    </Link>
                  )}
                </div>

                {/* Resumo Rápido */}
                <div className="pt-4 border-t border-border/60 space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>Modalidade:</span>
                    <span className="font-bold text-deep">{evento.modalidade || "Natação"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Temporada:</span>
                    <span className="font-bold text-deep">{evento.ano || "2026"}</span>
                  </div>
                  {evento.local && (
                    <div className="flex justify-between items-center">
                      <span>Localidade:</span>
                      <span
                        className="font-bold text-deep truncate max-w-[170px]"
                        title={evento.local}
                      >
                        {evento.local}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card de Compartilhamento Social */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Share2 className="h-4 w-4 text-primary" />
                  Compartilhar Competição
                </div>
                <p className="text-xs text-muted-foreground">
                  Divulgue com atletas, técnicos e torcedores nas redes sociais:
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `🏆 *${evento.nome}*\n📅 ${evento.data_texto || ""}\n📍 ${evento.local || ""}\nConfira todos os detalhes no site da FCDA: ${url}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-500/20"
                    title="Compartilhar no WhatsApp"
                    aria-label="Compartilhar no WhatsApp"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-[10px] font-bold">WhatsApp</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3 text-blue-700 dark:text-blue-300 transition-colors hover:bg-blue-500/20"
                    title="Compartilhar no Facebook"
                    aria-label="Compartilhar no Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="text-[10px] font-bold">Facebook</span>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3 text-sky-700 dark:text-sky-300 transition-colors hover:bg-sky-500/20"
                    title="Compartilhar no LinkedIn"
                    aria-label="Compartilhar no LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="text-[10px] font-bold">LinkedIn</span>
                  </a>

                  {/* Copiar Link */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-secondary/50 p-3 text-deep transition-colors hover:bg-secondary active:scale-95"
                    title="Copiar link"
                    aria-label="Copiar link"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                    <span className="text-[10px] font-bold">{copied ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
              </div>

              {/* Card de Contato da Federação */}
              <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card to-secondary/30 p-6 shadow-sm space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-gold">
                  Dúvidas Técnicas?
                </div>
                <h4 className="font-bold text-deep text-base">Secretaria da FCDA</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Para informações sobre balizamento, filiação de atletas ou regulamentos de provas:
                </p>
                <div className="space-y-2 text-xs">
                  <a
                    href="mailto:secretaria@fcda.org.br"
                    className="flex items-center gap-2 text-deep/80 hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span>secretaria@fcda.org.br</span>
                  </a>
                  <a
                    href="tel:+5585981877327"
                    className="flex items-center gap-2 text-deep/80 hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <span>(85) 98187-7327</span>
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── OUTROS EVENTOS DO CALENDÁRIO ── */}
      {outrosEventos.length > 0 && (
        <section className="py-16 bg-secondary/40 border-t border-border/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  Calendário Oficial FCDA
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-deep mt-1">
                  Mais Competições Programadas
                </h2>
              </div>
              <Link
                to="/eventos"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-deep hover:underline"
              >
                Ver calendário completo <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {outrosEventos.map((e) => {
                const eventImg = e.imagem_url || getFallbackImage(e.modalidade);
                const itemStatus = getStatusConfig(e.status);

                return (
                  <Link
                    key={e.id}
                    to="/eventos/$id"
                    params={{ id: e.id }}
                    className="group flex flex-col rounded-3xl border border-border/80 bg-card overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant hover:border-primary/50"
                  >
                    {/* Imagem do Card */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
                      <img
                        src={eventImg}
                        alt={e.nome}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-gold/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-deep shadow-xs">
                          {e.modalidade || "Natação"}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-xs font-semibold text-white/90">
                          {e.data_texto || (e.data_inicio ? formatData(e.data_inicio) : "")}
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${itemStatus.badgeClass}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${itemStatus.dotClass}`} />
                            {itemStatus.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-deep text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {e.nome}
                        </h3>
                        {e.local && (
                          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate">{e.local}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-bold text-primary">
                        <span>Ver detalhes</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
