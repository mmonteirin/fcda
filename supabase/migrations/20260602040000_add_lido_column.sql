-- ============ ADD LIDO COLUMN TO MENSAGENS ============

-- Adicionar coluna lido se não existir
alter table public.mensagens 
  add column if not exists lido boolean not null default false;
