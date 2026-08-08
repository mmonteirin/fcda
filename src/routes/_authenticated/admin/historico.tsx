import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { History, Plus, Pencil, Trash2 } from "lucide-react";
import { AdminToolbar } from "@/components/admin/ui";
import { asDynamicSupabase } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

type AuditLog = {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: "create" | "update" | "delete";
  created_at: string;
};
const actionMeta = {
  create: { label: "Cadastro", icon: Plus, color: "text-emerald-600" },
  update: { label: "Atualização", icon: Pencil, color: "text-blue-600" },
  delete: { label: "Exclusão", icon: Trash2, color: "text-red-600" },
};

export const Route = createFileRoute("/_authenticated/admin/historico")({
  component: AdminHistory,
});

function AdminHistory() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  useEffect(() => {
    void (async () => {
      const { data } = await asDynamicSupabase(supabase)
        .from("admin_audit_logs")
        .select("id, entity_type, entity_id, action, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      setLogs((data as AuditLog[] | null) ?? []);
    })();
  }, []);
  return (
    <div className="space-y-6">
      <AdminToolbar title="Histórico de alterações" breadcrumbs={[{ label: "Histórico" }]} />
      <div className="rounded-2xl border border-border bg-white p-2 shadow-sm dark:bg-slate-900">
        {logs.length === 0 ? (
          <div className="grid min-h-52 place-items-center text-center text-sm text-muted-foreground">
            <div>
              <History className="mx-auto mb-3 h-8 w-8" />
              Nenhuma alteração registrada ainda.
            </div>
          </div>
        ) : (
          logs.map((log) => {
            const meta = actionMeta[log.action];
            const Icon = meta.icon;
            return (
              <div
                key={log.id}
                className="flex items-center gap-4 border-b border-border p-4 last:border-0"
              >
                <Icon className={`h-5 w-5 ${meta.color}`} />
                <div className="flex-1">
                  <p className="font-medium text-deep dark:text-white">
                    {meta.label} em {log.entity_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Registro {log.entity_id ?? "sem identificador"}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString("pt-BR")}
                </time>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
