-- Tabela de Locais/Pastos
CREATE TABLE IF NOT EXISTS locais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'pasto', -- pasto, piquete, curral, confinamento
  area_hectares DECIMAL(10, 2) DEFAULT 0,
  capacidade_maxima INTEGER DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna de local na tabela de animais (se ainda não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'animais' AND column_name = 'local_id') THEN
        ALTER TABLE animais ADD COLUMN local_id UUID REFERENCES locais(id);
    END IF;
END $$;

-- Histórico de Movimentação (Rastreabilidade)
CREATE TABLE IF NOT EXISTS historico_movimentacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
  local_origem_id UUID REFERENCES locais(id),
  local_destino_id UUID REFERENCES locais(id),
  data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  motivo TEXT, -- ex: 'rotacao', 'vacina', 'venda'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE locais ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_movimentacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on locais" ON locais FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on historico_movimentacao" ON historico_movimentacao FOR ALL USING (true) WITH CHECK (true);

-- Dados Iniciais (Exemplo)
INSERT INTO locais (nome, tipo, area_hectares, capacidade_maxima) VALUES
('Pasto A', 'pasto', 10.5, 30),
('Pasto B', 'pasto', 12.0, 35),
('Curral Principal', 'curral', 0.5, 100),
('Confinamento 1', 'confinamento', 2.0, 50)
ON CONFLICT DO NOTHING;