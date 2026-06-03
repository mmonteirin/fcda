import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { noticiaByIdQuery, noticiasQuery } from "@/lib/site-queries";
import { Calendar, ArrowLeft, Tag, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/noticias/$id")({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(noticiaByIdQuery(params.id)),
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
      ],
    };
  },
  component: NoticiaDetalhes,
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
          prose-a:text-primary prose-a:underline
          prose-strong:text-deep
          prose-li:text-foreground
          prose-img:rounded-xl prose-img:shadow-card
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
  const noticia = useSuspenseQuery(noticiaByIdQuery(id)).data;
  const todasNoticias = useSuspenseQuery(noticiasQuery(true)).data;

  // Outras notícias da mesma categoria (excluindo a atual)
  const relacionadas = todasNoticias
    .filter((n) => n.id !== id && n.categoria === noticia?.categoria)
    .slice(0, 3);

  // Se não tem da mesma categoria, pega as mais recentes
  const sugeridas =
    relacionadas.length > 0 ? relacionadas : todasNoticias.filter((n) => n.id !== id).slice(0, 3);

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

  return (
    <SiteLayout>
      {/* ── HERO ── */}
      {noticia.imagem_url ? (
        <div className="relative h-[55vh] min-h-[400px] overflow-hidden">
          <img
            src={noticia.imagem_url}
            alt={noticia.titulo}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* gradiente sobre a imagem */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/60 to-deep/10" />

          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="mx-auto w-full max-w-4xl px-6 pb-12">
              <Link
                to="/noticias"
                className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-6"
              >
                <ArrowLeft className="h-4 w-4" /> Todas as notícias
              </Link>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-deep mb-4">
                <Tag className="h-3 w-3" />
                {noticia.categoria}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">
                {noticia.titulo}
              </h1>

              <div className="mt-4 flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Calendar className="h-4 w-4" />
                {formatData(noticia.data)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sem imagem: hero escuro simples */
        <section className="py-20 bg-hero text-primary-foreground">
          <div className="mx-auto max-w-4xl px-6">
            <Link
              to="/noticias"
              className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" /> Todas as notícias
            </Link>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 border border-gold/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold mb-4">
              <Tag className="h-3 w-3" />
              {noticia.categoria}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight">{noticia.titulo}</h1>

            <div className="mt-4 flex items-center gap-2 text-primary-foreground/70 text-sm">
              <Calendar className="h-4 w-4" />
              {formatData(noticia.data)}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTEÚDO ── */}
      <article className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          {/* Resumo (lead) */}
          {noticia.resumo && (
            <p className="text-xl text-muted-foreground font-medium leading-relaxed mb-10 pb-10 border-b border-border">
              {noticia.resumo}
            </p>
          )}

          {/* Corpo */}
          {noticia.conteudo ? (
            <ArticleContent content={noticia.conteudo} />
          ) : (
            <p className="text-muted-foreground italic">Conteúdo não disponível.</p>
          )}

          {/* Rodapé do artigo */}
          <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span className="font-semibold text-deep">{noticia.categoria}</span>
              <span>·</span>
              <Calendar className="h-4 w-4" />
              {formatData(noticia.data)}
            </div>
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar para notícias
            </Link>
          </div>
        </div>
      </article>

      {/* ── MAIS NOTÍCIAS ── */}
      {sugeridas.length > 0 && (
        <section className="py-16 bg-secondary/40">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold text-deep mb-8">
              {relacionadas.length > 0 ? "Mais sobre " + noticia.categoria : "Outras notícias"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sugeridas.map((n) => (
                <Link
                  key={n.id}
                  to="/noticias/$id"
                  params={{ id: n.id }}
                  className="group flex flex-col rounded-2xl bg-card border border-border/60 overflow-hidden shadow-card hover:shadow-elegant transition-all hover:-translate-y-1"
                >
                  {n.imagem_url ? (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={n.imagem_url}
                        alt={n.titulo}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-emerald-gradient flex items-center justify-center">
                      <Tag className="h-8 w-8 text-primary-foreground/40" />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {n.categoria}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{formatData(n.data)}</span>
                    </div>
                    <h3 className="font-bold text-deep leading-snug group-hover:text-primary transition-colors line-clamp-2 flex-1">
                      {n.titulo}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.resumo}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Ler notícia <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
