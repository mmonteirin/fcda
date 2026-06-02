import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { eventosQuery, eventosPdfsQuery, type EventoPdf } from "@/lib/site-queries";
import { uploadPdf } from "@/lib/admin.functions";
import { AdminToolbar, AdminTable, RowActions, Modal, Field } from "@/components/admin/ui";
import { inputClass, useInvalidate } from "@/components/admin/utils";
import { Upload, X, FileText, Download, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/eventos-pdfs")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(eventosQuery()),
      context.queryClient.ensureQueryData(eventosPdfsQuery),
    ]),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: AdminEventosPdfs,
});

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

function AdminEventosPdfs() {
  const eventos = useSuspenseQuery(eventosQuery()).data;
  const pdfs = useSuspenseQuery(eventosPdfsQuery).data;
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedEventoId, setSelectedEventoId] = useState<string | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<(typeof PDF_TIPOS)[number]["value"] | null>(
    null,
  );
  const upload = useServerFn(uploadPdf);
  const invalidate = useInvalidate(["eventos-pdfs"]);

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedEventoId || !selectedTipo) return;

    setUploading(true);
    setErr(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        await upload({
          data: {
            fileName: file.name,
            fileType: file.type,
            fileData: base64,
            eventoId: selectedEventoId,
            tipo: selectedTipo,
          },
        });
        invalidate();
        setUploadModalOpen(false);
        setSelectedEventoId(null);
        setSelectedTipo(null);
      };
      reader.readAsDataURL(file);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePdf(id: string) {
    if (!confirm("Tem certeza que deseja excluir este PDF?")) return;
    const { supabase } = await import("@/integrations/supabase/client");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("eventos_pdfs").delete().eq("id", id);
    if (error) {
      setErr(error.message);
      return;
    }
    invalidate();
  }

  function getTipoLabel(tipo: EventoPdf["tipo"]) {
    return PDF_TIPOS.find((t) => t.value === tipo)?.label || tipo;
  }

  return (
    <div>
      <AdminToolbar title="PDFs de Eventos" onNew={() => setUploadModalOpen(true)} />

      {err && <div className="text-sm text-destructive mb-4">{err}</div>}

      <Modal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload PDF">
        <div className="space-y-4">
          <Field label="Evento">
            <select
              value={selectedEventoId ?? ""}
              onChange={(e) => setSelectedEventoId(e.target.value || null)}
              className={inputClass}
            >
              <option value="">Selecione um evento</option>
              {eventos.map((evento) => (
                <option key={evento.id} value={evento.id}>
                  {evento.nome} - {evento.data_texto}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo de PDF">
            <select
              value={selectedTipo ?? ""}
              onChange={(e) =>
                setSelectedTipo((e.target.value as (typeof PDF_TIPOS)[number]["value"]) || null)
              }
              className={inputClass}
            >
              <option value="">Selecione o tipo</option>
              {PDF_TIPOS.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </Field>
          {selectedEventoId && selectedTipo && (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg px-4 py-8 cursor-pointer hover:border-primary transition-colors">
              <Upload className="h-5 w-5" />
              <span className="text-sm font-semibold">
                {uploading ? "Enviando..." : "Selecionar arquivo PDF"}
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>
      </Modal>

      <div className="space-y-8">
        {eventos.map((evento) => {
          const eventoPdfs = pdfs.filter((p) => p.evento_id === evento.id);
          return (
            <div
              key={evento.id}
              className="rounded-2xl bg-card border border-border/60 overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-secondary/30">
                <h3 className="text-lg font-bold text-deep">{evento.nome}</h3>
                <p className="text-sm text-muted-foreground">
                  {evento.data_texto} - {evento.local}
                </p>
              </div>
              <div className="p-6">
                {eventoPdfs.length > 0 ? (
                  <div className="space-y-2">
                    {eventoPdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-primary" />
                          <div>
                            <div className="text-sm font-semibold text-deep">
                              {getTipoLabel(pdf.tipo)}
                            </div>
                            <div className="text-xs text-muted-foreground">{pdf.nome_arquivo}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Ver
                          </a>
                          <button
                            onClick={() => handleDeletePdf(pdf.id)}
                            className="text-sm text-destructive hover:underline"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum PDF cadastrado para este evento
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
