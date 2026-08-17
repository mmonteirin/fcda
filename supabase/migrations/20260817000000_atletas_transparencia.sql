create table if not exists public.atletas_transparencia (
  id uuid primary key default gen_random_uuid(),
  registro text not null unique,
  nome text not null,
  clube text not null,
  data_nascimento date,
  vinculo text not null check (vinculo in ('confederado', 'vinculado')),
  status text not null default 'ATIVO',
  atualizado_em timestamptz not null default now()
);
alter table public.atletas_transparencia enable row level security;
create policy "public read atletas transparencia" on public.atletas_transparencia for select using (true);
create policy "staff manage atletas transparencia" on public.atletas_transparencia for all to authenticated using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')) with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
