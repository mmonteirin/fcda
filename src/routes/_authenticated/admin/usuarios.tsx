import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { usersQuery, type UserWithRoles } from "@/lib/site-queries";
import { addUserRole, removeUserRole, createUser } from "@/lib/admin.functions";
import { AdminToolbar, AdminTable, Modal, Field } from "@/components/admin/ui";
import { Shield, ShieldCheck, X, User, Dumbbell, Building2, UserCog } from "lucide-react";
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

  async function handleAddRole(userId: string, role: "admin" | "editor" | "atleta" | "treinador" | "gestor_clube") {
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

  async function handleRemoveRole(userId: string, role: "admin" | "editor" | "atleta" | "treinador" | "gestor_clube") {
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
    <div className="space-y-6">
      <AdminToolbar 
        title="Usuários" 
        breadcrumbs={[
          { label: "Dashboard", to: "/admin" },
          { label: "Usuários", to: "/admin/usuarios" }
        ]}
        onNew={() => setNewUser({ email: "", password: "", nome: "" })}
      />

      <AdminTable>
        <thead className="bg-slate-100 dark:bg-slate-800 text-deep dark:text-white text-xs uppercase tracking-wider font-semibold">
          <tr>
            <th className="text-left px-5 py-4">Nome</th>
            <th className="text-left px-5 py-4 hidden md:table-cell">E-mail</th>
            <th className="text-left px-5 py-4">Funções</th>
            <th className="px-5 py-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-5 py-4 font-semibold text-deep dark:text-white">{user.nome || "Sem nome"}</td>
              <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">{user.email}</td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.includes("admin") && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase rounded-full px-3 py-1.5 bg-primary/15 text-primary">
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </span>
                  )}
                  {user.roles.includes("editor") && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase rounded-full px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      <Shield className="h-3 w-3" /> Editor
                    </span>
                  )}
                  {user.roles.includes("atleta") && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase rounded-full px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      <User className="h-3 w-3" /> Atleta
                    </span>
                  )}
                  {user.roles.includes("treinador") && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase rounded-full px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                      <Dumbbell className="h-3 w-3" /> Treinador
                    </span>
                  )}
                  {user.roles.includes("gestor_clube") && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase rounded-full px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                      <Building2 className="h-3 w-3" /> Gestor
                    </span>
                  )}
                  {user.roles.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">Sem funções</span>
                  )}
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
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
                  {!user.roles.includes("atleta") && (
                    <button
                      onClick={() => handleAddRole(user.id, "atleta")}
                      disabled={busy !== null}
                      className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline disabled:opacity-60"
                    >
                      + Atleta
                    </button>
                  )}
                  {!user.roles.includes("treinador") && (
                    <button
                      onClick={() => handleAddRole(user.id, "treinador")}
                      disabled={busy !== null}
                      className="text-xs font-semibold text-orange-700 dark:text-orange-400 hover:underline disabled:opacity-60"
                    >
                      + Treinador
                    </button>
                  )}
                  {!user.roles.includes("gestor_clube") && (
                    <button
                      onClick={() => handleAddRole(user.id, "gestor_clube")}
                      disabled={busy !== null}
                      className="text-xs font-semibold text-purple-700 dark:text-purple-400 hover:underline disabled:opacity-60"
                    >
                      + Gestor
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
                  {user.roles.includes("atleta") && (
                    <button
                      onClick={() => handleRemoveRole(user.id, "atleta")}
                      disabled={busy !== null}
                      className="text-xs font-semibold text-destructive hover:underline disabled:opacity-60 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Atleta
                    </button>
                  )}
                  {user.roles.includes("treinador") && (
                    <button
                      onClick={() => handleRemoveRole(user.id, "treinador")}
                      disabled={busy !== null}
                      className="text-xs font-semibold text-destructive hover:underline disabled:opacity-60 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Treinador
                    </button>
                  )}
                  {user.roles.includes("gestor_clube") && (
                    <button
                      onClick={() => handleRemoveRole(user.id, "gestor_clube")}
                      disabled={busy !== null}
                      className="text-xs font-semibold text-destructive hover:underline disabled:opacity-60 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Gestor
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-16 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <UserCog className="h-12 w-12 text-muted-foreground/50" />
                  <p>Nenhum usuário cadastrado.</p>
                </div>
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
