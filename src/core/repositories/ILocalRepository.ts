import { Local } from "../domain/entities/Local";

export interface ILocalRepository {
  findAll(): Promise<Local[]>;
  findById(id: string): Promise<Local | null>;
  create(data: Omit<Local, "id" | "created_at">): Promise<Local>;
  update(id: string, data: Partial<Local>): Promise<Local>;
  delete(id: string): Promise<void>;
}
