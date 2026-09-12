import { Parcela } from "../domain/entities/Parcela";

export interface IParcelaRepository {
  findAll(): Promise<Parcela[]>;
  findById(id: string): Promise<Parcela | null>;
  create(data: Omit<Parcela, "id" | "created_at">): Promise<Parcela>;
  update(id: string, data: Partial<Parcela>): Promise<Parcela>;
  delete(id: string): Promise<void>;
}
