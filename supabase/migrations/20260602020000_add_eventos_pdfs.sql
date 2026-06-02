-- ============ EVENTOS PDFS ============
create type public.pdf_tipo as enum (
  'resultados',
  'pontuacao',
  'eficiencia',
  'recordes',
  'quadro_de_medalhas',
  'indice_tecnico',
  'programa_de_provas',
  'inscritos_por_clube',
  'relacao_de_inscritos',
  'balizamentos',
  'resultados_gerais',
  'regulamentos',
  'relacao_de_cortes',
  'mapa_de_inscricao',
  'indices',
  'lista_de_hoteis',
  'outros',
  'sumula',
  'tabela_de_jogos',
  'mapa_da_prova',
  'termo_de_responsabilidade',
  'ranking',
  'inscricoes'
);

create table public.eventos_pdfs (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  tipo pdf_tipo not null,
  url text not null,
  nome_arquivo text not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  data_upload timestamptz not null default now()
);

-- Grants
grant select on public.eventos_pdfs to anon, authenticated;
grant insert, update, delete on public.eventos_pdfs to authenticated;
grant all on public.eventos_pdfs to service_role;

-- RLS
alter table public.eventos_pdfs enable row level security;

-- Leitura pública
create policy "public read eventos_pdfs" on public.eventos_pdfs for select to anon, authenticated using (true);

-- Escrita restrita admin/editor
create policy "admins write eventos_pdfs" on public.eventos_pdfs for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- Adicionar coluna ano na tabela eventos para filtragem
alter table public.eventos add column if not exists ano int;
