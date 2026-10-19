import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { noticiaByIdentifierQuery, noticiasQuery } from "@/lib/api/site-queries";
import {
  Calendar,
  ArrowLeft,
  Tag,
  ArrowRight,
  Facebook,
  Linkedin,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { ReadingProgress } from "@/components/ui/reading-progress";

import imgNatacao from "@/assets/images/mod-natacao.webp";
import imgPolo from "@/assets/images/mod-polo.webp";
import imgSaltos from "@/assets/images/mod-saltos.webp";
import imgArtistico from "@/assets/images/mod-artistico.webp";
import imgAguas from "@/assets/images/mod-aguas.webp";
import heroSwimmer from "@/assets/images/hero-swimmer.webp";

export const Route = createFileRoute("/noticias/$id")({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(noticiaByIdentifierQuery(params.id)),
      context.queryClient.ensureQueryData(noticiasQuery(true)),
    ]),
  head: ({ loaderData }) => {
    const noticia = loaderData?.[0];
    return {
      meta: [
        { title: noticia ? `${noticia.titulo} — FCDA` : "Notícia — FCDA" },
        {
          name: "description",
          content: noticia?.resumo ?? "Notícia da Federação Cearense de Desportos Aquáticos.",
        },
        { property: "og:title", content: noticia?.titulo ?? "FCDA" },
        { property: "og:description", content: noticia?.resumo ?? "" },
        ...(noticia?.imagem_url ? [{ property: "og:image", content: noticia.imagem_url }] : []),
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(noticia?.imagem_url ? [{ name: "twitter:image", content: noticia.imagem_url }] : []),
      ],
    };
  },
  component: NoticiaDetalhes,
});

function formatData(d: string) {
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [year, month, day] = d.split("-").map(Number);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(Date.UTC(year, month - 1, day)));
    }
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

function getFallbackNoticiaImage(categoria?: string | null) {
  const cat = (categoria || "").toLowerCase();
  if (cat.includes("água") || cat.includes("aguas")) return imgAguas;
  if (cat.includes("polo")) return imgPolo;
  if (cat.includes("salto")) return imgSaltos;
  if (cat.includes("artístico") || cat.includes("artistico")) return imgArtistico;
  if (cat.includes("nata")) return imgNatacao;
  return heroSwimmer;
}

/**
 * Renderiza conteúdo salvo como texto puro ou HTML.
 * - Se contiver tags HTML, renderiza diretamente.
 * - Caso contrário, converte parágrafos (\n\n) e quebras de linha simples.
 */
