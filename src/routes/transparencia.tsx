import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { transparenciaQuery, type TransparenciaDocumento } from "@/lib/site-queries";
import { getTipoLabel, TIPOS } from "@/lib/transparencia-utils";
import { FileText, Calendar, Download, Filter } from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/transparencia")({
  head: () => ({
    meta: [
      { title: "Painel da Transparência — FCDA" },
      {
        name: "description",
        content: "Boletins, editais de convocações e prestação de contas da FCDA.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(transparenciaQuery(true)),
  errorComponent: ({ error }) => (
    <div className="p-12 text-destructive">Erro ao carregar: {error.message}</div>
  ),
  component: Transparencia,
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

function Transparencia() {
  const documentos = useSuspenseQuery(transparenciaQuery(true)).data;
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);

  const documentosFiltrados = filtroTipo
    ? documentos.filter((d) => d.tipo === filtroTipo)
    : documentos;

  const documentosPorTipo = useMemo(() => {
    return TIPOS.reduce(
      (acc, tipo) => {
        acc[tipo] = documentos.filter((d) => d.tipo === tipo);
        return acc;
      },
      {} as Record<string, TransparenciaDocumento[]>,
    );
  }, [documentos]);

  return (
    <SiteLayout>
      <section className="py-24 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
            Transparência
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl font-bold">Painel da Transparência</h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl">
            Acesso a boletins, editais de convocações e prestação de contas da Federação Cearense de
            Desportos Aquáticos.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-deep">Filtrar por:</span>
            <button
              onClick={() => setFiltroTipo(null)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filtroTipo === null
                  ? "bg-deep text-deep-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              Todos
            </button>
            {TIPOS.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filtroTipo === tipo
                    ? "bg-deep text-deep-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {getTipoLabel(tipo)}
              </button>
            ))}
          </div>

          {documentosFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">Nenhum documento encontrado.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {TIPOS.map((tipo) => {
                const docs = filtroTipo
                  ? documentosFiltrados.filter((d) => d.tipo === tipo)
                  : documentosPorTipo[tipo];
                if (docs.length === 0) return null;

                return (
                  <div key={tipo}>
                    <h2 className="text-2xl font-bold text-deep mb-6 flex items-center gap-3">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          tipo === "boletim"
                            ? "bg-primary"
                            : tipo === "edital"
                              ? "bg-gold"
                              : "bg-emerald-500"
                        }`}
                      />
                      {getTipoLabel(tipo)}
                    </h2>
                    <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-card">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 md:gap-8 items-start md:items-center p-6 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-emerald-gradient grid place-items-center text-primary-foreground">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-bold text-deep">{doc.titulo}</div>
                              {doc.descricao && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {doc.descricao}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatData(doc.data_publicacao)}
                          </div>
                          <a
                            href={doc.arquivo_url}
                            download={doc.arquivo_nome}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Baixar
                          </a>
                        </div>
                      ))}
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
