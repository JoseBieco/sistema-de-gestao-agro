// =============================================
// TIPOS DO BANCO DE DADOS
// =============================================

export type Genero = "M" | "F"
export type OrigemAnimal = "nascido" | "comprado"
export type StatusAnimal = "ativo" | "vendido" | "morto" | "transferido"
export type TipoParceiro = "comprador" | "vendedor" | "ambos"
export type TipoTransacao = "compra" | "venda"
export type StatusTransacao = "pendente" | "finalizada" | "cancelada"
export type FormaPagamento = "pix" | "dinheiro" | "permuta" | "cheque" | "boleto" | "promissoria"
export type StatusVacina = "pendente" | "aplicada" | "atrasada" | "cancelada"
export type StatusParcela = "pendente" | "pago" | "atrasado" | "cancelado"

export interface Raca {
  id: string
  nome: string
  descricao?: string
  created_at: string
  updated_at: string
}

export interface Parceiro {
  id: string
  nome: string
  tipo: TipoParceiro
  documento?: string
  telefone?: string
  email?: string
  endereco?: string
  observacoes?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface TipoVacina {
  id: string
  nome: string
  descricao?: string
  doses_por_ano: number
  dias_entre_doses: number
  obrigatoria: boolean
  apenas_femeas: boolean
  created_at: string
  updated_at: string
}

export interface Animal {
  id: string
  numero_brinco?: string
  nome?: string
  genero: Genero
  data_nascimento?: string
  peso_nascimento?: number
  peso_atual?: number
  origem: OrigemAnimal
  status: StatusAnimal
  raca_id?: string
  mae_id?: string
  pai_id?: string
  vacina_brucelose: boolean
  data_brucelose?: string
  compra_id?: string
  venda_id?: string
  data_status?: string
  motivo_morte?: string
  observacoes?: string
  foto_url?: string
  created_at: string
  updated_at: string
  // Relacionamentos
  raca?: Raca
  mae?: Animal
  pai?: Animal
}

export interface Transacao {
  id: string
  tipo: TipoTransacao
  parceiro_id?: string
  data_negociacao: string
  qtd_parcelas: number
  forma_pagamento?: FormaPagamento
  valor_total: number
  nota_fiscal_url?: string
  gta_url?: string
  observacoes?: string
  status: StatusTransacao
  created_at: string
  updated_at: string
  // Relacionamentos
  parceiro?: Parceiro
  itens?: ItemTransacao[]
  parcelas?: Parcela[]
  animais?: Animal[]
}

export interface ItemTransacao {
  id: string
  transacao_id: string
  valor_unitario: number
  quantidade_animais: number
  descricao?: string
  created_at: string
}

export interface AnimaisTransacao {
  id: string
  transacao_id: string
  animal_id: string
  item_transacao_id?: string
  created_at: string
}

export interface AgendaVacina {
  id: string
  animal_id: string
  tipo_vacina_id: string
  data_prevista: string
  data_aplicacao?: string
  status: StatusVacina
  vacina_pai_id?: string
  dose_numero: number
  observacoes?: string
  created_at: string
  updated_at: string
  // Relacionamentos
  animal?: Animal
  tipo_vacina?: TipoVacina
}

export interface Parcela {
  id: string
  transacao_id: string
  numero_parcela: number
  data_vencimento: string
  valor: number
  status: StatusParcela
  data_pagamento?: string
  data_baixa_promissoria?: string
  foto_promissoria_frente_url?: string
  foto_promissoria_verso_url?: string
  observacoes?: string
  created_at: string
  updated_at: string
  // Relacionamentos
  transacao?: Transacao
}

export interface HistoricoPesagem {
  id: string
  animal_id: string
  peso: number
  data_pesagem: string
  observacoes?: string
  created_at: string
}

// Tipos para formulários e estatísticas
export interface DashboardStats {
  totalAnimais: number
  animaisAtivos: number
  machos: number
  femeas: number
  nascidosAno: number
  compradosAno: number
  vendidosAno: number
  vacinasPendentes: number
  vacinasAtrasadas: number
  parcelasAReceber: number
  parcelasAPagar: number
  valorAReceber: number
  valorAPagar: number
}

export interface AnimalFormData {
  numero_brinco?: string
  nome?: string
  genero: Genero
  data_nascimento?: string
  peso_nascimento?: number
  origem: OrigemAnimal
  raca_id?: string
  mae_id?: string
  pai_id?: string
  vacina_brucelose?: boolean
  data_brucelose?: string
  observacoes?: string
}

export interface TransacaoFormData {
  tipo: TipoTransacao
  parceiro_id?: string
  data_negociacao: string
  qtd_parcelas: number
  forma_pagamento?: FormaPagamento
  observacoes?: string
  itens: {
    valor_unitario: number
    quantidade_animais: number
    descricao?: string
    animais_ids?: string[]
  }[]
}
