import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { cursosQuery, type Curso } from "@/lib/site-queries";
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos — FCDA" },
      {
        name: "description",
        content:
          "Cursos e capacitações em desportos aquáticos oferecidos pela FCDA.",
      },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(cursosQuery()),
  errorComponent: ({ error }) => <div className="p-12 text-destructive">Erro: {error.message}</div>,
  component: Cursos,
});

function Cursos() {
  const cursos = useSuspenseQuery(cursosQuery()).data;

  return (
    <SiteLayout>
      <section className="py-24 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
            Formação e Capacitação
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl font-bold">
            Cursos e Treinamentos
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl">
            Aperfeiçoe seus conhecimentos em desportos aquáticos com os cursos oficiais
            oferecidos pela FCDA.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          {cursos.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-xl text-muted-foreground">
                Nenhum curso disponível no momento.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cursos.map((curso) => (
                <CursoCard key={curso.id} curso={curso} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function CursoCard({ curso }: { curso: Curso }) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const dataInicio = formatDate(curso.data_inicio);
  const dataFim = formatDate(curso.data_fim);

  return (
    <article className="group rounded-2xl bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all hover:-translate-y-1 overflow-hidden">
      {curso.imagem_url && (
        <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-secondary to-secondary/50">
          <img
            src={curso.imagem_url}
            alt={curso.titulo}
            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <h2 className="text-xl font-bold text-deep group-hover:text-primary transition-colors">
          {curso.titulo}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
          {curso.resumo}
        </p>

        <div className="mt-4 space-y-2">
          {(dataInicio || dataFim) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {dataInicio}
                {dataFim && dataInicio !== dataFim && ` — ${dataFim}`}
              </span>
            </div>
          )}
          {curso.local && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{curso.local}</span>
            </div>
          )}
          {curso.carga_horaria && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{curso.carga_horaria}</span>
            </div>
          )}
        </div>

        {curso.link_inscricao && (
          <a
            href={curso.link_inscricao}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 w-full justify-center rounded-full bg-gold-gradient px-6 py-3 text-sm font-bold text-deep hover:opacity-90 transition"
          >
            Inscrever-se <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
