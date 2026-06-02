import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  noticiasQuery,
  eventosQuery,
  modalidadesQuery,
  diretoresQuery,
  usersQuery,
  mensagensQuery,
} from "@/lib/site-queries";
import { Newspaper, Calendar, Waves, Users, ArrowRight, UserCog, Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(noticiasQuery(false)),
      context.queryClient.ensureQueryData(eventosQuery()),
      context.queryClient.ensureQueryData(modalidadesQuery),
      context.queryClient.ensureQueryData(diretoresQuery),
      context.queryClient.ensureQueryData(usersQuery),
      context.queryClient.ensureQueryData(mensagensQuery),
    ]),
  errorComponent: ({ error }) => <div className="text-destructive">Erro: {error.message}</div>,
  component: AdminIndex,
});

function AdminIndex() {
  const noticias = useSuspenseQuery(noticiasQuery(false)).data;
  const eventos = useSuspenseQuery(eventosQuery()).data;
  const modalidades = useSuspenseQuery(modalidadesQuery).data;
  const diretores = useSuspenseQuery(diretoresQuery).data;
  const users = useSuspenseQuery(usersQuery).data;
  const mensagens = useSuspenseQuery(mensagensQuery).data;
  const unreadCount = mensagens.filter((m) => !m.lido).length;

  const cards = [
    { to: "/admin/noticias", label: "Notícias", count: noticias.length, icon: Newspaper },
    { to: "/admin/eventos", label: "Eventos", count: eventos.length, icon: Calendar },
    { to: "/admin/modalidades", label: "Modalidades", count: modalidades.length, icon: Waves },
    { to: "/admin/diretores", label: "Diretoria", count: diretores.length, icon: Users },
    { to: "/admin/usuarios", label: "Usuários", count: users.length, icon: UserCog },
    {
      to: "/admin/mensagens",
      label: "Mensagens",
      count: unreadCount,
      icon: Mail,
      highlight: unreadCount > 0,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-deep">Visão geral</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bem-vindo ao painel. Selecione uma seção para gerenciar o conteúdo do site.
      </p>
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`rounded-2xl bg-card border p-6 shadow-card hover:shadow-elegant transition-all hover:-translate-y-0.5 ${
              c.highlight ? "border-primary/50 bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`h-11 w-11 rounded-xl grid place-items-center text-primary-foreground ${
                  c.highlight ? "bg-primary" : "bg-emerald-gradient"
                }`}
              >
                <c.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-5 text-3xl font-bold text-deep">{c.count}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
