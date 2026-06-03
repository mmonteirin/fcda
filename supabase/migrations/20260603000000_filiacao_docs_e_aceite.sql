-- ============================================================
-- Migração: Documentos e Termo de Aceite no processo de filiação
-- ============================================================

-- 1. Adicionar colunas à tabela existente
ALTER TABLE solicitacoes_filiacao
  ADD COLUMN IF NOT EXISTS doc_cnpj_url        TEXT,
  ADD COLUMN IF NOT EXISTS doc_requerimento_url TEXT,
  ADD COLUMN IF NOT EXISTS aceite_termo         BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS aceite_em            TIMESTAMPTZ;

-- 2. Política de storage: permitir upload anônimo na pasta filiacoes/
--    (o bucket site-images deve já existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'Allow anon uploads for filiacao'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Allow anon uploads for filiacao"
        ON storage.objects FOR INSERT TO anon
        WITH CHECK (
          bucket_id = 'site-images'
          AND (storage.foldername(name))[1] = 'filiacoes'
        );
    $policy$;
  END IF;
END
$$;
