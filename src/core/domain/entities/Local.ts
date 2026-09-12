export interface Local {
  id: string;
  nome: string;
  tipo: string;
  area_hectares: number | null;
  capacidade_maxima: number | null;
  observacoes: string | null;
  created_at?: Date;
}
