export interface Transacao {
  id: string;
  tipo: "compra" | "venda";
  parceiro_id?: string | null;
  data_negociacao: Date;
  qtd_parcelas: number;
  forma_pagamento?: string | null;
  valor_total: number;
  nota_fiscal_url?: string | null;
  gta_url?: string | null;
  observacoes?: string | null;
  status: "pendente" | "finalizada" | "cancelada";
  created_at?: Date;
  // Relacionamentos
  parceiro?: any;
  parcelas?: any[];
  animais?: any[];
}
