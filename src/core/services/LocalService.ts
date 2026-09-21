import { ILocalRepository } from "../repositories/ILocalRepository";
import { Local } from "../domain/entities/Local";
import { PrismaLocalRepository } from "../../infrastructure/repositories/PrismaLocalRepository";

export class LocalService {
  private repository: ILocalRepository;

  constructor(repository?: ILocalRepository) {
    this.repository = repository || new PrismaLocalRepository();
  }

  async getAllLocais(): Promise<Local[]> {
    return this.repository.findAll();
  }

  async getLocalById(id: string): Promise<Local | null> {
    if (!id) throw new Error("ID do local é obrigatório.");
    return this.repository.findById(id);
  }

  async createLocal(data: Omit<Local, "id" | "created_at">): Promise<Local> {
    if (!data.nome) throw new Error("O nome do local é obrigatório.");
    return this.repository.create(data);
  }

  async updateLocal(id: string, data: Partial<Local>): Promise<Local> {
    if (!id) throw new Error("ID do local é obrigatório.");
    return this.repository.update(id, data);
  }

  async deleteLocal(id: string): Promise<void> {
    if (!id) throw new Error("ID do local é obrigatório.");
    return this.repository.delete(id);
  }
}
