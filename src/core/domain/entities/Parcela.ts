export interface Parcela {
  id: string;
  transacao_id: string;
  numero_parcela: number;
  data_vencimento: Date;
  valor: number;
  status: string;
  data_pagamento: Date | null;
  data_baixa_promissoria: Date | null;
  foto_promissoria_frente_url: string | null;
  foto_promissoria_verso_url: string | null;
  observacoes: string | null;
  created_at?: Date;
  transacao?: any; // To include relations if needed
}
