import { IParcelaRepository } from "../repositories/IParcelaRepository";
import { Parcela } from "../domain/entities/Parcela";
import { PrismaParcelaRepository } from "../../infrastructure/repositories/PrismaParcelaRepository";

export class ParcelaService {
  private repository: IParcelaRepository;

  constructor(repository?: IParcelaRepository) {
    this.repository = repository || new PrismaParcelaRepository();
  }

  async getAllParcelas(): Promise<Parcela[]> {
    return this.repository.findAll();
  }

  async getParcelaById(id: string): Promise<Parcela | null> {
    if (!id) throw new Error("ID da parcela é obrigatório.");
    return this.repository.findById(id);
  }

  async createParcela(data: Omit<Parcela, "id" | "created_at">): Promise<Parcela> {
    return this.repository.create(data);
  }

  async updateParcela(id: string, data: Partial<Parcela>): Promise<Parcela> {
    if (!id) throw new Error("ID da parcela é obrigatório.");
    return this.repository.update(id, data);
  }

  async deleteParcela(id: string): Promise<void> {
    if (!id) throw new Error("ID da parcela é obrigatório.");
    return this.repository.delete(id);
  }
}
