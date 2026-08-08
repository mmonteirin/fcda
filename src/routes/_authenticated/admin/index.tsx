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
  Download,
  FileDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { exportCsv, printReport } from "@/lib/admin-export";

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
  const reportRows = [
    { Indicador: "Competições", Total: eventos.length },
    { Indicador: "Notícias publicadas", Total: publishedNews },
    { Indicador: "Cursos publicados", Total: publishedCursos },
    { Indicador: "Usuários", Total: users.length },
    { Indicador: "Inscrições pendentes", Total: pendentesCount },
  ];
  const eventsByModality = Object.entries(
    eventos.reduce<Record<string, number>>((totals, event) => {
      const label = event.modalidade || "Não informada";
      totals[label] = (totals[label] ?? 0) + 1;
      return totals;
    }, {}),
  ).map(([name, total]) => ({ name, total }));
  const contentStatus = [
    { name: "Notícias", value: publishedNews, color: "#007f5f" },
    { name: "Cursos", value: publishedCursos, color: "#d3a32b" },
    {
      name: "Documentos",
      value: transparencia.filter((item) => item.publicado).length,
      color: "#4f46e5",
    },
  ];

  const mainCards = [
    {
      to: "/admin/noticias",
      label: "Notícias",
      count: noticias.length,
      published: publishedNews,
      icon: Newspaper,
      color: "bg-blue-500",
    },
    {
      to: "/admin/eventos",
      label: "Competições",
      count: eventos.length,
      icon: Calendar,
      color: "bg-emerald-500",
    },
    {
      to: "/admin/cursos",
      label: "Cursos",
      count: cursos.length,
      published: publishedCursos,
      icon: GraduationCap,
      color: "bg-purple-500",
    },
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

      <div className="flex flex-wrap justify-end gap-3">
        <button
          onClick={() => exportCsv("relatorio-fcda.csv", reportRows)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:text-white"
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </button>
        <button
          onClick={() => printReport("Relatório gerencial FCDA", reportRows)}
          className="inline-flex items-center gap-2 rounded-xl bg-deep px-4 py-2 text-sm font-semibold text-white"
        >
          <FileDown className="h-4 w-4" /> Gerar PDF
        </button>
      </div>

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

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-5">
            <h2 className="font-bold text-deep dark:text-white">Competições por modalidade</h2>
            <p className="text-sm text-muted-foreground">Distribuição dos eventos cadastrados.</p>
          </div>
          <div className="h-64">
            {eventsByModality.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventsByModality}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Bar dataKey="total" fill="#008f6b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                Cadastre competições para visualizar este gráfico.
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-5">
            <h2 className="font-bold text-deep dark:text-white">Conteúdo publicado</h2>
            <p className="text-sm text-muted-foreground">Publicações visíveis no portal.</p>
          </div>
          <div className="flex h-64 items-center">
            {contentStatus.some((item) => item.value > 0) ? (
              <>
                <ResponsiveContainer width="55%" height="100%">
                  <PieChart>
                    <Pie
                      data={contentStatus}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={54}
                      outerRadius={82}
                      paddingAngle={3}
                    >
                      {contentStatus.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 text-sm">
                  {contentStatus.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                      <strong className="ml-auto text-deep dark:text-white">{item.value}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid w-full place-items-center text-sm text-muted-foreground">
                Publique conteúdo para visualizar este gráfico.
              </div>
            )}
          </div>
        </div>
      </section>

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
                <div
                  className={`h-14 w-14 rounded-xl ${c.color} grid place-items-center text-white shadow-lg`}
                >
                  <c.icon className="h-7 w-7" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-3xl font-bold text-deep dark:text-white">{c.count}</div>
              <div className="text-sm text-muted-foreground">{c.label}</div>
              {c.published !== undefined && (
                <div className="mt-2 text-xs text-muted-foreground">{c.published} publicados</div>
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
                      c.highlight
                        ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/25"
                        : "bg-slate-100 dark:bg-slate-800 text-deep dark:text-white"
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
