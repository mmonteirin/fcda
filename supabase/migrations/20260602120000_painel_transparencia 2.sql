-- ============ PAINEL DA TRANSPARÊNCIA ============
create table public.transparencia_documentos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('boletim', 'edital', 'prestacao_contas')),
  titulo text not null,
  descricao text,
  arquivo_url text not null,
  arquivo_nome text not null,
  data_publicacao date not null default current_date,
  publicado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Grants
grant select on public.transparencia_documentos to anon, authenticated;
grant insert, update, delete on public.transparencia_documentos to authenticated;
grant all on public.transparencia_documentos to service_role;

-- RLS
alter table public.transparencia_documentos enable row level security;

-- Leitura pública (apenas publicado)
create policy "public read transparencia" on public.transparencia_documentos 
  for select to anon, authenticated 
  using (publicado = true or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

-- Escrita restrita admin/editor
create policy "admins write transparencia" on public.transparencia_documentos 
  for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- updated_at trigger
create trigger transp_upd before update on public.transparencia_documentos 
  for each row execute function public.tg_set_updated_at();
