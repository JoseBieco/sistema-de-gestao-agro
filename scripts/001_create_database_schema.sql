-- =============================================
-- GESTÃO PECUÁRIA 360 - DATABASE SCHEMA
-- =============================================

-- Tabela de Raças
CREATE TABLE IF NOT EXISTS racas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Parceiros (Compradores/Vendedores)
CREATE TABLE IF NOT EXISTS parceiros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('comprador', 'vendedor', 'ambos')),
  documento VARCHAR(20),
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Tipos de Vacina
CREATE TABLE IF NOT EXISTS tipos_vacina (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  doses_por_ano INTEGER DEFAULT 1,
  dias_entre_doses INTEGER DEFAULT 365,
  obrigatoria BOOLEAN DEFAULT false,
  apenas_femeas BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Transações (Compras e Vendas)
CREATE TABLE IF NOT EXISTS transacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('compra', 'venda')),
  parceiro_id UUID REFERENCES parceiros(id),
  data_negociacao DATE NOT NULL,
  qtd_parcelas INTEGER DEFAULT 1,
  forma_pagamento VARCHAR(50) CHECK (forma_pagamento IN ('pix', 'dinheiro', 'permuta', 'cheque', 'boleto', 'promissoria')),
  valor_total DECIMAL(15, 2) DEFAULT 0,
  nota_fiscal_url TEXT,
  gta_url TEXT,
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'finalizada', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Animais
CREATE TABLE IF NOT EXISTS animais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_brinco VARCHAR(50),
  nome VARCHAR(100),
  genero VARCHAR(1) NOT NULL CHECK (genero IN ('M', 'F')),
  data_nascimento DATE,
  peso_nascimento DECIMAL(10, 2),
  peso_atual DECIMAL(10, 2),
  origem VARCHAR(20) NOT NULL CHECK (origem IN ('nascido', 'comprado')),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'vendido', 'morto', 'transferido')),
  raca_id UUID REFERENCES racas(id),
  mae_id UUID REFERENCES animais(id),
  pai_id UUID REFERENCES animais(id),
  vacina_brucelose BOOLEAN DEFAULT false,
  data_brucelose DATE,
  compra_id UUID REFERENCES transacoes(id),
  venda_id UUID REFERENCES transacoes(id),
  data_status DATE,
  motivo_morte TEXT,
  observacoes TEXT,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens de Transação (Faixas de Preço)
CREATE TABLE IF NOT EXISTS itens_transacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transacao_id UUID NOT NULL REFERENCES transacoes(id) ON DELETE CASCADE,
  valor_unitario DECIMAL(15, 2) NOT NULL,
  quantidade_animais INTEGER NOT NULL,
  descricao VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Pivô: Animais por Transação
CREATE TABLE IF NOT EXISTS animais_transacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transacao_id UUID NOT NULL REFERENCES transacoes(id) ON DELETE CASCADE,
  animal_id UUID NOT NULL REFERENCES animais(id),
  item_transacao_id UUID REFERENCES itens_transacao(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(transacao_id, animal_id)
);

-- Tabela de Agenda de Vacinas
CREATE TABLE IF NOT EXISTS agenda_vacinas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
  tipo_vacina_id UUID NOT NULL REFERENCES tipos_vacina(id),
  data_prevista DATE NOT NULL,
  data_aplicacao DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aplicada', 'atrasada', 'cancelada')),
  vacina_pai_id UUID REFERENCES agenda_vacinas(id),
  dose_numero INTEGER DEFAULT 1,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Parcelas (Promissórias)
CREATE TABLE IF NOT EXISTS parcelas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transacao_id UUID NOT NULL REFERENCES transacoes(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  data_vencimento DATE NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  data_pagamento DATE,
  data_baixa_promissoria DATE,
  foto_promissoria_frente_url TEXT,
  foto_promissoria_verso_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Histórico de Pesagem
CREATE TABLE IF NOT EXISTS historico_pesagem (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
  peso DECIMAL(10, 2) NOT NULL,
  data_pesagem DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_animais_status ON animais(status);
CREATE INDEX IF NOT EXISTS idx_animais_raca ON animais(raca_id);
CREATE INDEX IF NOT EXISTS idx_animais_origem ON animais(origem);
CREATE INDEX IF NOT EXISTS idx_animais_genero ON animais(genero);
CREATE INDEX IF NOT EXISTS idx_agenda_vacinas_status ON agenda_vacinas(status);
CREATE INDEX IF NOT EXISTS idx_agenda_vacinas_data_prevista ON agenda_vacinas(data_prevista);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_parceiro ON transacoes(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON parcelas(status);
CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON parcelas(data_vencimento);

-- =============================================
-- ROW LEVEL SECURITY (RLS) - Habilitado para todas as tabelas
-- Por simplicidade, permitimos acesso público para este sistema
-- Em produção, recomenda-se autenticação
-- =============================================

ALTER TABLE racas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_vacina ENABLE ROW LEVEL SECURITY;
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_transacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE animais_transacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_vacinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_pesagem ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (para sistema sem autenticação obrigatória)
CREATE POLICY "Allow all operations on racas" ON racas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on parceiros" ON parceiros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tipos_vacina" ON tipos_vacina FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on animais" ON animais FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on transacoes" ON transacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on itens_transacao" ON itens_transacao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on animais_transacao" ON animais_transacao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on agenda_vacinas" ON agenda_vacinas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on parcelas" ON parcelas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on historico_pesagem" ON historico_pesagem FOR ALL USING (true) WITH CHECK (true);
