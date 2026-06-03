import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useState } from "react";
import { AdminToolbar } from "@/components/admin/ui";
import { useInvalidate } from "@/components/admin/utils";
import { FileText, Check, X, Clock, Building2, Calendar, MapPin, Phone } from "lucide-react";
import { filiacaoQuery, type SolicitacaoFiliacao } from "@/lib/site-queries";
import { aprovarFiliacao, rejeitarFiliacao } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/filiacoes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(filiacaoQuery),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: AdminFiliacoes,
});

function AdminFiliacoes() {
  const { user } = useAuth();
  const [err, setErr] = useState<string | null>(null);
  const [selectedFiliacao, setSelectedFiliacao] = useState<SolicitacaoFiliacao | null>(null);
  const [filter, setFilter] = useState<"todas" | "pendentes" | "aprovadas" | "rejeitadas">(
    "pendentes",
  );
  const invalidate = useInvalidate(["solicitacoes_filiacao"]);
  const solicitacoes = useSuspenseQuery(filiacaoQuery).data;

  const filteredSolicitacoes = solicitacoes.filter((s) => {
    if (filter === "todas") return true;
    if (filter === "pendentes") return s.status === "pendente";
    if (filter === "aprovadas") return s.status === "aprovado";
    if (filter === "rejeitadas") return s.status === "rejeitado";
    return false;
  });

  const pendentesCount = solicitacoes.filter((s) => s.status === "pendente").length;

  async function handleAprovar(id: string) {
    try {
      await aprovarFiliacao(supabase, user!.id, id);
      invalidate();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao aprovar solicitação");
    }
  }

  async function handleRejeitar(id: string) {
    try {
      await rejeitarFiliacao(supabase, user!.id, id);
      invalidate();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao rejeitar solicitação");
    }
  }

  return (
    <div>
      <AdminToolbar title="Solicitações de Filiação" />

      {err && <div className="text-sm text-destructive mb-4">{err}</div>}

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("todas")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === "todas"
              ? "bg-deep text-deep-foreground"
              : "bg-card text-foreground/70 hover:text-deep"
          }`}
        >
          Todas ({solicitacoes.length})
        </button>
        <button
          onClick={() => setFilter("pendentes")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === "pendentes"
              ? "bg-deep text-deep-foreground"
              : "bg-card text-foreground/70 hover:text-deep"
          }`}
        >
          Pendentes ({pendentesCount})
        </button>
        <button
          onClick={() => setFilter("aprovadas")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === "aprovadas"
              ? "bg-deep text-deep-foreground"
              : "bg-card text-foreground/70 hover:text-deep"
          }`}
        >
          Aprovadas ({solicitacoes.filter((s) => s.status === "aprovado").length})
        </button>
        <button
          onClick={() => setFilter("rejeitadas")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === "rejeitadas"
              ? "bg-deep text-deep-foreground"
              : "bg-card text-foreground/70 hover:text-deep"
          }`}
        >
          Rejeitadas ({solicitacoes.filter((s) => s.status === "rejeitado").length})
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
        <div className="space-y-3">
          {filteredSolicitacoes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma solicitação encontrada.
            </p>
          ) : (
            filteredSolicitacoes.map((soli) => (
              <div
                key={soli.id}
                onClick={() => setSelectedFiliacao(soli)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedFiliacao?.id === soli.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-deep truncate">{soli.razao_social}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{soli.cnpj}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          soli.status === "pendente"
                            ? "bg-amber-100 text-amber-800"
                            : soli.status === "aprovado"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {soli.status === "pendente" && <Clock className="h-3 w-3" />}
                        {soli.status === "aprovado" && <Check className="h-3 w-3" />}
                        {soli.status === "rejeitado" && <X className="h-3 w-3" />}
                        {soli.status.charAt(0).toUpperCase() + soli.status.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {soli.tipo === "filiacao" ? "Filiação" : "Vinculação"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
          {selectedFiliacao ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-deep">Detalhes da Solicitação</h2>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
                    selectedFiliacao.status === "pendente"
                      ? "bg-amber-100 text-amber-800"
                      : selectedFiliacao.status === "aprovado"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {selectedFiliacao.status === "pendente" && <Clock className="h-4 w-4" />}
                  {selectedFiliacao.status === "aprovado" && <Check className="h-4 w-4" />}
                  {selectedFiliacao.status === "rejeitado" && <X className="h-4 w-4" />}
                  {selectedFiliacao.status.charAt(0).toUpperCase() +
                    selectedFiliacao.status.slice(1)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-deep mb-2">Tipo de Processo</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedFiliacao.tipo === "filiacao" ? "Filiação" : "Vinculação"}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-deep mb-2">Dados da Entidade</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Razão Social:</span>{" "}
                      <span className="text-deep">{selectedFiliacao.razao_social}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CNPJ:</span>{" "}
                      <span className="text-deep">{selectedFiliacao.cnpj}</span>
                    </div>
                    {selectedFiliacao.inscricao_estadual && (
                      <div>
                        <span className="text-muted-foreground">Inscrição Estadual:</span>{" "}
                        <span className="text-deep">{selectedFiliacao.inscricao_estadual}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-deep mb-2">Endereço</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-deep">{selectedFiliacao.endereco}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">CEP:</span>{" "}
                        <span className="text-deep">{selectedFiliacao.cep}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bairro:</span>{" "}
                        <span className="text-deep">{selectedFiliacao.bairro}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cidade:</span>{" "}
                        <span className="text-deep">{selectedFiliacao.cidade}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">UF:</span>{" "}
                        <span className="text-deep">{selectedFiliacao.uf}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedFiliacao.fone && (
                  <div>
                    <h3 className="font-semibold text-deep mb-2">Contato</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-deep">{selectedFiliacao.fone}</span>
                    </div>
                  </div>
                )}

                {selectedFiliacao.data_fundacao && (
                  <div>
                    <h3 className="font-semibold text-deep mb-2">Data da Fundação</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-deep">
                        {new Date(selectedFiliacao.data_fundacao).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-deep mb-2">Data da Solicitação</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-deep">
                      {new Date(selectedFiliacao.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documentos enviados */}
              {(selectedFiliacao.doc_cnpj_url || selectedFiliacao.doc_requerimento_url) && (
                <div>
                  <h3 className="font-semibold text-deep mb-2">Documentos Enviados</h3>
                  <div className="space-y-2">
                    {selectedFiliacao.doc_cnpj_url && (
                      <a
                        href={selectedFiliacao.doc_cnpj_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        Documento CNPJ
                      </a>
                    )}
                    {selectedFiliacao.doc_requerimento_url && (
                      <a
                        href={selectedFiliacao.doc_requerimento_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        Requerimento de Filiação
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Termo de aceite */}
              <div>
                <h3 className="font-semibold text-deep mb-2">Termo de Aceite</h3>
                {selectedFiliacao.aceite_termo ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">
                      Aceito em{" "}
                      {selectedFiliacao.aceite_em
                        ? new Date(selectedFiliacao.aceite_em).toLocaleString("pt-BR")
                        : "data não registrada"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <X className="h-4 w-4 text-destructive" />
                    <span className="text-muted-foreground">Não aceito</span>
                  </div>
                )}
              </div>

              {selectedFiliacao.status === "pendente" && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => handleAprovar(selectedFiliacao.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white font-semibold text-sm px-4 py-2.5 hover:bg-emerald-700 transition-colors"
                  >
                    <Check className="h-4 w-4" /> Aprovar
                  </button>
                  <button
                    onClick={() => handleRejeitar(selectedFiliacao.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm px-4 py-2.5 hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-4 w-4" /> Rejeitar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Selecione uma solicitação para ver os detalhes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
