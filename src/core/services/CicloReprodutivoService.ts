import { CicloReprodutivoRepository } from "@/src/infrastructure/repositories/CicloReprodutivoRepository";

export class CicloReprodutivoService {
  private repo = new CicloReprodutivoRepository();

  async getAtivos() {
    return this.repo.findAtivos();
  }

  async getAll() {
    return this.repo.findAll();
  }

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async create(data: any) {
    if (data.ativo !== false) {
      await this.repo.inativarCiclosAntigos(data.animal_id);
    }
    return this.repo.create(data);
  }

  async update(id: string, data: any) {
    const oldCiclo = await this.repo.findById(id);
    const result = await this.repo.update(id, data);

    // Automação: se o ciclo foi atualizado para "lactacao" e antes não era
    // significa que o bezerro nasceu (houve parto). Cadastramos o bezerro automaticamente.
    if (data.status === "lactacao" && oldCiclo?.status !== "lactacao" && oldCiclo?.animal_id) {
      const { prisma } = await import("@/lib/prisma");
      const mae = await prisma.animal.findUnique({ where: { id: oldCiclo.animal_id } });
      
      if (mae) {
        const hash = Math.random().toString(36).substring(2, 6).toUpperCase();
        await prisma.animal.create({
          data: {
            brinco: `BEZ-${hash}`,
            nome: `Bezerro(a) de ${mae.nome || mae.brinco}`,
            raca_id: mae.raca_id,
            sexo: "M", // Temporário, o pecuarista precisará editar depois
            data_nascimento: data.data_ultimo_parto ? new Date(data.data_ultimo_parto) : new Date(),
            status: "ATIVO",
            mae_id: mae.id,
            pai_id: oldCiclo.touro_id || null,
            local_id: mae.local_id || null,
            observacoes: "Nascimento registrado automaticamente via Gestão Reprodutiva."
          }
        });
      }
    }

    return result;
  }

  async delete(id: string) {
    return this.repo.delete(id);
  }
}
