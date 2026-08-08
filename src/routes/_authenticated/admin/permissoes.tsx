import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { AdminToolbar } from "@/components/admin/ui";
import { asDynamicSupabase } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

const roles = ["editor", "gestor_clube"] as const;
const permissions = [
  ["content.manage", "Gerenciar notícias e banners"],
  ["events.manage", "Gerenciar competições e documentos"],
  ["club.manage", "Gerenciar clubes e filiações"],
  ["reports.view", "Consultar relatórios e exportar dados"],
] as const;
type Permission = (typeof permissions)[number][0];

export const Route = createFileRoute("/_authenticated/admin/permissoes")({
  component: AdminPermissions,
});

function AdminPermissions() {
  const [granted, setGranted] = useState<string[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  useEffect(() => {
    void (async () => {
      const { data } = await asDynamicSupabase(supabase)
        .from("admin_role_permissions")
        .select("role, permission");
      setGranted(
        ((data as Array<{ role: string; permission: string }> | null) ?? []).map(
          (item) => `${item.role}:${item.permission}`,
        ),
      );
    })();
  }, []);
  async function toggle(role: (typeof roles)[number], permission: Permission) {
    const key = `${role}:${permission}`;
    setSaving(key);
    const sb = asDynamicSupabase(supabase);
    if (granted.includes(key))
      await sb
        .from("admin_role_permissions")
        .delete()
        .eq("role", role)
        .eq("permission", permission);
    else await sb.from("admin_role_permissions").insert({ role, permission });
    setGranted((items) =>
      items.includes(key) ? items.filter((item) => item !== key) : [...items, key],
    );
    setSaving(null);
  }
  return (
    <div className="space-y-6">
      <AdminToolbar title="Permissões por função" breadcrumbs={[{ label: "Permissões" }]} />
      <div className="rounded-2xl border border-border bg-primary/5 p-5 text-sm text-muted-foreground">
        <ShieldCheck className="mr-2 inline h-5 w-5 text-primary" />
        Administradores mantêm acesso total. Ajuste abaixo o que cada função operacional pode
        realizar.
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left dark:bg-slate-800">
            <tr>
              <th className="px-5 py-4">Permissão</th>
              {roles.map((role) => (
                <th key={role} className="px-5 py-4 text-center capitalize">
                  {role.replaceAll("_", " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map(([permission, label]) => (
              <tr key={permission} className="border-t border-border">
                <td className="px-5 py-4">
                  <p className="font-semibold text-deep dark:text-white">{label}</p>
                  <code className="text-xs text-muted-foreground">{permission}</code>
                </td>
                {roles.map((role) => {
                  const key = `${role}:${permission}`;
                  const active = granted.includes(key);
                  return (
                    <td key={role} className="px-5 py-4 text-center">
                      <button
                        onClick={() => void toggle(role, permission)}
                        disabled={saving !== null}
                        aria-pressed={active}
                        className={`inline-grid h-9 w-9 place-items-center rounded-lg border transition-colors ${active ? "border-primary bg-primary text-white" : "border-border text-transparent hover:border-primary"}`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
