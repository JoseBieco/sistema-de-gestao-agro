import { Animal, Raca } from "../domain/entities/Animal";

export interface IAnimalRepository {
  findAll(): Promise<Animal[]>;
  findById(id: string): Promise<Animal | null>;
  findByIdDetailed(id: string): Promise<any>;
  create(data: Omit<Animal, "id" | "created_at">): Promise<Animal>;
  update(id: string, data: Partial<Animal>): Promise<Animal>;
  delete(id: string): Promise<void>;
}

export interface IRacaRepository {
  findAll(): Promise<Raca[]>;
  findById(id: string): Promise<Raca | null>;
  create(data: Omit<Raca, "id" | "created_at">): Promise<Raca>;
  update(id: string, data: Partial<Raca>): Promise<Raca>;
  delete(id: string): Promise<void>;
}
