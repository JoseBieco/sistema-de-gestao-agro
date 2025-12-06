-- Tabela para armazenar séries históricas de preços
CREATE TABLE IF NOT EXISTS cotacoes_historicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- Ex: 'boi_gordo', 'bezerro', 'vaca', 'milho'
  fonte VARCHAR(50) DEFAULT 'CEPEA', -- Ex: 'CEPEA', 'B3', 'CONAB'
  unidade VARCHAR(20) DEFAULT 'R$/@', -- Ex: 'R$/@', 'R$/sc', 'R$/kg'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para garantir que as consultas do seu modelo sejam rápidas
CREATE INDEX IF NOT EXISTS idx_cotacoes_tipo_data ON cotacoes_historicas(tipo, data DESC);
CREATE INDEX IF NOT EXISTS idx_cotacoes_data ON cotacoes_historicas(data);

ALTER TABLE cotacoes_historicas
ADD CONSTRAINT unique_tipo_data UNIQUE (tipo, data);

-- RLS Policy
ALTER TABLE cotacoes_historicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on cotacoes_historicas" ON cotacoes_historicas
  FOR ALL USING (true) WITH CHECK (true);