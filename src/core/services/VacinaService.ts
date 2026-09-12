import { TipoVacinaRepository } from "@/src/infrastructure/repositories/TipoVacinaRepository";
import { AgendaVacinaRepository } from "@/src/infrastructure/repositories/AgendaVacinaRepository";

export class VacinaService {
  private tipoRepo = new TipoVacinaRepository();
  private agendaRepo = new AgendaVacinaRepository();

  // Tipos de Vacina
  async getAllTiposVacina() {
    return this.tipoRepo.findAll();
  }

  async getTipoVacinaById(id: string) {
    return this.tipoRepo.findById(id);
  }

  async createTipoVacina(data: any) {
    return this.tipoRepo.create(data);
  }

  async updateTipoVacina(id: string, data: any) {
    return this.tipoRepo.update(id, data);
  }

  async deleteTipoVacina(id: string) {
    return this.tipoRepo.delete(id);
  }

  // Agenda de Vacinas
  async getAllAgendas() {
    return this.agendaRepo.findAll();
  }

  async getAgendaById(id: string) {
    return this.agendaRepo.findById(id);
  }

  async createAgenda(data: any) {
    return this.agendaRepo.create(data);
  }

  async updateAgenda(id: string, data: any) {
    return this.agendaRepo.update(id, data);
  }

  async deleteAgenda(id: string) {
    return this.agendaRepo.delete(id);
  }
}
