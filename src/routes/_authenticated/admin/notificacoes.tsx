import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Info, Search, TriangleAlert } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const groupedNotifications = notifications.reduce<
    Array<Notification & { count: number; ids: string[] }>
  >((groups, notification) => {
    const existing = groups.find(
      (group) =>
        group.titulo === notification.titulo &&
        group.descricao === notification.descricao &&
        group.tipo === notification.tipo,
    );
    if (existing) {
      existing.count += 1;
      existing.ids.push(notification.id);
      existing.lida = existing.lida && notification.lida;
    } else {
      groups.push({ ...notification, count: 1, ids: [notification.id] });
    }
    return groups;
  }, []);

  const visibleNotifications = groupedNotifications.filter((item) => {
    const matchesReadState = !unreadOnly || !item.lida;
    const searchText = `${item.titulo} ${item.descricao ?? ""}`.toLocaleLowerCase("pt-BR");
    return matchesReadState && searchText.includes(search.trim().toLocaleLowerCase("pt-BR"));
  });

  async function markAsRead(ids: string[]) {
    const { error: updateError } = await asDynamicSupabase(supabase)
      .from("admin_notificacoes")
      .update({ lida: true })
      .in("id", ids);
    if (updateError) {
      setError("Não foi possível atualizar a notificação. Tente novamente.");
      return;
    }
    setNotifications((items) =>
      items.map((item) => (ids.includes(item.id) ? { ...item, lida: true } : item)),
    );
    setError(null);
  }

  async function markAllRead() {
    const { error: updateError } = await asDynamicSupabase(supabase)
      .from("admin_notificacoes")
      .update({ lida: true })
      .eq("lida", false);
    if (updateError) {
      setError("Não foi possível marcar as notificações como lidas. Tente novamente.");
      return;
    }
    setNotifications((items) => items.map((item) => ({ ...item, lida: true })));
    setError(null);
  }

  return (
    <div className="space-y-6">
      <AdminToolbar title="Notificações" breadcrumbs={[{ label: "Notificações" }]} />
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar notificações"
            aria-label="Buscar notificações"
            className="min-h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary"
          />
        </label>
        <button
          type="button"
          aria-pressed={unreadOnly}
          onClick={() => setUnreadOnly((value) => !value)}
          className={`min-h-10 rounded-xl border px-4 text-sm font-semibold transition ${unreadOnly ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
        >
          {unreadOnly ? "Mostrando não lidas" : "Somente não lidas"}
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
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
        {!loading && visibleNotifications.length === 0 && notifications.length > 0 && (
          <p className="p-10 text-center text-sm text-muted-foreground">
            Nenhuma notificação corresponde a esses filtros.
          </p>
        )}
        {visibleNotifications.map((item) => (
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
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold leading-snug text-deep dark:text-white">
                  {item.titulo}
                </h2>
                {item.count > 1 && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {item.count} alterações
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.descricao}</p>
              <time className="mt-2 block text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleString("pt-BR")}
              </time>
            </div>
            {!item.lida && (
              <div className="flex shrink-0 items-center gap-2">
                <Bell className="h-4 w-4 text-primary" aria-label="Não lida" />
                <button
                  type="button"
                  onClick={() => void markAsRead(item.ids)}
                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Marcar ${item.titulo} como lida`}
                  title="Marcar como lida"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
