import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { noticiaByIdQuery } from "@/lib/site-queries";
import { Calendar, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/noticias/$id")({
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

function NoticiaDetalhes() {
  const { id } = Route.useParams() as { id: string };
  const noticia = useSuspenseQuery(noticiaByIdQuery(id)).data;

  if (!noticia) {
    return (
      <SiteLayout>
        <div className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <p className="text-muted-foreground">Notícia não encontrada.</p>
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar para notícias
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="py-24 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para notícias
          </Link>
          <div className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
            {noticia.categoria}
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">{noticia.titulo}</h1>
          <div className="mt-6 flex items-center gap-2 text-primary-foreground/80">
            <Calendar className="h-4 w-4" />
            {formatData(noticia.data)}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          {noticia.imagem_url && (
            <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-12 shadow-card">
              <img
                src={noticia.imagem_url}
                alt={noticia.titulo}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {noticia.resumo && (
            <div className="mb-8">
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                {noticia.resumo}
              </p>
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {noticia.conteudo && (
              <div
                dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
                className="text-deep leading-relaxed"
              />
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
