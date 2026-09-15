// =============================================
// TIPOS DO BANCO DE DADOS
//
// Estes tipos são derivados diretamente dos modelos gerados pelo Prisma
// (prisma/schema.prisma), para que nunca fiquem fora de sincronia com o
// schema real do banco. Os tipos "estendidos" abaixo apenas acrescentam
// os relacionamentos que as telas costumam carregar via `include`.
// =============================================

import type {
  Local as PrismaLocal,
  HistoricoMovimentacao as PrismaHistoricoMovimentacao,
  Raca as PrismaRaca,
  Parceiro as PrismaParceiro,
  TipoVacina as PrismaTipoVacina,
  Animal as PrismaAnimal,
  Transacao as PrismaTransacao,
  AgendaVacina as PrismaAgendaVacina,
  Parcela as PrismaParcela,
  HistoricoPesagem as PrismaHistoricoPesagem,
  CotacaoHistorica as PrismaCotacaoHistorica,
  CicloReprodutivo as PrismaCicloReprodutivo,
} from "@prisma/client";

// Nota sobre campos Decimal: o Prisma Client (ver lib/prisma.ts) converte
// automaticamente todo Prisma.Decimal para number puro antes do dado sair
// da camada de acesso a dados. Os tipos gerados pelo Prisma continuam
// marcando esses campos como Decimal, então os tipos abaixo os sobrescrevem
// para number — refletindo o que o código realmente recebe em runtime.
export type Local = Omit<PrismaLocal, "area_hectares"> & {
  area_hectares: number | null;
};
export type HistoricoMovimentacao = PrismaHistoricoMovimentacao;

// Campos "tipo"/"status" são `String` no schema (não enums de banco), então
// estas uniões documentam os valores que o código realmente grava/lê.
// Ver app/animais/actions.ts, app/transacoes/actions.ts, app/vacinas/actions.ts, app/parcelas/actions.ts.
export type Genero = "M" | "F";
export type OrigemAnimal = "nascido" | "comprado";
export type StatusAnimal = "ATIVO" | "VENDIDO" | "MORTO";
export type TipoParceiro = "comprador" | "vendedor" | "ambos" | "fornecedor_insumo";
export type TipoTransacao = "compra" | "venda";
export type StatusTransacao = "pendente" | "finalizada" | "cancelada";
export type FormaPagamento =
  | "pix"
  | "dinheiro"
  | "permuta"
  | "cheque"
  | "boleto"
  | "promissoria";
export type StatusVacina = "pendente" | "aplicada" | "atrasada" | "cancelada";
export type StatusParcela = "pendente" | "pago" | "atrasado" | "cancelado";

export type Raca = PrismaRaca;
export type Parceiro = PrismaParceiro;
export type TipoVacina = PrismaTipoVacina;

type AnimalBase = Omit<PrismaAnimal, "peso_nascimento" | "peso_atual" | "valor_compra"> & {
  peso_nascimento: number | null;
  peso_atual: number | null;
  valor_compra: number | null;
};

export interface Animal extends AnimalBase {
  // Relacionamentos (presentes apenas quando o `include` correspondente é usado)
  raca?: Raca;
  mae?: Animal | null;
  pai?: Animal | null;
  local?: Local | null;
}

type TransacaoBase = Omit<PrismaTransacao, "valor_total" | "desconto_carcaca"> & {
  valor_total: number;
  desconto_carcaca: number | null;
};

export interface Transacao extends TransacaoBase {
  // Relacionamentos
  parceiro?: Parceiro | null;
  parcelas?: Parcela[];
  animais?: Animal[];
}

export interface AgendaVacina extends PrismaAgendaVacina {
  // Relacionamentos
  animal?: Animal;
  tipo_vacina?: TipoVacina;
}

type ParcelaBase = Omit<PrismaParcela, "valor"> & { valor: number };

export interface Parcela extends ParcelaBase {
  // Relacionamentos
  transacao?: Transacao;
}

export type HistoricoPesagem = Omit<PrismaHistoricoPesagem, "peso"> & { peso: number };

// Tipos para formulários e estatísticas
export interface DashboardStats {
  totalAnimais: number;
  animaisAtivos: number;
  machos: number;
  femeas: number;
  nascidosAno: number;
  compradosAno: number;
  vendidosAno: number;
  vacinasPendentes: number;
  vacinasAtrasadas: number;
  parcelasAReceber: number;
  parcelasAPagar: number;
  valorAReceber: number;
  valorAPagar: number;
}

export type CotacaoHistorica = Omit<PrismaCotacaoHistorica, "valor"> & { valor: number };

export type TipoCotacao = "boi_gordo" | "bezerro" | "vaca" | "milho";

// Configuração visual para os gráficos
export const TIPOS_COTACAO: Record<
  string,
  { label: string; cor: string; unidade: string }
> = {
  boi_gordo: {
    label: "Boi Gordo",
    cor: "#22c55e", // Verde
    unidade: "@",
  },
  bezerro: {
    label: "Bezerro",
    cor: "#3b82f6", // Azul
    unidade: "cab",
  },
  vaca: {
    label: "Vaca Gorda",
    cor: "#ec4899", // Rosa
    unidade: "@",
  },
  milho: {
    label: "Milho",
    cor: "#eab308", // Amarelo
    unidade: "sc",
  },
};

export interface AnimalFormData {
  brinco?: string;
  nome?: string;
  sexo: Genero;
  data_nascimento?: string;
  peso_nascimento?: number;
  origem: OrigemAnimal;
  raca_id?: string;
  mae_id?: string;
  pai_id?: string;
  observacoes?: string;
}

export interface TransacaoFormData {
  tipo: TipoTransacao;
  parceiro_id?: string;
  data_negociacao: string;
  qtd_parcelas: number;
  forma_pagamento?: FormaPagamento;
  observacoes?: string;
  itens: {
    valor_unitario: number;
    quantidade_animais: number;
    descricao?: string;
    animais_ids?: string[];
  }[];
}

export type StatusReprodutivo =
  | "vazia"
  | "prenha"
  | "lactacao"
  | "aguardando_diagnostico";

export interface CicloReprodutivo extends PrismaCicloReprodutivo {
  // Relacionamentos
  animal?: Animal;
  touro?: Animal | null;
}
