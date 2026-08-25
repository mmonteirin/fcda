create index if not exists atletas_transparencia_clube_idx on public.atletas_transparencia (clube);
create index if not exists atletas_transparencia_vinculo_idx on public.atletas_transparencia (vinculo);
create index if not exists ranking_classificacoes_ranking_total_idx on public.ranking_classificacoes (ranking_id, pontuacao_final desc);

-- A listagem é pública; criação, importação e alteração permanecem limitadas
-- aos perfis administrativos pela policy existente.
revoke insert, update, delete on public.atletas_transparencia from anon;
