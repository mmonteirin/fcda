-- Reconcilia o banco atual com o schema oficial da FCDA.
-- Esta migration e segura para bancos que ja executaram as migrations anteriores.

-- -----------------------------------------------------------------------------
-- Extensoes, tipos e funcoes compartilhadas
-- -----------------------------------------------------------------------------
create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'app_role'
  ) then
    create type public.app_role as enum ('admin', 'editor', 'atleta', 'treinador', 'gestor_clube');
  else
    alter type public.app_role add value if not exists 'atleta';
    alter type public.app_role add value if not exists 'treinador';
    alter type public.app_role add value if not exists 'gestor_clube';
  end if;
end
$$;

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Colunas e relacionamentos ausentes no schema incremental
-- -----------------------------------------------------------------------------
create table if not exists public.categorias_modalidades (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.solicitacoes_filiacao (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  razao_social text not null,
  cnpj text not null,
  inscricao_estadual text,
  endereco text not null,
  cep text not null,
  bairro text not null,
  cidade text not null,
  uf text not null,
  fone text,
  fax text,
  alvara text,
  certidao text,
  data_fundacao date,
  data_publicacao date,
  status text not null default 'pendente',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  doc_cnpj_url text,
  doc_requerimento_url text,
  aceite_termo boolean not null default false,
  aceite_em timestamptz
);

alter table public.modalidades add column if not exists categoria_id uuid;
alter table public.eventos add column if not exists data_fim date;
alter table public.eventos add column if not exists descricao text;
alter table public.eventos add column if not exists status text;
alter table public.eventos add column if not exists link_inscricao text;
alter table public.eventos add column if not exists imagem_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'modalidades_categoria_id_fkey'
      and conrelid = 'public.modalidades'::regclass
  ) then
    alter table public.modalidades
      add constraint modalidades_categoria_id_fkey
      foreign key (categoria_id) references public.categorias_modalidades(id) on delete set null;
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- Integridade e indices
-- -----------------------------------------------------------------------------
create unique index if not exists user_roles_user_role_uidx
  on public.user_roles (user_id, role);
create index if not exists modalidades_categoria_idx on public.modalidades (categoria_id);
create index if not exists categorias_modalidades_ordem_idx on public.categorias_modalidades (ordem);
create index if not exists solicitacoes_filiacao_status_idx on public.solicitacoes_filiacao (status);
create index if not exists solicitacoes_filiacao_created_at_idx on public.solicitacoes_filiacao (created_at desc);
create index if not exists noticias_publicado_data_idx on public.noticias (publicado, data desc);
create index if not exists eventos_data_inicio_idx on public.eventos (data_inicio);
create index if not exists eventos_ano_idx on public.eventos (ano);
create index if not exists transparencia_publicado_data_idx
  on public.transparencia_documentos (publicado, data_publicacao desc);
create index if not exists eventos_pdfs_evento_tipo_idx
  on public.eventos_pdfs (evento_id, tipo);
create index if not exists rankings_ano_publicado_idx
  on public.rankings (ano, publicado);
create index if not exists recordes_filtro_idx
  on public.recordes (publicado, piscina, sexo, prova);
create index if not exists cursos_publicado_data_idx
  on public.cursos (publicado, data_inicio);
create index if not exists clubes_ativo_ordem_idx on public.clubes (ativo, ordem);
create index if not exists atletas_transparencia_nome_idx on public.atletas_transparencia (nome);

-- -----------------------------------------------------------------------------
-- Triggers updated_at: drop/create evita duplicidade apos reexecucao ou merge.
-- -----------------------------------------------------------------------------
do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('modalidades', 'modalidades_updated_at'),
      ('categorias_modalidades', 'categorias_modalidades_updated_at'),
      ('noticias', 'noticias_updated_at'),
      ('eventos', 'eventos_updated_at'),
      ('diretores', 'diretores_updated_at'),
      ('transparencia_documentos', 'transparencia_documentos_updated_at'),
      ('rankings', 'rankings_updated_at'),
      ('ranking_classificacoes', 'ranking_classificacoes_updated_at'),
      ('recordes', 'recordes_updated_at'),
      ('cursos', 'cursos_updated_at'),
      ('clubes', 'clubes_updated_at'),
      ('parceiros', 'parceiros_updated_at'),
      ('atletas', 'atletas_updated_at'),
      ('treinadores', 'treinadores_updated_at'),
      ('gestores_clube', 'gestores_clube_updated_at'),
      ('theme_config', 'theme_config_updated_at'),
      ('user_theme_preferences', 'user_theme_preferences_updated_at')
    ) as tables(table_name, trigger_name)
  loop
    execute format('drop trigger if exists %I on public.%I', item.trigger_name, item.table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.tg_set_updated_at()',
      item.trigger_name, item.table_name
    );
  end loop;
end
$$;

-- -----------------------------------------------------------------------------
-- Acesso publico e administrativo
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.modalidades, public.noticias, public.eventos, public.diretores,
  public.transparencia_documentos, public.eventos_pdfs, public.rankings,
  public.ranking_competicoes, public.ranking_classificacoes, public.recordes,
  public.cursos, public.parceiros, public.clubes, public.atletas_transparencia
  to anon, authenticated;
grant select on public.categorias_modalidades to anon, authenticated;
grant insert on public.solicitacoes_filiacao to anon, authenticated;
grant select, update, delete on public.solicitacoes_filiacao to authenticated;
grant insert on public.mensagens, public.newsletter_inscritos to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select, update on public.admin_notificacoes to authenticated;
grant select on public.admin_audit_logs to authenticated;
grant all on all tables in schema public to service_role;

