import { IAnimalRepository } from "../repositories/IAnimalRepository";
import { Animal } from "../domain/entities/Animal";
import { PrismaAnimalRepository } from "../../infrastructure/repositories/PrismaAnimalRepository";

export class AnimalService {
  private repository: IAnimalRepository;

  constructor(repository?: IAnimalRepository) {
    this.repository = repository || new PrismaAnimalRepository();
  }

  async getAllAnimais(): Promise<Animal[]> {
    return this.repository.findAll();
  }

  async getAnimalById(id: string): Promise<Animal | null> {
    if (!id) throw new Error("ID do animal é obrigatório.");
    return this.repository.findById(id);
  }

  async getAnimalByIdDetailed(id: string): Promise<any> {
    if (!id) throw new Error("ID do animal é obrigatório.");
    return this.repository.findByIdDetailed(id);
  }

  async createAnimal(data: Omit<Animal, "id" | "created_at">): Promise<Animal> {
    if (!data.brinco) {
      throw new Error("O número do brinco é obrigatório.");
    }
    if (!data.raca_id) {
      throw new Error("A raça do animal é obrigatória.");
    }
    
    // Podemos adicionar mais lógicas de negócio aqui
    
    return this.repository.create(data);
  }

  async updateAnimal(id: string, data: Partial<Animal>): Promise<Animal> {
    if (!id) throw new Error("ID do animal é obrigatório.");
    return this.repository.update(id, data);
  }

  async deleteAnimal(id: string): Promise<void> {
    if (!id) throw new Error("ID do animal é obrigatório.");
    return this.repository.delete(id);
  }
}
