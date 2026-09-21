-- Status reprodutivo
-- 'vazia': Não prenha, aguardando cio ou cobertura
-- 'prenha': Cobertura confirmada ou aguardando parto
-- 'lactacao': Pariu recentemente, ainda não retornou ao ciclo
-- 'aguardando_diagnostico': Coberta, mas ainda não confirmado se pegou cria

CREATE TABLE IF NOT EXISTS ciclos_reprodutivos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
  
  -- Dados de Entrada
  data_ultimo_parto DATE,
  data_ultimo_cio DATE,
  data_cobertura DATE,
  tipo_cobertura VARCHAR(50) DEFAULT 'monta_natural', -- ou 'inseminacao'
  touro_id UUID REFERENCES animais(id), -- Opcional: Pai do bezerro
  
  -- Previsões Calculadas (Salvas para facilitar queries, mas podem ser recalculadas)
  data_prevista_parto DATE,
  data_prevista_cio DATE,
  data_diagnostico_gestacao DATE, -- ~45 dias após cobertura
  
  status VARCHAR(30) DEFAULT 'vazia',
  observacoes TEXT,
  
  ativo BOOLEAN DEFAULT true, -- Apenas o ciclo atual fica ativo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reproducao_animal ON ciclos_reprodutivos(animal_id);
CREATE INDEX IF NOT EXISTS idx_reproducao_status ON ciclos_reprodutivos(status);
CREATE INDEX IF NOT EXISTS idx_reproducao_prev_parto ON ciclos_reprodutivos(data_prevista_parto);

-- RLS
ALTER TABLE ciclos_reprodutivos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on ciclos_reprodutivos" ON ciclos_reprodutivos FOR ALL USING (true) WITH CHECK (true);