alter table public.modalidades enable row level security;
alter table public.noticias enable row level security;
alter table public.eventos enable row level security;
alter table public.diretores enable row level security;
alter table public.transparencia_documentos enable row level security;
alter table public.eventos_pdfs enable row level security;
alter table public.rankings enable row level security;
alter table public.ranking_competicoes enable row level security;
alter table public.ranking_classificacoes enable row level security;
alter table public.recordes enable row level security;
alter table public.cursos enable row level security;
alter table public.parceiros enable row level security;
alter table public.clubes enable row level security;
alter table public.atletas_transparencia enable row level security;
alter table public.categorias_modalidades enable row level security;
alter table public.solicitacoes_filiacao enable row level security;
alter table public.mensagens enable row level security;
alter table public.newsletter_inscritos enable row level security;

-- Recria somente as policies deste contrato para remover divergencias de regras.
drop policy if exists "public read modalidades" on public.modalidades;
create policy "public read modalidades" on public.modalidades for select to anon, authenticated using (true);
drop policy if exists "public read categorias modalidades" on public.categorias_modalidades;
create policy "public read categorias modalidades" on public.categorias_modalidades for select to anon, authenticated using (true);
drop policy if exists "public read noticias" on public.noticias;
create policy "public read noticias" on public.noticias for select to anon, authenticated using (
  publicado or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
);
drop policy if exists "public read eventos" on public.eventos;
create policy "public read eventos" on public.eventos for select to anon, authenticated using (true);
drop policy if exists "public read diretores" on public.diretores;
create policy "public read diretores" on public.diretores for select to anon, authenticated using (true);
drop policy if exists "public read transparencia" on public.transparencia_documentos;
create policy "public read transparencia" on public.transparencia_documentos for select to anon, authenticated using (
  publicado or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
);
drop policy if exists "public read eventos_pdfs" on public.eventos_pdfs;
create policy "public read eventos_pdfs" on public.eventos_pdfs for select to anon, authenticated using (true);
drop policy if exists "public read rankings" on public.rankings;
create policy "public read rankings" on public.rankings for select to anon, authenticated using (
  publicado or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
);
drop policy if exists "public read ranking competicoes" on public.ranking_competicoes;
create policy "public read ranking competicoes" on public.ranking_competicoes for select to anon, authenticated using (true);
drop policy if exists "public read ranking classificacoes" on public.ranking_classificacoes;
create policy "public read ranking classificacoes" on public.ranking_classificacoes for select to anon, authenticated using (true);
drop policy if exists "public read recordes" on public.recordes;
create policy "public read recordes" on public.recordes for select to anon, authenticated using (
  publicado or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
);
drop policy if exists "public read cursos" on public.cursos;
create policy "public read cursos" on public.cursos for select to anon, authenticated using (
  publicado or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
);
drop policy if exists "public read parceiros" on public.parceiros;
create policy "public read parceiros" on public.parceiros for select to anon, authenticated using (
  ativo or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
);
drop policy if exists "public read clubes" on public.clubes;
create policy "public read clubes" on public.clubes for select to anon, authenticated using (
  ativo or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
);
drop policy if exists "public read atletas transparencia" on public.atletas_transparencia;
create policy "public read atletas transparencia" on public.atletas_transparencia for select to anon, authenticated using (true);
drop policy if exists "public insert solicitacoes filiacao" on public.solicitacoes_filiacao;
create policy "public insert solicitacoes filiacao" on public.solicitacoes_filiacao for insert to anon, authenticated with check (true);
drop policy if exists "staff read solicitacoes filiacao" on public.solicitacoes_filiacao;
create policy "staff read solicitacoes filiacao" on public.solicitacoes_filiacao for select to authenticated using (
  public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
);
drop policy if exists "staff manage solicitacoes filiacao" on public.solicitacoes_filiacao;
create policy "staff manage solicitacoes filiacao" on public.solicitacoes_filiacao for update to authenticated using (
  public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
) with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

-- Escrita de conteudo somente para admin/editor.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'modalidades', 'noticias', 'eventos', 'diretores', 'transparencia_documentos',
    'categorias_modalidades',
    'eventos_pdfs', 'rankings', 'ranking_competicoes', 'ranking_classificacoes',
    'recordes', 'cursos', 'parceiros', 'clubes', 'atletas_transparencia'
  ] loop
    execute format('drop policy if exists "staff manage %s" on public.%I', table_name, table_name);
    execute format(
      'create policy "staff manage %s" on public.%I for all to authenticated using (public.has_role(auth.uid(), ''admin'') or public.has_role(auth.uid(), ''editor'')) with check (public.has_role(auth.uid(), ''admin'') or public.has_role(auth.uid(), ''editor''))',
      table_name, table_name
    );
  end loop;
end
$$;

drop policy if exists "anyone can insert mensagens" on public.mensagens;
create policy "anyone can insert mensagens" on public.mensagens for insert to anon, authenticated with check (true);
drop policy if exists "public newsletter insert" on public.newsletter_inscritos;
create policy "public newsletter insert" on public.newsletter_inscritos for insert to anon, authenticated with check (true);

-- Nenhum perfil anonimo pode alterar dados administrativos.
revoke insert, update, delete on public.atletas_transparencia from anon;
revoke insert, update, delete on public.admin_audit_logs, public.admin_notificacoes from anon, authenticated;