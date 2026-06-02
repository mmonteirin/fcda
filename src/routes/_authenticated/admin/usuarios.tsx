import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { usersQuery, type UserWithRoles } from "@/lib/site-queries";
import { addUserRole, removeUserRole, createUser } from "@/lib/admin.functions";
import { AdminToolbar, AdminTable, Modal, Field } from "@/components/admin/ui";
import { Shield, ShieldCheck, X } from "lucide-react";
import { useInvalidate, inputClass } from "@/components/admin/utils";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  loader: ({ context }) => context.queryClient.ensureQueryData(usersQuery),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: AdminUsuarios,
});

function AdminUsuarios() {
  const users = useSuspenseQuery(usersQuery).data as UserWithRoles[];
  const addRole = useServerFn(addUserRole);
  const removeRole = useServerFn(removeUserRole);
  const create = useServerFn(createUser);
  const invalidate = useInvalidate(["users"]);
  const [busy, setBusy] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<{ email: string; password: string; nome: string } | null>(
    null,
  );
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleAddRole(userId: string, role: "admin" | "editor") {
    setBusy(`${userId}-${role}`);
    try {
      await addRole({ data: { user_id: userId, role } });
      invalidate();
    } catch (e: unknown) {
      console.error("Erro ao adicionar role:", e);
    } finally {
      setBusy(null);
    }
  }

  async function handleRemoveRole(userId: string, role: "admin" | "editor") {
    setBusy(`${userId}-${role}`);
    try {
      await removeRole({ data: { user_id: userId, role } });
      invalidate();
    } catch (e: unknown) {
      console.error("Erro ao remover role:", e);
    } finally {
      setBusy(null);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUser) return;
    setCreateBusy(true);
    setCreateError(null);
    try {
      await create({ data: newUser });
      invalidate();
      setNewUser(null);
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Erro ao criar usuário");
    } finally {
      setCreateBusy(false);
    }
  }

  return (
    <div>
      <AdminToolbar
        title="Usuários"
        onNew={() => setNewUser({ email: "", password: "", nome: "" })}
      />

      <AdminTable>
        <thead className="bg-secondary/60 text-deep text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left px-4 py-3">Nome</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">E-mail</th>
            <th className="text-left px-4 py-3">Funções</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-border">
              <td className="px-4 py-3 font-semibold text-deep">{user.nome || "Sem nome"}</td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{user.email}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.includes("admin") && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase rounded-full px-2.5 py-1 bg-primary/15 text-primary">
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </span>
                  )}
                  {user.roles.includes("editor") && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase rounded-full px-2.5 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      <Shield className="h-3 w-3" /> Editor
                    </span>
                  )}
                  {user.roles.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">Sem funções</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {!user.roles.includes("admin") && (
                    <button
                      onClick={() => handleAddRole(user.id, "admin")}
                      disabled={busy !== null}
                      className="text-xs font-semibold text-primary hover:underline disabled:opacity-60"
                    >
                      + Admin
                    </button>
                  )}
                  {!user.roles.includes("editor") && (
                    <button
                      onClick={() => handleAddRole(user.id, "editor")}
                      disabled={busy !== null}
                      className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline disabled:opacity-60"
                    >
                      + Editor
                    </button>
                  )}
                  {user.roles.includes("admin") && (
                    <button
                      onClick={() => handleRemoveRole(user.id, "admin")}
                      disabled={busy !== null}
                      className="text-xs font-semibold text-destructive hover:underline disabled:opacity-60 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Admin
                    </button>
                  )}
                  {user.roles.includes("editor") && (
                    <button
                      onClick={() => handleRemoveRole(user.id, "editor")}
                      disabled={busy !== null}
                      className="text-xs font-semibold text-destructive hover:underline disabled:opacity-60 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Editor
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                Nenhum usuário cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </AdminTable>

      <Modal open={!!newUser} onClose={() => setNewUser(null)} title="Novo usuário">
        {newUser && (
          <form onSubmit={handleCreateUser} className="space-y-4">
            <Field label="Nome">
              <input
                className={inputClass}
                value={newUser.nome}
                onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                required
              />
            </Field>
            <Field label="E-mail">
              <input
                type="email"
                className={inputClass}
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </Field>
            <Field label="Senha">
              <input
                type="password"
                className={inputClass}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                minLength={6}
              />
            </Field>

            {createError && <div className="text-sm text-destructive">{createError}</div>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewUser(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                disabled={createBusy}
                className="rounded-lg bg-deep text-deep-foreground px-4 py-2 text-sm font-bold disabled:opacity-60"
              >
                {createBusy ? "Criando..." : "Criar usuário"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
