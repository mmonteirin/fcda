-- Governança do painel administrativo: permissões, auditoria e notificações.
create table if not exists public.admin_role_permissions (
  id uuid primary key default gen_random_uuid(),
  role public.app_role not null,
  permission text not null,
  created_at timestamptz not null default now(),
  unique (role, permission)
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id text,
  action text not null check (action in ('create', 'update', 'delete')),
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_notificacoes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  link text,
  tipo text not null default 'informacao' check (tipo in ('informacao', 'atencao', 'sucesso')),
  lida boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.admin_role_permissions enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.admin_notificacoes enable row level security;

create policy "admins manage permissions" on public.admin_role_permissions
  for all to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "staff read audit logs" on public.admin_audit_logs
  for select to authenticated using (
    public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
  );

create policy "staff read notifications" on public.admin_notificacoes
  for select to authenticated using (
    public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
  );

create policy "staff update notifications" on public.admin_notificacoes
  for update to authenticated using (
    public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
  );

create or replace function public.has_admin_permission(_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin')
  or exists (
    select 1
    from public.user_roles roles
    join public.admin_role_permissions permissions on permissions.role = roles.role
    where roles.user_id = auth.uid()
      and permissions.permission = _permission
  );
$$;

insert into public.admin_role_permissions (role, permission)
values
  ('editor', 'content.manage'),
  ('editor', 'events.manage'),
  ('editor', 'reports.view'),
  ('gestor_clube', 'club.manage')
on conflict (role, permission) do nothing;

create or replace function public.register_admin_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  record_id text;
  audit_action text;
begin
  audit_action := case tg_op
    when 'INSERT' then 'create'
    when 'UPDATE' then 'update'
    when 'DELETE' then 'delete'
  end;
  record_id := coalesce(new.id::text, old.id::text);

  insert into public.admin_audit_logs (actor_id, entity_type, entity_id, action, before_data, after_data)
  values (
    auth.uid(),
    tg_table_name,
    record_id,
    audit_action,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  insert into public.admin_notificacoes (titulo, descricao, link, tipo)
  values (
    initcap(tg_table_name) || ' ' || case audit_action when 'create' then 'cadastrado' when 'update' then 'atualizado' else 'excluído' end,
    'Uma alteração foi registrada no painel administrativo.',
    '/admin/historico',
    case when audit_action = 'delete' then 'atencao' else 'informacao' end
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists audit_noticias on public.noticias;
create trigger audit_noticias after insert or update or delete on public.noticias
for each row execute function public.register_admin_audit();

drop trigger if exists audit_eventos on public.eventos;
create trigger audit_eventos after insert or update or delete on public.eventos
for each row execute function public.register_admin_audit();

drop trigger if exists audit_cursos on public.cursos;
create trigger audit_cursos after insert or update or delete on public.cursos
for each row execute function public.register_admin_audit();
