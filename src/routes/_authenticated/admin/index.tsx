import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AdminToolbar } from "@/components/admin/ui";
import {
  noticiasQuery,
  eventosQuery,
  modalidadesQuery,
  diretoresQuery,
  usersQuery,
  mensagensQuery,
  filiacaoQuery,
  transparenciaQuery,
  parceirosQuery,
  cursosQuery,
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
  GraduationCap,
  Handshake,
  TrendingUp,
  Activity,
  Clock,
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
      context.queryClient.ensureQueryData(parceirosQuery(true)),
      context.queryClient.ensureQueryData(cursosQuery(false)),
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
  const parceiros = useSuspenseQuery(parceirosQuery(true)).data;
  const cursos = useSuspenseQuery(cursosQuery(false)).data;
  const unreadCount = mensagens.filter((m) => !m.lido).length;
  const pendentesCount = filiacao.filter((f) => f.status === "pendente").length;
  const publishedNews = noticias.filter((n) => n.publicado).length;
  const publishedCursos = cursos.filter((c) => c.publicado).length;

  const mainCards = [
    { to: "/admin/noticias", label: "Notícias", count: noticias.length, published: publishedNews, icon: Newspaper, color: "bg-blue-500" },
    { to: "/admin/eventos", label: "Competições", count: eventos.length, icon: Calendar, color: "bg-emerald-500" },
    { to: "/admin/cursos", label: "Cursos", count: cursos.length, published: publishedCursos, icon: GraduationCap, color: "bg-purple-500" },
    { to: "/admin/clubes", label: "Clubes", count: 0, icon: Building2, color: "bg-orange-500" },
  ];

  const secondaryCards = [
    { to: "/admin/modalidades", label: "Modalidades", count: modalidades.length, icon: Waves },
    { to: "/admin/diretores", label: "Diretoria", count: diretores.length, icon: Users },
    { to: "/admin/usuarios", label: "Usuários", count: users.length, icon: UserCog },
    { to: "/admin/parceiros", label: "Parceiros", count: parceiros.length, icon: Handshake },
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
    <div className="space-y-8">
      <AdminToolbar title="Dashboard" breadcrumbs={[{ label: "Dashboard", to: "/admin" }]} />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 grid place-items-center text-white shadow-lg shadow-primary/25">
              <Activity className="h-7 w-7" />
            </div>
            <div>
              <div className="text-3xl font-bold text-deep dark:text-white">{eventos.length}</div>
              <div className="text-sm text-muted-foreground">Competições</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 grid place-items-center text-white shadow-lg shadow-emerald-500/25">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <div className="text-3xl font-bold text-deep dark:text-white">{users.length}</div>
              <div className="text-sm text-muted-foreground">Usuários</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gold to-gold/80 grid place-items-center text-deep shadow-lg shadow-gold/25">
              <TrendingUp className="h-7 w-7" />
            </div>
            <div>
              <div className="text-3xl font-bold text-deep dark:text-white">{publishedNews}</div>
              <div className="text-sm text-muted-foreground">Notícias publicadas</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 grid place-items-center text-white shadow-lg shadow-purple-500/25">
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <div className="text-3xl font-bold text-deep dark:text-white">{pendentesCount}</div>
              <div className="text-sm text-muted-foreground">Inscrições pendentes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Cards */}
      <section>
        <h2 className="text-xl font-bold text-deep dark:text-white mb-6">Áreas Principais</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainCards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-border p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`h-14 w-14 rounded-xl ${c.color} grid place-items-center text-white shadow-lg`}>
                  <c.icon className="h-7 w-7" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-3xl font-bold text-deep dark:text-white">{c.count}</div>
              <div className="text-sm text-muted-foreground">{c.label}</div>
              {c.published !== undefined && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {c.published} publicados
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Secondary Navigation */}
      <section>
        <h2 className="text-xl font-bold text-deep dark:text-white mb-6">Gestão Administrativa</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {secondaryCards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className={`group rounded-2xl bg-white dark:bg-slate-900 border p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                c.highlight ? "border-primary/50 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl grid place-items-center ${
                      c.highlight ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/25" : "bg-slate-100 dark:bg-slate-800 text-deep dark:text-white"
                    }`}
                  >
                    <c.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-deep dark:text-white">{c.count}</div>
                    <div className="text-sm text-muted-foreground">{c.label}</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-border p-6">
        <h2 className="text-xl font-bold text-deep dark:text-white mb-6">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/noticias"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-deep to-deep/90 text-white px-5 py-3 text-sm font-semibold hover:shadow-lg hover:shadow-deep/25 transition-all hover:-translate-y-0.5"
          >
            <Newspaper className="h-4 w-4" /> Nova notícia
          </Link>
          <Link
            to="/admin/eventos"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white px-5 py-3 text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
          >
            <Calendar className="h-4 w-4" /> Novo evento
          </Link>
          <Link
            to="/admin/cursos"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold/90 text-deep px-5 py-3 text-sm font-semibold hover:shadow-lg hover:shadow-gold/25 transition-all hover:-translate-y-0.5"
          >
            <GraduationCap className="h-4 w-4" /> Novo curso
          </Link>
          <Link
            to="/admin/filiacoes"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Building2 className="h-4 w-4" /> Revisar inscrições
          </Link>
        </div>
      </section>
    </div>
  );
}
