import { IParceiroRepository } from "../repositories/IParceiroRepository";
import { Parceiro } from "../domain/entities/Parceiro";
import { PrismaParceiroRepository } from "../../infrastructure/repositories/PrismaParceiroRepository";

export class ParceiroService {
  private repository: IParceiroRepository;

  constructor(repository?: IParceiroRepository) {
    this.repository = repository || new PrismaParceiroRepository();
  }

  async getAllParceiros(): Promise<Parceiro[]> {
    return this.repository.findAll();
  }

  async getParceiroById(id: string): Promise<Parceiro | null> {
    if (!id) throw new Error("ID do parceiro é obrigatório.");
    return this.repository.findById(id);
  }

  async createParceiro(data: Omit<Parceiro, "id" | "created_at">): Promise<Parceiro> {
    if (!data.nome) throw new Error("O nome do parceiro é obrigatório.");
    return this.repository.create(data);
  }

  async updateParceiro(id: string, data: Partial<Parceiro>): Promise<Parceiro> {
    if (!id) throw new Error("ID do parceiro é obrigatório.");
    return this.repository.update(id, data);
  }

  async deleteParceiro(id: string): Promise<void> {
    if (!id) throw new Error("ID do parceiro é obrigatório.");
    return this.repository.delete(id);
  }
}
