export interface Parceiro {
  id: string;
  nome: string;
  cpf_cnpj: string | null;
  telefone: string | null;
  email: string | null;
  tipo: string;
  endereco: string | null;
  observacoes: string | null;
  ativo: boolean;
  created_at?: Date;
}
