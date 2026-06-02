-- ============ FIX PDF TIPO COLUMN TYPE ============
-- Se a coluna tipo está como text (devido à migration anterior problemática),
-- converter para ENUM corretamente

-- Verificar e converter se necessário
alter table public.eventos_pdfs 
  alter column tipo type public.pdf_tipo using tipo::public.pdf_tipo;
