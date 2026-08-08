-- Adicionar novos tipos de usuário ao enum app_role
-- Nota: Se o enum já existir com valores diferentes, pode ser necessário recriá-lo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = 'public.app_role'::regtype 
        AND enumlabel = 'atleta'
    ) THEN
        ALTER TYPE public.app_role ADD VALUE 'atleta';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = 'public.app_role'::regtype 
        AND enumlabel = 'treinador'
    ) THEN
        ALTER TYPE public.app_role ADD VALUE 'treinador';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = 'public.app_role'::regtype 
        AND enumlabel = 'gestor_clube'
    ) THEN
        ALTER TYPE public.app_role ADD VALUE 'gestor_clube';
    END IF;
END $$;

-- Tabela de atletas
create table public.atletas (
  id uuid primary key references auth.users(id) on delete cascade,
  data_nascimento date not null,
  cpf text unique,
  telefone text,
  clube_id uuid references public.clubes(id) on delete set null,
  categoria text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabela de treinadores
create table public.treinadores (
  id uuid primary key references auth.users(id) on delete cascade,
  cpf text unique,
  telefone text,
  clube_id uuid references public.clubes(id) on delete set null,
  credencial text,
  especialidade text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabela de gestores de clubes
create table public.gestores_clube (
  id uuid primary key references auth.users(id) on delete cascade,
  cpf text unique,
  telefone text,
  clube_id uuid references public.clubes(id) on delete cascade,
  cargo text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Grants
grant select, insert, update on public.atletas to authenticated;
grant all on public.atletas to service_role;
grant select, insert, update on public.treinadores to authenticated;
grant all on public.treinadores to service_role;
grant select, insert, update on public.gestores_clube to authenticated;
grant all on public.gestores_clube to service_role;

-- RLS
alter table public.atletas enable row level security;
alter table public.treinadores enable row level security;
alter table public.gestores_clube enable row level security;

-- Policies para atletas
create policy "users read own atleta profile" on public.atletas
  for select to authenticated using (auth.uid() = id);
create policy "admins read all atletas" on public.atletas
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "users update own atleta profile" on public.atletas
  for update to authenticated using (auth.uid() = id);
create policy "admins update atletas" on public.atletas
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "atletas can insert own profile" on public.atletas
  for insert to authenticated using (auth.uid() = id);
create policy "admins can insert atletas" on public.atletas
  for insert to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Policies para treinadores
create policy "users read own treinador profile" on public.treinadores
  for select to authenticated using (auth.uid() = id);
create policy "admins read all treinadores" on public.treinadores
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "users update own treinador profile" on public.treinadores
  for update to authenticated using (auth.uid() = id);
create policy "admins update treinadores" on public.treinadores
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "treinadores can insert own profile" on public.treinadores
  for insert to authenticated using (auth.uid() = id);
create policy "admins can insert treinadores" on public.treinadores
  for insert to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Policies para gestores de clube
create policy "users read own gestor profile" on public.gestores_clube
  for select to authenticated using (auth.uid() = id);
create policy "admins read all gestores" on public.gestores_clube
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "users update own gestor profile" on public.gestores_clube
  for update to authenticated using (auth.uid() = id);
create policy "admins update gestores" on public.gestores_clube
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "gestores can insert own profile" on public.gestores_clube
  for insert to authenticated using (auth.uid() = id);
create policy "admins can insert gestores" on public.gestores_clube
  for insert to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Triggers para updated_at
create trigger atletas_updated_at before update on public.atletas for each row execute function public.tg_set_updated_at();
create trigger treinadores_updated_at before update on public.treinadores for each row execute function public.tg_set_updated_at();
create trigger gestores_clube_updated_at before update on public.gestores_clube for each row execute function public.tg_set_updated_at();
