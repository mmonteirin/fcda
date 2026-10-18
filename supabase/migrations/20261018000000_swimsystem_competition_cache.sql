alter table public.eventos
  add column if not exists swimsystem_meet_id text;

create unique index if not exists eventos_swimsystem_meet_id_unique
  on public.eventos (swimsystem_meet_id)
  where swimsystem_meet_id is not null;

create table if not exists public.swimsystem_competition_cache (
  meet_id text primary key,
  snapshot jsonb not null,
  last_event text not null,
  last_delivery_id text not null,
  synced_at timestamptz not null default now()
);

alter table public.swimsystem_competition_cache enable row level security;
grant select on public.swimsystem_competition_cache to anon, authenticated;
grant all on public.swimsystem_competition_cache to service_role;

drop policy if exists "public read SwimSystem competition cache"
  on public.swimsystem_competition_cache;
create policy "public read SwimSystem competition cache"
  on public.swimsystem_competition_cache
  for select to anon, authenticated
  using (exists (
    select 1 from public.eventos
    where eventos.swimsystem_meet_id = swimsystem_competition_cache.meet_id
  ));
