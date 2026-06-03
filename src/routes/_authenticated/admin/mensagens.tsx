import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useState } from "react";
import { mensagensQuery, type Mensagem } from "@/lib/site-queries";
import { markMensagemAsRead, deleteMensagem } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { AdminToolbar } from "@/components/admin/ui";
import { useInvalidate } from "@/components/admin/utils";
import { Mail, Trash2, Check, Clock, User, Phone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/mensagens")({
  loader: ({ context }) => context.queryClient.ensureQueryData(mensagensQuery),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: AdminMensagens,
});

function AdminMensagens() {
  const mensagens = useSuspenseQuery(mensagensQuery).data;
  const [err, setErr] = useState<string | null>(null);
  const [selectedMensagem, setSelectedMensagem] = useState<Mensagem | null>(null);

  const invalidate = useInvalidate(["mensagens"]);

  async function handleMarkAsRead(id: string) {
    try {
      await markMensagemAsRead(supabase, id);
      invalidate();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao marcar como lida");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta mensagem?")) return;
    try {
      await deleteMensagem(supabase, id);
      invalidate();
      if (selectedMensagem?.id === id) setSelectedMensagem(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao excluir mensagem");
    }
  }

  const unreadCount = mensagens.filter((m) => !m.lido).length;

  return (
    <div>
      <AdminToolbar title={`Mensagens ${unreadCount > 0 ? `(${unreadCount} não lidas)` : ""}`} />

      {err && <div className="text-sm text-destructive mb-4">{err}</div>}

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
        <div className="space-y-3">
          {mensagens.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma mensagem recebida.</p>
          ) : (
            mensagens.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedMensagem(msg)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedMensagem?.id === msg.id
                    ? "bg-primary/10 border-primary"
                    : msg.lido
                      ? "bg-card border-border hover:bg-secondary/50"
                      : "bg-card border-primary/50 hover:bg-primary/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.lido && <div className="h-2 w-2 rounded-full bg-primary" />}
                      <span className="text-sm font-semibold text-deep truncate">{msg.nome}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{msg.assunto}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedMensagem ? (
          <div className="rounded-2xl bg-card border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-deep">{selectedMensagem.assunto}</h2>
              <div className="flex items-center gap-2">
                {!selectedMensagem.lido && (
                  <button
                    onClick={() => handleMarkAsRead(selectedMensagem.id)}
                    className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-deep"
                    title="Marcar como lida"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedMensagem.id)}
                  className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-deep">{selectedMensagem.nome}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-deep">{selectedMensagem.email}</span>
              </div>
              {selectedMensagem.telefone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-deep">{selectedMensagem.telefone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {new Date(selectedMensagem.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-deep whitespace-pre-wrap">{selectedMensagem.mensagem}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border p-6 flex items-center justify-center">
            <p className="text-muted-foreground">Selecione uma mensagem para visualizar</p>
          </div>
        )}
      </div>
    </div>
  );
}
