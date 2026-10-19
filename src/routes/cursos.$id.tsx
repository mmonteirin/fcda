import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { cursoByIdQuery } from "@/lib/api/site-queries";
import { ArrowLeft, Calendar, Clock, ExternalLink, MapPin } from "lucide-react";

export const Route = createFileRoute("/cursos/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(cursoByIdQuery(params.id)),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.titulo} — Cursos FCDA` : "Curso — FCDA" }, { name: "description", content: loaderData?.resumo ?? "Detalhes dos cursos e capacitações oferecidos pela FCDA." }, ...(loaderData?.imagem_url ? [{ property: "og:image", content: loaderData.imagem_url }] : [])] }),
  component: CursoDetalhe,
});

function CursoDetalhe() {
  const { id } = Route.useParams();
  const curso = useSuspenseQuery(cursoByIdQuery(id)).data;
  if (!curso) return <SiteLayout><section className="mx-auto max-w-3xl px-6 py-28 text-center"><h1 className="text-3xl font-bold text-deep">Curso não encontrado</h1><Link to="/cursos" className="mt-6 inline-flex items-center gap-2 font-semibold text-primary"><ArrowLeft className="h-4 w-4"/>Voltar aos cursos</Link></section></SiteLayout>;
  const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`)) : null;
  const inicio = formatDate(curso.data_inicio);
  const fim = formatDate(curso.data_fim);
  const encerrado = Boolean(curso.data_fim && curso.data_fim < new Date().toISOString().slice(0, 10));
  return <SiteLayout><article><section className="bg-hero py-14 text-primary-foreground"><div className="mx-auto max-w-5xl px-6"><Link to="/cursos" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground/80 hover:text-white"><ArrowLeft className="h-4 w-4"/>Todos os cursos</Link><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-gold">Formação e capacitação</p><h1 className="mt-3 text-4xl font-bold md:text-5xl">{curso.titulo}</h1><p className="mt-4 max-w-3xl text-lg text-primary-foreground/80">{curso.resumo}</p></div></section>
    <section className="py-12"><div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-[1fr_300px]"> <div>{curso.imagem_url && <img src={curso.imagem_url} alt={`Imagem do curso ${curso.titulo}`} fetchPriority="high" decoding="async" className="mb-8 aspect-video w-full rounded-2xl object-cover shadow-card"/>}<h2 className="text-2xl font-bold text-deep">Sobre o curso</h2><div className="mt-4 whitespace-pre-line text-lg leading-relaxed text-foreground">{curso.descricao || curso.resumo}</div></div><aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card"><h2 className="text-lg font-bold text-deep">Informações</h2><div className="mt-5 space-y-4 text-sm text-muted-foreground">{(inicio || fim) && <p className="flex gap-3"><Calendar className="h-5 w-5 shrink-0 text-primary"/><span>{inicio}{fim && inicio !== fim ? ` — ${fim}` : ""}</span></p>}{curso.local && <p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-primary"/><span>{curso.local}</span></p>}{curso.carga_horaria && <p className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-primary"/><span>{curso.carga_horaria}</span></p>}</div>{curso.link_inscricao && !encerrado && <a href={curso.link_inscricao} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-5 py-3 text-sm font-bold text-deep hover:opacity-90">Inscrever-se <ExternalLink className="h-4 w-4"/></a>}<p className="mt-4 text-center text-xs font-semibold text-muted-foreground">{encerrado ? "Inscrições encerradas" : curso.link_inscricao ? "Inscrições abertas" : "Inscrições em breve"}</p></aside></div></section></article></SiteLayout>;
}
