-- Tabela de parceiros da federação (apoio institucional, patrocínio, parcerias)
CREATE TABLE IF NOT EXISTS parceiros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  logo_url TEXT,
  site_url TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('apoio_institucional', 'patrocinio', 'parceria')),
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_parceiros_categoria ON parceiros(categoria);
CREATE INDEX IF NOT EXISTS idx_parceiros_ativo ON parceiros(ativo);
CREATE INDEX IF NOT EXISTS idx_parceiros_ordem ON parceiros(ordem);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parceiros_updated_at
  BEFORE UPDATE ON parceiros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE parceiros ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Qualquer um pode ler parceiros ativos
CREATE POLICY "Parceiros ativos são visíveis publicamente"
  ON parceiros FOR SELECT
  USING (ativo = true);

-- Apenas admins/editores podem fazer qualquer operação
CREATE POLICY "Admins podem gerenciar parceiros"
  ON parceiros FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'editor')
    )
  );

-- Inserir alguns dados de exemplo
INSERT INTO parceiros (nome, logo_url, site_url, categoria, ordem, ativo) VALUES
('Governo do Estado do Ceará', NULL, 'https://www.ceara.gov.br', 'apoio_institucional', 1, true),
('Secretaria de Esporte do Ceará', NULL, 'https://esporte.ceara.gov.br', 'apoio_institucional', 2, true),
('CBDA - Confederação Brasileira de Desportos Aquáticos', NULL, 'https://www.cbda.org.br', 'apoio_institucional', 3, true);
