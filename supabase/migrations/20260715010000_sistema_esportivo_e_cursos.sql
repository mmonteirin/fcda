create table public.rankings (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ano int not null check (ano between 2000 and 2100),
  descricao text,
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ranking_competicoes (
  ranking_id uuid not null references public.rankings(id) on delete cascade,
  evento_id uuid not null references public.eventos(id) on delete restrict,
  primary key (ranking_id, evento_id)
);

create table public.ranking_classificacoes (
  id uuid primary key default gen_random_uuid(),
  ranking_id uuid not null references public.rankings(id) on delete cascade,
  atleta_nome text not null,
  ano_nascimento int not null check (ano_nascimento between 1900 and 2100),
  categoria text not null,
  clube text not null,
  pontuacoes jsonb not null default '{}'::jsonb,
  pontuacao_final numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recordes (
  id uuid primary key default gen_random_uuid(),
  piscina text not null check (piscina in ('olimpica', 'semiolimpica')),
  sexo text not null check (sexo in ('masculino', 'feminino', 'misto')),
  prova text not null,
  atleta_nome text not null,
  foto_url text,
  marca text not null,
  ano_estabelecimento int not null check (ano_estabelecimento between 1900 and 2100),
  publicado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cursos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  resumo text not null,
  descricao text,
  data_inicio date,
  data_fim date,
  local text,
  carga_horaria text,
  imagem_url text,
  link_inscricao text,
  publicado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (data_fim is null or data_inicio is null or data_fim >= data_inicio)
);

grant select on public.rankings, public.ranking_competicoes, public.ranking_classificacoes, public.recordes, public.cursos to anon, authenticated;
grant insert, update, delete on public.rankings, public.ranking_competicoes, public.ranking_classificacoes, public.recordes, public.cursos to authenticated;

alter table public.rankings enable row level security;
alter table public.ranking_competicoes enable row level security;
alter table public.ranking_classificacoes enable row level security;
alter table public.recordes enable row level security;
alter table public.cursos enable row level security;

create policy "public read rankings" on public.rankings for select using (publicado or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
create policy "public read ranking competicoes" on public.ranking_competicoes for select using (true);
create policy "public read ranking classificacoes" on public.ranking_classificacoes for select using (true);
create policy "public read recordes" on public.recordes for select using (publicado or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
create policy "public read cursos" on public.cursos for select using (publicado or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create policy "editors manage rankings" on public.rankings for all to authenticated using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')) with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
create policy "editors manage ranking competicoes" on public.ranking_competicoes for all to authenticated using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')) with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
create policy "editors manage ranking classificacoes" on public.ranking_classificacoes for all to authenticated using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')) with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
create policy "editors manage recordes" on public.recordes for all to authenticated using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')) with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
create policy "editors manage cursos" on public.cursos for all to authenticated using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')) with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create trigger rankings_updated_at before update on public.rankings for each row execute function public.tg_set_updated_at();
create trigger ranking_classificacoes_updated_at before update on public.ranking_classificacoes for each row execute function public.tg_set_updated_at();
create trigger recordes_updated_at before update on public.recordes for each row execute function public.tg_set_updated_at();
create trigger cursos_updated_at before update on public.cursos for each row execute function public.tg_set_updated_at();
