-- ============ MENSAGENS ============
create table public.mensagens (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefone text,
  assunto text not null,
  mensagem text not null,
  lido boolean not null default false,
  created_at timestamptz not null default now()
);

-- Grants
grant select on public.mensagens to authenticated;
grant insert on public.mensagens to anon, authenticated;
grant update, delete on public.mensagens to authenticated;
grant all on public.mensagens to service_role;

-- RLS
alter table public.mensagens enable row level security;

-- Política: qualquer um pode inserir (incluindo anônimo)
create policy "anyone can insert mensagens" on public.mensagens
  for insert to anon, authenticated
  with check (true);

-- Política: apenas authenticated podem ler
create policy "authenticated can read mensagens" on public.mensagens
  for select to authenticated
  using (true);

-- Política: admin/editor podem atualizar e deletar
create policy "admins write mensagens" on public.mensagens
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));