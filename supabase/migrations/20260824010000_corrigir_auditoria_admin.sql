-- Corrige a divergência entre a action persistida pelo trigger (insert)
-- e o contrato da tabela/histórico (create).
alter table public.admin_audit_logs
  drop constraint if exists admin_audit_logs_action_check;

alter table public.admin_audit_logs
  add constraint admin_audit_logs_action_check
  check (action in ('create', 'update', 'delete'));

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
    auth.uid(), tg_table_name, record_id, audit_action,
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
