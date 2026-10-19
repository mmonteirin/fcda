import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import {
  eventoByIdQuery,
  eventosQuery,
  eventosPdfsQuery,
  swimSystemCompetitionQuery,
  type SwimSystemCompetitionCache,
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
  Search,
  ListChecks,
  Info,
  Building2,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { ReadingProgress } from "@/components/ui/reading-progress";

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
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(evento?.imagem_url ? [{ name: "twitter:image", content: evento.imagem_url }] : []),
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
          "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/40",
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
          "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-400/40",
        dotClass: "bg-sky-400 animate-ping",
        bannerBg: "from-sky-950/80 via-sky-900/40 to-card",
        buttonText: "Acompanhar Provas",
        ctaTitle: "Competição Ao Vivo",
        ctaDesc: "O evento está sendo realizado neste momento. Acompanhe os resultados e súmulas.",
      };
    case "inscricoes_fechadas":
      return {
        label: "Inscrições Encerradas",
        badgeClass:
          "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-400/40",
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
        badgeClass:
          "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-400/40",
        dotClass: "bg-slate-400",
        bannerBg: "from-slate-900/80 via-slate-850/40 to-card",
        buttonText: "Resultados Disponíveis",
        ctaTitle: "Etapa Concluída",
        ctaDesc: "Confira os resultados oficiais, pontuação por equipes e quadros de medalhas.",
      };
    case "cancelado":
      return {
        label: "Cancelado",
        badgeClass:
          "bg-red-100 text-red-800 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-400/40",
        dotClass: "bg-red-400",
        bannerBg: "from-red-950/80 via-red-900/40 to-card",
        buttonText: "Evento Cancelado",
        ctaTitle: "Evento Cancelado",
        ctaDesc: "Esta competição foi cancelada ou adiada. Entre em contato para orientações.",
      };
    case "confirmado":
      return {
        label: "Data Confirmada",
        badgeClass:
          "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-400/40",
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
        badgeClass:
          "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/40",
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
  const swimSystemCache = useQuery({
    ...swimSystemCompetitionQuery(evento?.swimsystem_meet_id ?? ""),
    enabled: Boolean(evento?.swimsystem_meet_id),
  });

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
      <ReadingProgress />
      {/* ── HERO BANNER DINÂMICO DE ALTO IMPACTO ── */}
      <section className="relative flex min-h-[420px] items-end overflow-hidden bg-deep text-primary-foreground lg:min-h-[480px]">
        {/* Imagem de Fundo com Tratamento Artístico */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={evento.nome}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center brightness-75 contrast-110 motion-safe:animate-fade-in"
          />
          {/* Overlay gradiente suave com as cores institucionais da FCDA */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/80 to-deep/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep/90 via-deep/60 to-transparent" />
          {/* Textura sutil de água / mesh */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 w-full pb-10 pt-20 md:pb-12 md:pt-24">
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
          {evento.swimsystem_meet_id &&
            (swimSystemCache.data?.snapshot ? (
              <SwimSystemCompetitionPanel
                snapshot={swimSystemCache.data.snapshot}
                syncedAt={swimSystemCache.data.synced_at}
                meetId={evento.swimsystem_meet_id}
              />
            ) : (
              <section className="mb-8 rounded-3xl border border-sky-500/20 bg-card p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                      <Waves className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                        Integração SwimSystem
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-deep">
                        {swimSystemCache.isPending
                          ? "Carregando dados da competição…"
                          : swimSystemCache.isError
                            ? "Não foi possível sincronizar os dados agora"
                            : "Os dados da competição ainda não estão disponíveis"}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {swimSystemCache.isError
                          ? "Você pode abrir a página oficial no SwimSystem ou tentar carregar novamente."
                          : "A programação, inscrições e resultados serão exibidos aqui assim que estiverem sincronizados."}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:shrink-0">
                    {swimSystemCache.isError && (
                      <button
                        type="button"
                        onClick={() => void swimSystemCache.refetch()}
                        className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-deep transition hover:bg-secondary"
                      >
                        Tentar novamente
                      </button>
                    )}
                    <a
                      href={`https://www.swimsystem.app/meets/sw/${encodeURIComponent(evento.swimsystem_meet_id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sky-800"
                    >
                      Abrir no SwimSystem <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </section>
            ))}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* COLUNA PRINCIPAL (Esquerda - 8 colunas) */}
            <div className="lg:col-span-8 space-y-8">
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

function displayValue(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function formatSwimTime(value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const minutes = Math.floor(value / 60_000);
  const seconds = ((value % 60_000) / 1000).toFixed(2).padStart(5, "0");
  return minutes > 0 ? `${minutes}:${seconds}` : seconds;
}

function displaySwimField(value: unknown): string {
  const direct = displayValue(value);
  if (direct) return direct;
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const record = value as Record<string, unknown>;
  for (const key of ["name", "label", "title", "shortName", "code"]) {
    const text = displayValue(record[key]);
    if (text) return text;
  }
  return "";
}

function formatSwimDateTime(value: unknown, includeDate = true): string {
  const raw = displayValue(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|\s)?(\d{2})?:?(\d{2})?/);
  if (!match) return raw;

  const [, year, month, day, hours, minutes] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const dateLabel = includeDate
    ? date.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";
  const timeLabel = hours ? `${hours}:${minutes || "00"}` : "";
  return [dateLabel, timeLabel].filter(Boolean).join(" · ") || raw;
}

function getSwimEventHeats(event: Record<string, unknown>): Record<string, unknown>[] {
  return Array.isArray(event.heats)
    ? (event.heats as Record<string, unknown>[])
    : [];
}

function getSwimStrokeLabel(value: unknown): string {
  const stroke = displaySwimField(value).toUpperCase();
  const labels: Record<string, string> = {
    FREE: "Livre",
    FREESTYLE: "Livre",
    BACK: "Costas",
    BACKSTROKE: "Costas",
    BREAST: "Peito",
    BREASTSTROKE: "Peito",
    FLY: "Borboleta",
    BUTTERFLY: "Borboleta",
    MEDLEY: "Medley",
    IM: "Medley",
  };
  return labels[stroke] || displaySwimField(value);
}

function getSwimEventTitle(event: Record<string, unknown>): string {
  const explicitName =
    displaySwimField(event.name) ||
    displaySwimField(event.eventName) ||
    displaySwimField(event.title);
  if (explicitName) return explicitName;

  const style = event.swimStyle as Record<string, unknown> | undefined;
  const distance = displayValue(style?.distance ?? event.distance);
  const stroke = getSwimStrokeLabel(style?.stroke ?? event.stroke);
  const relayCount = Number(style?.relayCount ?? event.relayCount);
  const distanceLabel = distance
    ? `${relayCount > 1 ? `${relayCount}×` : ""}${distance}m`
    : "";
  return [distanceLabel, stroke].filter(Boolean).join(" ") || "Prova";
}

function getSwimRoundLabel(value: unknown): string {
  const round = displaySwimField(value).toUpperCase();
  const labels: Record<string, string> = {
    TIM: "Final Direta",
    TIME_FINAL: "Final Direta",
    PRE: "Eliminatórias",
    PRELIM: "Eliminatórias",
    FIN: "Final",
    FINAL: "Final",
    SEMI: "Semifinal",
    SEMIFINAL: "Semifinal",
  };
  return labels[round] || displaySwimField(value);
}

function getSwimStatusLabel(value: unknown): string {
  const status = displaySwimField(value).toUpperCase();
  const labels: Record<string, string> = {
    ENTRIES: "Inscrições abertas",
    SEEDED: "Balizado",
    OFFICIAL: "Resultado oficial",
    RESULTS: "Resultados publicados",
    FINALIZED: "Finalizado",
    DNS: "Não largou",
    DNF: "Não terminou",
    DQ: "Desclassificado",
    DSQ: "Desclassificado",
  };
  return labels[status] || displaySwimField(value) || "Status não informado";
}

function getSwimGenderLabel(value: unknown): string {
  const gender = displaySwimField(value).toUpperCase();
  if (gender === "F" || gender === "FEMALE") return "Feminino";
  if (gender === "M" || gender === "MALE") return "Masculino";
  if (gender === "X" || gender === "MIXED") return "Misto";
  return displaySwimField(value);
}

function SwimSystemCompetitionPanel({
  snapshot,
  syncedAt,
  meetId,
}: {
  snapshot: SwimSystemCompetitionCache["snapshot"];
  syncedAt: string;
  meetId: string;
}) {
  const [activeView, setActiveView] = useState<"overview" | "program" | "results">("overview");
  const [eventSearch, setEventSearch] = useState("");
  const [resultSearch, setResultSearch] = useState("");
  const data = snapshot;
  const sessions = data.sessions ?? [];
  const events = data.events ?? [];
  const results = data.results?.results ?? [];
  const meetCounts = data.meet?.counts as Record<string, unknown> | undefined;
  const totalAthletes = Number(meetCounts?.athletes) || 0;
  const totalClubs = Number(meetCounts?.clubs) || 0;
  const totalHeats = events.reduce((total, event) => total + getSwimEventHeats(event).length, 0);
  const totalEntries = events.reduce((total, event) => total + (Number(event.entriesCount) || 0), 0);
  const entriesByEvent = new Map(events.map((event) => [displayValue(event.id), event]));
  const eventsByNumber = new Map(
    events.map((event) => [displayValue(event.number ?? event.eventNumber), event]),
  );
  const heatsById = new Map(
    events.flatMap((event) =>
      getSwimEventHeats(event).map((heat) => [displayValue(heat.id), heat] as const),
    ),
  );
  const sessionsById = new Map(sessions.map((session) => [displayValue(session.id), session]));
  const swimSystemUrl = `https://www.swimsystem.app/meets/sw/${encodeURIComponent(meetId)}`;
  const filteredEvents = events.filter((event, index) => {
    const haystack = [
      getSwimEventTitle(event),
      getSwimGenderLabel(event.gender),
      Array.isArray(event.agegroups)
        ? (event.agegroups as Record<string, unknown>[]).map((agegroup) => displaySwimField(agegroup.name)).join(" ")
        : displaySwimField(event.agegroup),
      displaySwimField(event.category),
      getSwimRoundLabel(event.round),
      displayValue(event.number ?? event.eventNumber) || String(index + 1),
      getSwimStatusLabel(event.status),
    ]
      .join(" ")
      .toLocaleLowerCase("pt-BR");
    return haystack.includes(eventSearch.trim().toLocaleLowerCase("pt-BR"));
  });
  const filteredResults = results.filter((result) => {
    const athlete = result.athlete as Record<string, unknown> | undefined;
    const club = result.club as Record<string, unknown> | undefined;
    const agegroup = result.agegroup as Record<string, unknown> | undefined;
    const event = entriesByEvent.get(displayValue(result.eventId)) || eventsByNumber.get(displayValue(result.eventNumber));
    const heat = heatsById.get(displayValue(result.heatId));
    const haystack = [
      [athlete?.firstName, athlete?.lastName].map(displayValue).filter(Boolean).join(" "),
      displayValue(club?.shortname),
      displayValue(club?.name),
      displayValue(agegroup?.name),
      displayValue(result.eventNumber),
      getSwimEventTitle(event || result),
      getSwimGenderLabel(event?.gender),
      getSwimRoundLabel(event?.round),
      displayValue(result.lane),
      displayValue(heat?.number),
    ]
      .join(" ")
      .toLocaleLowerCase("pt-BR");
    return haystack.includes(resultSearch.trim().toLocaleLowerCase("pt-BR"));
  });
  const meetName = displaySwimField(data.meet?.name);
  const lastSync = new Date(syncedAt);
  const syncLabel = Number.isNaN(lastSync.getTime())
    ? ""
    : lastSync.toLocaleString("pt-BR", {
        timeZone: "America/Fortaleza",
        dateStyle: "short",
        timeStyle: "short",
      });
  const meetDates = data.meet?.dates as Record<string, unknown> | undefined;
  const meetAcceptingEntries = data.meet?.acceptingEntries === true;
  const entryDeadline = meetDates?.entriesUntil;

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-sky-500/20 bg-card shadow-sm">
      <header className="relative overflow-hidden bg-gradient-to-br from-sky-950 via-sky-900 to-teal-800 px-6 py-7 text-white sm:px-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[32px] border-white/5" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-100">
              <Waves className="h-3.5 w-3.5" aria-hidden="true" /> Dados oficiais SwimSystem
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              {meetName || "Competição"}
            </h2>
            <p className="mt-1 text-sm text-sky-100/85">
              Programação e resultados sincronizados da competição.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {syncLabel && <p className="text-xs text-sky-100/75">Atualizado em {syncLabel}</p>}
            <a
              href={swimSystemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-sky-950 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sky-900"
            >
              Ver página oficial <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <div className="p-5 sm:p-8">
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            { label: "Provas", count: Number(meetCounts?.events) || events.length, icon: ListChecks },
            { label: "Atletas", count: totalAthletes, icon: UsersRound },
            { label: "Clubes", count: totalClubs, icon: Building2 },
            { label: "Séries", count: totalHeats, icon: Calendar },
            { label: "Inscrições", count: totalEntries, icon: FileText },
          ].map(({ label, count, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow-sm">
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xl font-bold leading-none text-deep">{count.toLocaleString("pt-BR")}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{label}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-border pb-2" role="group" aria-label="Dados da competição">
          {([
            ["overview", "Visão geral", Calendar],
            ["program", `Programa (${events.length})`, ListChecks],
            ["results", `Inscritos e resultados (${results.length})`, Trophy],
          ] as const).map(([view, label, Icon]) => (
            <button
              key={view}
              type="button"
              aria-pressed={activeView === view}
              onClick={() => setActiveView(view)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${activeView === view ? "border-b-2 border-sky-700 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100" : "text-muted-foreground hover:bg-secondary/60 hover:text-deep"}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        {(activeView === "overview" || activeView === "program") && (
          <div aria-label="Programação da competição" className="space-y-7">
            {(data.meet?.acceptingEntries !== undefined || Boolean(entryDeadline)) && (
              <div className={`flex items-start gap-3 rounded-2xl border p-4 ${meetAcceptingEntries ? "border-emerald-500/30 bg-emerald-500/10" : "border-border bg-secondary/35"}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${meetAcceptingEntries ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                  <Check className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-bold text-deep">{meetAcceptingEntries ? "Inscrições abertas" : "Inscrições encerradas"}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {entryDeadline ? `${meetAcceptingEntries ? "Inscreva-se até" : "Prazo de inscrição até"} ${formatSwimDateTime(entryDeadline)}.` : "Consulte a organização da competição para mais informações."}
                  </p>
                </div>
              </div>
            )}
            {sessions.length > 0 && (
              <section>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-deep">Etapas e horários</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Programação oficial, aquecimento e volume de cada etapa.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sessions.map((session, index) => {
                    const sessionEvents = events.filter((event) => {
                      const eventSession = event.session as Record<string, unknown> | undefined;
                      return (
                        (displayValue(eventSession?.id) && displayValue(eventSession?.id) === displayValue(session.id)) ||
                        (displayValue(eventSession?.number) && displayValue(eventSession?.number) === displayValue(session.number)) ||
                        (displayValue(eventSession?.name) && displayValue(eventSession?.name) === displayValue(session.name))
                      );
                    });
                    const sessionHeats = sessionEvents.reduce((count, event) => count + getSwimEventHeats(event).length, 0);
                    const sessionEntries = sessionEvents.reduce((count, event) => count + (Number(event.entriesCount) || 0), 0);
                    return (
                      <article key={displayValue(session.id) || index} className="rounded-2xl border border-border/70 bg-secondary/25 p-4">
                        <p className="font-semibold text-deep">{displayValue(session.name) || `Etapa ${displayValue(session.number) || index + 1}`}</p>
                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                          {formatSwimDateTime(session.date ?? session.daytime) || "Data a confirmar"}
                          {displayValue(session.daytime) && displayValue(session.daytime) !== displayValue(session.date) && ` · Início ${formatSwimDateTime(session.daytime, false)}`}
                        </p>
                        {(displayValue(session.warmupFrom) || displayValue(session.warmupUntil)) && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Aquecimento: {formatSwimDateTime(session.warmupFrom, false) || "—"}{displayValue(session.warmupUntil) && `–${formatSwimDateTime(session.warmupUntil, false)}`}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-sky-800 dark:text-sky-200">
                          <span className="rounded-full bg-sky-500/10 px-2.5 py-1">{Number(session.eventsCount) || sessionEvents.length} provas</span>
                          <span className="rounded-full bg-sky-500/10 px-2.5 py-1">{sessionHeats} séries</span>
                          <span className="rounded-full bg-sky-500/10 px-2.5 py-1">{sessionEntries.toLocaleString("pt-BR")} inscrições</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-bold text-deep">Programa de provas</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{events.length} provas sincronizadas do SwimSystem.</p>
                </div>
                {events.length > 0 && (
                  <label className="relative block sm:w-80">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <input
                      type="search"
                      value={eventSearch}
                      onChange={(event) => setEventSearch(event.target.value)}
                      placeholder="Buscar prova, categoria ou sexo"
                      aria-label="Buscar no programa de provas"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                    />
                  </label>
                )}
              </div>
              {filteredEvents.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredEvents.map((event, index) => {
                    const eventPosition = events.indexOf(event) + 1;
                    const eventNumber = displayValue(event.number ?? event.eventNumber) || String(eventPosition);
                    const eventName = getSwimEventTitle(event);
                    const agegroups = Array.isArray(event.agegroups)
                      ? (event.agegroups as Record<string, unknown>[]).map((agegroup) => displaySwimField(agegroup.name)).filter(Boolean)
                      : [displaySwimField(event.agegroup)].filter(Boolean);
                    const eventSession = event.session as Record<string, unknown> | undefined;
                    const session = sessionsById.get(displayValue(eventSession?.id)) || sessions.find((item) => displayValue(item.number) === displayValue(eventSession?.number));
                    const heats = getSwimEventHeats(event);
                    const entriesCount = Number(event.entriesCount) || 0;
                    const scheduledAt = displayValue(event.startTime) || displayValue(eventSession?.daytime) || displayValue(session?.daytime);
                    return (
                      <article key={displayValue(event.id) || index} className="rounded-2xl border border-border/70 bg-card p-4 transition hover:border-sky-500/40 hover:bg-sky-50/40 dark:hover:bg-sky-950/15">
                        <div className="flex items-start gap-3">
                          <span className="grid h-10 min-w-10 shrink-0 place-items-center rounded-xl bg-sky-600/10 px-2 text-sm font-bold text-sky-800 dark:text-sky-200">{eventNumber}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-deep">{eventName}</h4>
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{getSwimGenderLabel(event.gender) || "Sexo não informado"}</span>
                              {agegroups.map((agegroup) => <span key={agegroup} className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-800 dark:text-violet-200">{agegroup}</span>)}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                              {getSwimRoundLabel(event.round) && <span>{getSwimRoundLabel(event.round)}</span>}
                              {session && <><span aria-hidden="true">·</span><span>{displayValue(session.name)}</span></>}
                              {scheduledAt && <><span aria-hidden="true">·</span><span>{formatSwimDateTime(scheduledAt)}</span></>}
                            </div>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${String(event.status).toUpperCase() === "SEEDED" ? "bg-sky-500/10 text-sky-800 dark:text-sky-200" : "bg-amber-500/10 text-amber-800 dark:text-amber-200"}`}>{getSwimStatusLabel(event.status)}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-3 text-xs font-medium text-muted-foreground">
                          <span className="rounded-lg bg-secondary/60 px-2.5 py-1.5">{heats.length} séries</span>
                          <span className="rounded-lg bg-secondary/60 px-2.5 py-1.5">{entriesCount.toLocaleString("pt-BR")} atletas inscritos</span>
                          {displayValue(event.actualStart) && <span className="rounded-lg bg-secondary/60 px-2.5 py-1.5">Início real: {formatSwimDateTime(event.actualStart)}</span>}
                        </div>
                        {heats.length > 0 && (
                          <details className="group mt-3 rounded-xl bg-secondary/35 px-3.5 py-2.5">
                            <summary className="cursor-pointer list-none text-sm font-semibold text-sky-800 outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-sky-600 dark:text-sky-200">
                              Ver séries e status <span className="font-normal text-muted-foreground">({heats.length})</span>
                            </summary>
                            <div className="mt-3 grid gap-2 border-t border-border/70 pt-3 sm:grid-cols-2">
                              {heats.map((heat, heatIndex) => (
                                <div key={displayValue(heat.id) || heatIndex} className="flex items-center justify-between gap-3 rounded-lg bg-background/70 px-3 py-2 text-sm">
                                  <span className="font-medium text-deep">{displayValue(heat.name) || `Série ${displayValue(heat.number) || heatIndex + 1}`}</span>
                                  <span className="text-xs text-muted-foreground">{getSwimStatusLabel(heat.racestatus)}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl bg-secondary/40 p-5 text-sm text-muted-foreground">{events.length ? "Nenhuma prova corresponde à busca." : "O programa de provas ainda não foi publicado."}</p>
              )}
            </section>
          </div>
        )}

        {(activeView === "overview" || activeView === "results") && (
          <section aria-label="Resultados da competição" className={activeView === "overview" ? "mt-8 border-t border-border pt-7" : ""}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-bold text-deep">Atletas inscritos e resultados oficiais</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.results?.pointsTableLabel ? `Tabela: ${data.results.pointsTableLabel} · ` : ""}{results.length.toLocaleString("pt-BR")} registros publicados, incluindo tempos de inscrição e resultados quando disponíveis.
                </p>
              </div>
              {results.length > 0 && (
                <label className="relative block sm:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    type="search"
                    value={resultSearch}
                    onChange={(event) => setResultSearch(event.target.value)}
                    placeholder="Buscar atleta, clube, prova ou raia"
                    aria-label="Buscar em atletas inscritos e resultados"
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                  />
                </label>
              )}
            </div>
            {filteredResults.length > 0 ? (
              <>
                <p className="mb-2 text-xs text-muted-foreground">Exibindo {filteredResults.length} de {results.length}</p>
                <div className="overflow-hidden rounded-2xl border border-border">
                  <div className="max-h-[34rem] overflow-auto">
                    <table className="w-full min-w-[1050px] text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-secondary text-xs uppercase tracking-wide text-muted-foreground shadow-sm">
                        <tr>
                          <th scope="col" className="px-4 py-3">Prova</th>
                          <th scope="col" className="px-4 py-3">Série / raia</th>
                          <th scope="col" className="px-4 py-3">Atleta</th>
                          <th scope="col" className="px-4 py-3">Clube</th>
                          <th scope="col" className="px-4 py-3">Categoria</th>
                          <th scope="col" className="px-4 py-3">Inscrição</th>
                          <th scope="col" className="px-4 py-3">Resultado</th>
                          <th scope="col" className="px-4 py-3">Colocação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((result, index) => {
                          const athlete = result.athlete as Record<string, unknown> | undefined;
                          const club = result.club as Record<string, unknown> | undefined;
                          const agegroup = result.agegroup as Record<string, unknown> | undefined;
                          const event = entriesByEvent.get(displayValue(result.eventId)) || eventsByNumber.get(displayValue(result.eventNumber));
                          const heat = heatsById.get(displayValue(result.heatId));
                          const placements = Array.isArray(result.placements) ? result.placements as Record<string, unknown>[] : [];
                          const bestPlacement = placements[0];
                          const athleteName = [athlete?.firstName, athlete?.lastName].map(displayValue).filter(Boolean).join(" ");
                          const place = displayValue(bestPlacement?.place);
                          const eventTitle = event ? getSwimEventTitle(event) : "";
                          const eventDescription = [
                            eventTitle,
                            getSwimGenderLabel(event?.gender),
                            Array.isArray(event?.agegroups) ? (event.agegroups as Record<string, unknown>[]).map((agegroup) => displaySwimField(agegroup.name)).filter(Boolean).join(", ") : "",
                          ].filter(Boolean).join(" · ");
                          return (
                            <tr key={displayValue(result.id) || index} className="border-t border-border odd:bg-background even:bg-secondary/20">
                              <td className="px-4 py-3 font-medium text-deep">{eventDescription || `Prova ${displayValue(result.eventNumber) || "—"}`}<span className="mt-1 block text-xs font-normal text-muted-foreground">{getSwimRoundLabel(event?.round)}</span></td>
                              <td className="px-4 py-3">{displayValue(heat?.name) || (heat?.number ? `Série ${displayValue(heat.number)}` : "—")}<span className="mt-1 block text-xs text-muted-foreground">{result.lane ? `Raia ${displayValue(result.lane)}` : "Raia —"}</span></td>
                              <td className="px-4 py-3">{athleteName || "Revezamento"}</td>
                              <td className="px-4 py-3">{displayValue(club?.shortname) || displayValue(club?.name) || "—"}</td>
                              <td className="px-4 py-3">{displayValue(agegroup?.name) || "—"}</td>
                              <td className="px-4 py-3 font-mono tabular-nums">{formatSwimTime(result.entryTimeMs)}</td>
                              <td className="px-4 py-3 font-mono tabular-nums">{formatSwimTime(result.resultTimeMs)}</td>
                              <td className="px-4 py-3">{place ? <span className="inline-flex items-center gap-1.5 font-semibold text-deep">{place === "1" && <Award className="h-4 w-4 text-amber-500" aria-label="1º lugar" />}{place}º</span> : getSwimStatusLabel(result.resultStatus)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <p className="rounded-xl bg-secondary/40 p-5 text-sm text-muted-foreground">{results.length ? "Nenhum resultado corresponde à busca." : "Os resultados oficiais ainda não foram publicados. Consulte a página oficial para ver atualizações."}</p>
            )}
          </section>
        )}
        <p className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0" aria-hidden="true" /> Os dados são fornecidos pelo SwimSystem. A página oficial pode ter informações mais recentes.
        </p>
      </div>
    </section>
  );
}
