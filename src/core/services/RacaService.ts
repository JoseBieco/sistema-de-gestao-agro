import { IRacaRepository } from "../repositories/IAnimalRepository";
import { Raca } from "../domain/entities/Animal";
import { PrismaRacaRepository } from "../../infrastructure/repositories/PrismaAnimalRepository";

export class RacaService {
  private repository: IRacaRepository;

  constructor(repository?: IRacaRepository) {
    this.repository = repository || new PrismaRacaRepository();
  }

  async getAllRacas(): Promise<Raca[]> {
    return this.repository.findAll();
  }

  async getRacaById(id: string): Promise<Raca | null> {
    if (!id) throw new Error("ID da raça é obrigatório.");
    return this.repository.findById(id);
  }

  async createRaca(data: Omit<Raca, "id" | "created_at">): Promise<Raca> {
    if (!data.nome) throw new Error("O nome da raça é obrigatório.");
    return this.repository.create(data);
  }

  async updateRaca(id: string, data: Partial<Raca>): Promise<Raca> {
    if (!id) throw new Error("ID da raça é obrigatório.");
    return this.repository.update(id, data);
  }

  async deleteRaca(id: string): Promise<void> {
    if (!id) throw new Error("ID da raça é obrigatório.");
    return this.repository.delete(id);
  }
}
