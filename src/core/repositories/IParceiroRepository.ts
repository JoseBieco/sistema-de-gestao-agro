import { Parceiro } from "../domain/entities/Parceiro";

export interface IParceiroRepository {
  findAll(): Promise<Parceiro[]>;
  findById(id: string): Promise<Parceiro | null>;
  create(data: Omit<Parceiro, "id" | "created_at">): Promise<Parceiro>;
  update(id: string, data: Partial<Parceiro>): Promise<Parceiro>;
  delete(id: string): Promise<void>;
}
