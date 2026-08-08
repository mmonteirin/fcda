create table public.newsletter_inscritos (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
grant insert on public.newsletter_inscritos to anon, authenticated;
alter table public.newsletter_inscritos enable row level security;
create policy "public subscribe newsletter" on public.newsletter_inscritos for insert to anon, authenticated with check (true);
