import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, Info, TriangleAlert } from "lucide-react";
import { AdminToolbar } from "@/components/admin/ui";
import { asDynamicSupabase } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

type Notification = {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: "informacao" | "atencao" | "sucesso";
  lida: boolean;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/admin/notificacoes")({
  component: AdminNotifications,
});

function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    setLoading(true);
    const { data } = await asDynamicSupabase(supabase)
      .from("admin_notificacoes")
      .select("id, titulo, descricao, tipo, lida, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifications((data as Notification[] | null) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  async function markAllRead() {
    await asDynamicSupabase(supabase)
      .from("admin_notificacoes")
      .update({ lida: true })
      .eq("lida", false);
    setNotifications((items) => items.map((item) => ({ ...item, lida: true })));
  }

  return (
    <div className="space-y-6">
      <AdminToolbar title="Notificações" breadcrumbs={[{ label: "Notificações" }]} />
      <div className="flex items-center justify-between rounded-2xl border border-border bg-primary/5 p-5">
        <p className="text-sm text-muted-foreground">
          {notifications.filter((item) => !item.lida).length} notificações não lidas
        </p>
        <button
          onClick={markAllRead}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-slate-900">
        {loading ? (
          <p className="p-8 text-sm text-muted-foreground">Carregando notificações...</p>
        ) : null}
        {!loading && notifications.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            Nenhuma notificação registrada ainda.
          </p>
        ) : null}
        {notifications.map((item) => (
          <article
            key={item.id}
            className={`flex gap-4 border-b border-border p-5 last:border-0 ${item.lida ? "opacity-70" : "bg-primary/[0.03]"}`}
          >
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.tipo === "atencao" ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"}`}
            >
              {item.tipo === "atencao" ? (
                <TriangleAlert className="h-5 w-5" />
              ) : (
                <Info className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-deep dark:text-white">{item.titulo}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.descricao}</p>
              <time className="mt-2 block text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleString("pt-BR")}
              </time>
            </div>
            {!item.lida && <Bell className="h-4 w-4 text-primary" aria-label="Não lida" />}
          </article>
        ))}
      </div>
    </div>
  );
}
