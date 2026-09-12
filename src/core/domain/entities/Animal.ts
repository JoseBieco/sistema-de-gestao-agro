export interface Raca {
  id: string;
  nome: string;
  descricao?: string | null;
  created_at: Date;
}

export interface Animal {
  id: string;
  brinco: string;
  nome?: string | null;
  raca_id: string;
  sexo: string;
  data_nascimento?: Date | null;
  peso_nascimento?: number | null;
  peso_atual?: number | null;
  status: string;
  parcela_id?: string | null;
  mae_id?: string | null;
  pai_id?: string | null;
  valor_compra?: number | null;
  comprador_id?: string | null;
  vendedor_id?: string | null;
  created_at: Date;
  
  // Relations
  raca?: Raca;
}
