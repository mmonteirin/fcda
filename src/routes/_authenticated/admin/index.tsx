import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  noticiasQuery,
  eventosQuery,
  modalidadesQuery,
  diretoresQuery,
  usersQuery,
  mensagensQuery,
  filiacaoQuery,
  transparenciaQuery,
} from "@/lib/site-queries";
import {
  Newspaper,
  Calendar,
  Waves,
  Users,
  ArrowRight,
  UserCog,
  Mail,
  Building2,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(noticiasQuery(false)),
      context.queryClient.ensureQueryData(eventosQuery()),
      context.queryClient.ensureQueryData(modalidadesQuery),
      context.queryClient.ensureQueryData(diretoresQuery),
      context.queryClient.ensureQueryData(usersQuery),
      context.queryClient.ensureQueryData(mensagensQuery),
      context.queryClient.ensureQueryData(filiacaoQuery),
      context.queryClient.ensureQueryData(transparenciaQuery(false)),
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
  const filiacao = useSuspenseQuery(filiacaoQuery).data;
  const transparencia = useSuspenseQuery(transparenciaQuery(false)).data;
  const unreadCount = mensagens.filter((m) => !m.lido).length;
  const pendentesCount = filiacao.filter((f) => f.status === "pendente").length;

  const cards = [
    { to: "/admin/noticias", label: "Notícias", count: noticias.length, icon: Newspaper },
    { to: "/admin/eventos", label: "Competições", count: eventos.length, icon: Calendar },
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
    {
      to: "/admin/filiacoes",
      label: "Inscrições",
      count: pendentesCount,
      icon: Building2,
      highlight: pendentesCount > 0,
    },
    {
      to: "/admin/transparencia",
      label: "Documentos",
      count: transparencia.length,
      icon: FileText,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-deep">Dashboard FCDA</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Acompanhe a gestão de competições, inscrições, documentos e comunicação institucional.
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
      <section className="mt-10">
        <h2 className="text-lg font-bold text-deep">Próximos módulos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Áreas previstas para a evolução do sistema esportivo.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Atletas", "Clubes", "Financeiro", "Relatórios"].map((modulo) => (
            <div
              key={modulo}
              className="rounded-xl border border-dashed border-border bg-card/60 p-4"
            >
              <p className="font-semibold text-deep">{modulo}</p>
              <p className="mt-1 text-xs text-muted-foreground">Em planejamento</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
