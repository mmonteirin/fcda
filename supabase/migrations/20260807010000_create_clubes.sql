-- ============ CLUBES ============
create table public.clubes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  sigla text,
  logo_url text,
  cidade text,
  estado text,
  fundacao date,
  email text,
  telefone text,
  site_url text,
  endereco text,
  ativo boolean not null default true,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Grants
grant select on public.clubes to anon, authenticated;
grant insert, update, delete on public.clubes to authenticated;
grant all on public.clubes to service_role;

-- RLS
alter table public.clubes enable row level security;

-- Leitura pública (apenas ativos)
create policy "public read clubes" on public.clubes 
  for select to anon, authenticated 
  using (ativo = true or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

-- Escrita restrita admin/editor
create policy "admins write clubes" on public.clubes 
  for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- updated_at trigger
create trigger club_upd before update on public.clubes 
  for each row execute function public.tg_set_updated_at();

-- Dados de exemplo
insert into public.clubes (nome, sigla, cidade, estado, fundacao, ativo, ordem) values
  ('Associação Cearense de Natação', 'ACN', 'Fortaleza', 'CE', '1995-03-15', true, 1),
  ('Clube de Natação Cearense', 'CNC', 'Fortaleza', 'CE', '1988-07-20', true, 2),
  ('Associação de Natação do Ceará', 'ANC', 'Juazeiro do Norte', 'CE', '2000-01-10', true, 3);