function ArticleContent({ content }: { content: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="
          prose prose-lg max-w-none
          prose-headings:text-deep prose-headings:font-bold
          prose-p:text-foreground prose-p:leading-relaxed
          prose-a:text-primary prose-a:underline hover:prose-a:text-deep
          prose-strong:text-deep
          prose-li:text-foreground
          prose-img:rounded-2xl prose-img:shadow-card
        "
      />
    );
  }

  // Texto puro: divide em parágrafos por linha dupla, preserva quebras simples
  const paragraphs = content.split(/\n{2,}/);
  return (
    <div className="space-y-6">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-foreground text-lg leading-relaxed">
          {para.split("\n").map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function NoticiaDetalhes() {
  const { id } = Route.useParams();
  const noticia = useSuspenseQuery(noticiaByIdentifierQuery(id)).data;
  const todasNoticias = useSuspenseQuery(noticiasQuery(true)).data;

  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!noticia) {
    return (
      <SiteLayout>
        <div className="py-32 text-center">
          <p className="text-muted-foreground text-lg">Notícia não encontrada.</p>
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 mt-6 text-primary font-semibold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para notícias
          </Link>
        </div>
      </SiteLayout>
    );
  }

  // Outras notícias da mesma categoria (excluindo a atual)
  const relacionadas = todasNoticias
    .filter((n) => n.id !== noticia.id && n.categoria === noticia.categoria)
    .slice(0, 3);

  // Se não tem da mesma categoria, pega as mais recentes
  const sugeridas =
    relacionadas.length > 0
      ? relacionadas
      : todasNoticias.filter((n) => n.id !== noticia.id).slice(0, 3);

  const heroImage = noticia.imagem_url || getFallbackNoticiaImage(noticia.categoria);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } else if (navigator.share) {
      navigator.share({ title: noticia.titulo, url });
    }
  };

  return (
    <SiteLayout>
      <ReadingProgress />
      {/* ── HERO BANNER REFINADO ── */}
      <section className="relative overflow-hidden bg-deep text-primary-foreground min-h-[440px] md:min-h-[500px] flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={noticia.titulo}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center filter brightness-75 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/75 to-deep/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep/90 via-deep/50 to-transparent" />
        </div>

        <div className="relative z-10 w-full pb-12 pt-28 md:pt-36">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-primary-foreground/75">
              <Link
                to="/noticias"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Todas as notícias
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-primary-foreground/40" />
              <span className="rounded-full bg-gold/90 px-3 py-1 font-bold uppercase tracking-wider text-deep">
                {noticia.categoria}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-white leading-tight">
              {noticia.titulo}
            </h1>

            <div className="mt-5 flex items-center gap-2 text-primary-foreground/80 text-sm">
              <Calendar className="h-4 w-4 text-gold" />
              <span>{formatData(noticia.data)}</span>
              <span className="opacity-40">·</span>
              <span className="text-primary-foreground/70">
                Federação Cearense de Desportos Aquáticos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <article className="py-14 sm:py-16 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Resumo (lead) */}
          {noticia.resumo && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 mb-10">
              <p className="text-lg sm:text-xl text-deep font-semibold leading-relaxed">
                {noticia.resumo}
              </p>
            </div>
          )}

          {/* Corpo da Matéria */}
          {noticia.conteudo ? (
            <div className="prose-content">
              <ArticleContent content={noticia.conteudo} />
            </div>
          ) : (
            <p className="text-muted-foreground italic">Conteúdo em atualização.</p>
          )}

          {/* Rodapé e Compartilhamento */}
          <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4 text-primary" />
              <span className="font-semibold text-deep">{noticia.categoria}</span>
              <span>·</span>
              <Calendar className="h-4 w-4" />
              {formatData(noticia.data)}
            </div>

            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Compartilhar
              </span>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${noticia.titulo} - FCDA: ${url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border p-2.5 text-emerald-600 hover:bg-emerald-50 transition-colors"
                aria-label="Compartilhar no WhatsApp"
                title="Compartilhar no WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border p-2.5 text-blue-600 hover:bg-blue-50 transition-colors"
                aria-label="Compartilhar no Facebook"
                title="Compartilhar no Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border p-2.5 text-blue-700 hover:bg-blue-50 transition-colors"
                aria-label="Compartilhar no LinkedIn"
                title="Compartilhar no LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-bold text-foreground/80 hover:bg-secondary transition-colors"
                aria-label="Copiar link"
                title="Copiar link"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied ? "Copiado!" : "Copiar Link"}</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* ── MAIS NOTÍCIAS RELACIONADAS ── */}
      {sugeridas.length > 0 && (
        <section className="py-16 bg-secondary/40 border-t border-border/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-deep">
                {relacionadas.length > 0 ? `Mais em ${noticia.categoria}` : "Outras Notícias"}
              </h2>
              <Link
                to="/noticias"
                className="text-sm font-bold text-primary hover:text-deep hover:underline"
              >
                Ver todas →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sugeridas.map((n) => {
                const itemImg = n.imagem_url || getFallbackNoticiaImage(n.categoria);
                return (
                  <Link
                    key={n.id}
                    to="/noticias/$id"
                    params={{ id: n.slug }}
                    className="group flex flex-col rounded-3xl bg-card border border-border/80 overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                      <img
                        src={itemImg}
                        alt={n.titulo}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-gold/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-deep shadow-xs">
                          {n.categoria}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatData(n.data)}</span>
                      </div>
                      <h3 className="font-bold text-deep text-base leading-snug group-hover:text-primary transition-colors line-clamp-2 flex-1">
                        {n.titulo}
                      </h3>
                      {n.resumo && (
                        <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {n.resumo}
                        </p>
                      )}
                      <div className="mt-4 pt-3 border-t border-border/50 inline-flex items-center gap-1 text-xs font-bold text-primary">
                        Ler notícia completa <ArrowRight className="h-3 w-3" />
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
