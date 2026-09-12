import { CicloReprodutivoRepository } from "@/src/infrastructure/repositories/CicloReprodutivoRepository";

export class CicloReprodutivoService {
  private repo = new CicloReprodutivoRepository();

  async getAll() {
    return this.repo.findAll();
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async create(data: any) {
    return this.repo.create(data);
  }

  async update(id: string, data: any) {
    return this.repo.update(id, data);
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }
}
