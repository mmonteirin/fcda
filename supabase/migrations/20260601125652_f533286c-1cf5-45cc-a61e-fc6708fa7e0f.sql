
-- ============ ROLES ============
create type public.app_role as enum ('admin', 'editor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "admins read all profiles" on public.profiles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);

create policy "users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "admins read all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Trigger: cria profile + auto-admin para o e-mail seed
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nome', new.email));

  if new.email = 'marcos.monteiro@fcda.org.br' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ CONTEUDO ============
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create table public.modalidades (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  descricao text not null,
  img_url text,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.noticias (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  categoria text not null,
  data date not null default current_date,
  titulo text not null,
  resumo text not null,
  conteudo text,
  imagem_url text,
  publicado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  data_texto text not null,
  data_inicio date,
  nome text not null,
  local text not null,
  modalidade text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.diretores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cargo text not null,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Grants
grant select on public.modalidades, public.noticias, public.eventos, public.diretores to anon, authenticated;
grant insert, update, delete on public.modalidades, public.noticias, public.eventos, public.diretores to authenticated;
grant all on public.modalidades, public.noticias, public.eventos, public.diretores to service_role;

-- RLS
alter table public.modalidades enable row level security;
alter table public.noticias enable row level security;
alter table public.eventos enable row level security;
alter table public.diretores enable row level security;

-- Leitura pública
create policy "public read modalidades" on public.modalidades for select to anon, authenticated using (true);
create policy "public read noticias" on public.noticias for select to anon, authenticated using (publicado = true or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
create policy "public read eventos" on public.eventos for select to anon, authenticated using (true);
create policy "public read diretores" on public.diretores for select to anon, authenticated using (true);

-- Escrita restrita admin/editor
create policy "admins write modalidades" on public.modalidades for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "admins write noticias" on public.noticias for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "admins write eventos" on public.eventos for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "admins write diretores" on public.diretores for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- updated_at triggers
create trigger mod_upd before update on public.modalidades for each row execute function public.tg_set_updated_at();
create trigger not_upd before update on public.noticias for each row execute function public.tg_set_updated_at();
create trigger evt_upd before update on public.eventos for each row execute function public.tg_set_updated_at();
create trigger dir_upd before update on public.diretores for each row execute function public.tg_set_updated_at();

-- ============ STORAGE BUCKET ============
insert into storage.buckets (id, name, public) values ('site-images', 'site-images', true)
  on conflict (id) do nothing;

create policy "public read site-images" on storage.objects for select to anon, authenticated
  using (bucket_id = 'site-images');
create policy "admins write site-images" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images' and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')));
create policy "admins update site-images" on storage.objects for update to authenticated
  using (bucket_id = 'site-images' and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')));
create policy "admins delete site-images" on storage.objects for delete to authenticated
  using (bucket_id = 'site-images' and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')));
