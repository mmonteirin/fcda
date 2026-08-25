import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminToolbar, Field, Modal } from "@/components/admin/ui";
import { inputClass } from "@/components/admin/utils";
import { supabase } from "@/integrations/supabase/client";
import { asDynamicSupabase } from "@/lib/supabase-helpers";

type Ranking = { id: string; nome: string; ano: number; descricao: string | null; publicado: boolean };
type Evento = { id: string; nome: string; data_texto: string };
type Classificacao = { id: string; ranking_id: string; atleta_nome: string; ano_nascimento: number; categoria: string; clube: string; pontuacoes: Record<string, number>; pontuacao_final: number };
type RankingForm = { nome: string; ano: number; descricao: string; publicado: boolean; eventos: string[] };
type AthleteForm = Omit<Classificacao, "id" | "ranking_id" | "pontuacao_final">;
const blankRanking = (): RankingForm => ({ nome: "", ano: new Date().getFullYear(), descricao: "", publicado: false, eventos: [] });
const blankAthlete = (): AthleteForm => ({ atleta_nome: "", ano_nascimento: new Date().getFullYear() - 12, categoria: "", clube: "", pontuacoes: {} });

export const Route = createFileRoute("/_authenticated/admin/rankings")({ component: AdminRankings });

function AdminRankings() {
  const db = asDynamicSupabase(supabase);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [form, setForm] = useState<RankingForm>(blankRanking);
  const [rankingOpen, setRankingOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [classificacoes, setClassificacoes] = useState<Classificacao[]>([]);
  const [athlete, setAthlete] = useState<AthleteForm>(blankAthlete);
  const [editingAthleteId, setEditingAthleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const validEvents = useMemo(() => eventos.filter((event) => form.eventos.includes(event.id)), [eventos, form.eventos]);
  const total = Object.values(athlete.pontuacoes).reduce((sum, value) => sum + (Number(value) || 0), 0);

  const load = async () => {
    const [{ data: rankingData, error: rankingError }, { data: eventData, error: eventError }] = await Promise.all([
      db.from("rankings").select("*").order("ano", { ascending: false }),
      db.from("eventos").select("id,nome,data_texto").order("data_inicio", { ascending: false }),
    ]);
    if (rankingError || eventError) toast.error("Não foi possível carregar os rankings.");
    setRankings((rankingData ?? []) as Ranking[]);
    setEventos((eventData ?? []) as Evento[]);
  };
  useEffect(() => { void load(); }, []);
  const closeRanking = () => { setRankingOpen(false); setEditingId(null); setForm(blankRanking()); };
  const toggle = (id: string) => setForm((current) => ({ ...current, eventos: current.eventos.includes(id) ? current.eventos.filter((item) => item !== id) : [...current.eventos, id] }));
  const refreshClassifications = async (id: string) => {
    const { data, error } = await db.from("ranking_classificacoes").select("*").eq("ranking_id", id).order("pontuacao_final", { ascending: false });
    if (error) toast.error(error.message); else setClassificacoes((data ?? []) as Classificacao[]);
  };
  const saveRanking = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true);
    const values = { nome: form.nome.trim(), ano: form.ano, descricao: form.descricao.trim() || null, publicado: form.publicado };
    const result = editingId ? await db.from("rankings").update(values).eq("id", editingId).select("id").single() : await db.from("rankings").insert(values).select("id").single();
    const { data, error } = result as { data: { id: string } | null; error: { message: string } | null };
    const id = data?.id ?? editingId;
    if (error || !id) toast.error(error?.message || "Não foi possível salvar o ranking.");
    else {
      const { error: removeError } = await db.from("ranking_competicoes").delete().eq("ranking_id", id);
      const { error: linkError } = form.eventos.length ? await db.from("ranking_competicoes").insert(form.eventos.map((evento_id) => ({ ranking_id: id, evento_id }))) : { error: null };
      if (removeError || linkError) toast.error((removeError || linkError)?.message || "Não foi possível vincular as competições.");
      else { toast.success("Ranking salvo com sucesso."); closeRanking(); await load(); }
    }
    setBusy(false);
  };
  const editRanking = async (item: Ranking) => {
    const { data, error } = await db.from("ranking_competicoes").select("evento_id").eq("ranking_id", item.id);
    if (error) return toast.error(error.message);
    setForm({ nome: item.nome, ano: item.ano, descricao: item.descricao ?? "", publicado: item.publicado, eventos: ((data ?? []) as Array<{ evento_id: string }>).map((link) => link.evento_id) });
    setEditingId(item.id); setRankingOpen(true);
  };
  const manageAthletes = async (item: Ranking) => {
    const { data, error } = await db.from("ranking_competicoes").select("evento_id").eq("ranking_id", item.id);
    if (error) return toast.error(error.message);
    setRanking(item); setForm((current) => ({ ...current, eventos: ((data ?? []) as Array<{ evento_id: string }>).map((link) => link.evento_id) }));
    setAthlete(blankAthlete()); setEditingAthleteId(null); await refreshClassifications(item.id); setClassOpen(true);
  };
  const saveAthlete = async (event: React.FormEvent) => {
    event.preventDefault(); if (!ranking) return; setBusy(true);
    const values = { ...athlete, ranking_id: ranking.id, atleta_nome: athlete.atleta_nome.trim(), categoria: athlete.categoria.trim(), clube: athlete.clube.trim(), pontuacao_final: total };
    const { error } = editingAthleteId ? await db.from("ranking_classificacoes").update(values).eq("id", editingAthleteId) : await db.from("ranking_classificacoes").insert(values);
    if (error) toast.error(error.message);
    else { toast.success("Classificação salva e pontos somados."); setAthlete(blankAthlete()); setEditingAthleteId(null); await refreshClassifications(ranking.id); }
    setBusy(false);
  };
  const deleteAthlete = async (id: string) => {
    if (!confirm("Excluir esta classificação?")) return;
    const { error } = await db.from("ranking_classificacoes").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Classificação excluída."); setClassificacoes((items) => items.filter((item) => item.id !== id)); }
  };

  return <div className="space-y-6">
    <AdminToolbar title="Rankings" breadcrumbs={[{ label: "Rankings", to: "/admin/rankings" }]} onNew={() => setRankingOpen(true)} />
    <p className="text-sm text-muted-foreground">Cadastre temporadas, selecione competições válidas e calcule a classificação por atleta.</p>
    <div className="grid gap-4 sm:grid-cols-2">{rankings.map((item) => <section key={item.id} className="rounded-xl border border-border bg-card p-5"><p className="text-xs font-bold text-primary">TEMPORADA {item.ano}</p><h2 className="mt-1 text-lg font-bold text-deep">{item.nome}</h2><p className="mt-2 text-sm text-muted-foreground">{item.publicado ? "Publicado" : "Rascunho"}</p><div className="mt-4 flex gap-2"><button onClick={() => void editRanking(item)} className="rounded-lg border border-border px-3 py-2 text-xs font-bold">Editar</button><button onClick={() => void manageAthletes(item)} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Atletas e pontos</button></div></section>)}</div>
    <Modal open={rankingOpen} onClose={closeRanking} title={editingId ? "Editar ranking" : "Novo ranking"}><form onSubmit={saveRanking} className="space-y-4"><Field label="Nome"><input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inputClass} /></Field><Field label="Ano"><input required type="number" min="2000" max="2100" value={form.ano} onChange={(e) => setForm({ ...form, ano: Number(e.target.value) })} className={inputClass} /></Field><Field label="Descrição"><textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className={inputClass} /></Field><fieldset><legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Competições válidas</legend><div className="mt-2 max-h-48 space-y-2 overflow-auto rounded-lg border p-3">{eventos.map((event) => <label key={event.id} className="flex gap-2 text-sm"><input type="checkbox" checked={form.eventos.includes(event.id)} onChange={() => toggle(event.id)} />{event.data_texto} — {event.nome}</label>)}</div></fieldset><label className="flex gap-2 text-sm"><input type="checkbox" checked={form.publicado} onChange={(e) => setForm({ ...form, publicado: e.target.checked })} />Publicar ranking</label><div className="flex justify-end gap-3"><button type="button" onClick={closeRanking}>Cancelar</button><button disabled={busy} className="rounded-lg bg-deep px-4 py-2 font-bold text-white">{busy ? "Salvando..." : "Salvar"}</button></div></form></Modal>
    <Modal open={classOpen} onClose={() => setClassOpen(false)} title={ranking ? `Classificações — ${ranking.nome}` : "Classificações"}><form onSubmit={saveAthlete} className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Field label="Nome do atleta"><input required value={athlete.atleta_nome} onChange={(e) => setAthlete({ ...athlete, atleta_nome: e.target.value })} className={inputClass} /></Field><Field label="Ano de nascimento"><input required type="number" value={athlete.ano_nascimento} onChange={(e) => setAthlete({ ...athlete, ano_nascimento: Number(e.target.value) })} className={inputClass} /></Field><Field label="Categoria"><input required value={athlete.categoria} onChange={(e) => setAthlete({ ...athlete, categoria: e.target.value })} className={inputClass} /></Field><Field label="Clube"><input required value={athlete.clube} onChange={(e) => setAthlete({ ...athlete, clube: e.target.value })} className={inputClass} /></Field></div><fieldset><legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pontos por competição</legend><div className="mt-2 space-y-2">{validEvents.map((event) => <label key={event.id} className="flex items-center justify-between gap-3 text-sm"><span>{event.nome}</span><input type="number" min="0" step="0.01" value={athlete.pontuacoes[event.id] ?? ""} onChange={(e) => setAthlete({ ...athlete, pontuacoes: { ...athlete.pontuacoes, [event.id]: Number(e.target.value) || 0 } })} className="w-28 rounded border px-2 py-1" /></label>)}</div></fieldset><div className="rounded-lg bg-secondary p-3 font-bold text-deep">Pontuação final: {total.toLocaleString("pt-BR")}</div><div className="flex justify-end gap-3"><button type="button" onClick={() => { setAthlete(blankAthlete()); setEditingAthleteId(null); }}>Limpar</button><button disabled={busy} className="rounded-lg bg-deep px-4 py-2 font-bold text-white">{editingAthleteId ? "Atualizar" : "Adicionar atleta"}</button></div></form><div className="mt-6 overflow-x-auto border-t pt-4"><table className="w-full text-sm"><thead className="text-left text-muted-foreground"><tr><th>Atleta</th><th>Clube</th><th>Total</th><th /></tr></thead><tbody>{classificacoes.map((item) => <tr key={item.id} className="border-t"><td className="py-2 font-medium">{item.atleta_nome}</td><td>{item.clube}</td><td>{Number(item.pontuacao_final).toLocaleString("pt-BR")}</td><td className="space-x-2 text-right"><button type="button" onClick={() => { setEditingAthleteId(item.id); setAthlete({ atleta_nome: item.atleta_nome, ano_nascimento: item.ano_nascimento, categoria: item.categoria, clube: item.clube, pontuacoes: item.pontuacoes ?? {} }); }} className="text-primary">Editar</button><button type="button" onClick={() => void deleteAthlete(item.id)} className="text-destructive">Excluir</button></td></tr>)}</tbody></table></div></Modal>
  </div>;
}
