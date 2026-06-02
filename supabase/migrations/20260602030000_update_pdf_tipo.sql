-- ============ UPDATE PDF TIPO ENUM ============

-- Remover constraint de check antiga se existir
alter table public.eventos_pdfs drop constraint if exists eventos_pdfs_tipo_check;

-- Converter a coluna tipo para texto
alter table public.eventos_pdfs
  alter column tipo type text using tipo::text;

-- Remover o tipo pdf_tipo existente se existir
drop type if exists public.pdf_tipo;

-- Criar novo tipo de enum com todos os tipos
create type public.pdf_tipo as enum (
  'resultados',
  'pontuacao',
  'eficiencia',
  'recordes',
  'quadro_de_medalhas',
  'indice_tecnico',
  'programa_de_provas',
  'inscritos_por_clube',
  'relacao_de_inscritos',
  'balizamentos',
  'resultados_gerais',
  'regulamentos',
  'relacao_de_cortes',
  'mapa_de_inscricao',
  'indices',
  'lista_de_hoteis',
  'outros',
  'sumula',
  'tabela_de_jogos',
  'mapa_da_prova',
  'termo_de_responsabilidade',
  'ranking',
  'inscricoes'
);

-- Alterar a coluna tipo para usar o novo enum
alter table public.eventos_pdfs
  alter column tipo type public.pdf_tipo using tipo::public.pdf_tipo;

-- Adicionar coluna ano na tabela eventos se não existir
alter table public.eventos
  add column if not exists ano int;
