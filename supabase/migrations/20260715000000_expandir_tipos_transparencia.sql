alter table public.transparencia_documentos
  drop constraint if exists transparencia_documentos_tipo_check;

alter table public.transparencia_documentos
  add constraint transparencia_documentos_tipo_check
  check (tipo in ('boletim', 'edital', 'prestacao_contas', 'regulamento', 'ata', 'relatorio'));
