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
    <div className="space-y-6">
      <AdminToolbar 
        title={`Mensagens ${unreadCount > 0 ? `(${unreadCount} não lidas)` : ""}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Mensagens", to: "/admin/mensagens" }
        ]} 
      />

      {err && <div className="text-sm text-destructive mb-4">{err}</div>}

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
        <div className="space-y-3">
          {mensagens.length === 0 ? (
            <div className="text-center py-16">
              <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma mensagem recebida.</p>
            </div>
          ) : (
            mensagens.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedMensagem(msg)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
                  selectedMensagem?.id === msg.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : msg.lido
                      ? "border-border bg-white dark:bg-slate-900 hover:border-primary/50"
                      : "border-primary/50 bg-white dark:bg-slate-900 hover:bg-primary/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {!msg.lido && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      <span className="text-sm font-bold text-deep dark:text-white truncate">{msg.nome}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{msg.assunto}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(msg.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedMensagem ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-deep dark:text-white">{selectedMensagem.assunto}</h2>
              <div className="flex items-center gap-2">
                {!selectedMensagem.lido && (
                  <button
                    onClick={() => handleMarkAsRead(selectedMensagem.id)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-deep dark:text-white transition-colors"
                    title="Marcar como lida"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedMensagem.id)}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-deep dark:text-white">{selectedMensagem.nome}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-deep dark:text-white">{selectedMensagem.email}</span>
              </div>
              {selectedMensagem.telefone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-deep dark:text-white">{selectedMensagem.telefone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {new Date(selectedMensagem.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <p className="text-sm text-deep dark:text-white whitespace-pre-wrap">{selectedMensagem.mensagem}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6 flex items-center justify-center">
            <div className="text-center">
              <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Selecione uma mensagem para visualizar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
