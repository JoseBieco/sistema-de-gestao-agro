import { prisma } from "@/lib/prisma";

export class CicloReprodutivoRepository {
  async findAll() {
    return prisma.cicloReprodutivo.findMany({
      include: {
        animal: true,
        touro: true
      },
      orderBy: { created_at: "desc" }
    });
  }

  async findAtivos() {
    return prisma.cicloReprodutivo.findMany({
      where: { ativo: true },
      include: {
        animal: true,
        touro: true
      },
      orderBy: { data_prevista_cio: "asc" }
    });
  }

  async findById(id: string) {
    return prisma.cicloReprodutivo.findUnique({
      where: { id },
      include: {
        animal: true,
        touro: true
      }
    });
  }

  async create(data: any) {
    return prisma.cicloReprodutivo.create({
      data
    });
  }

  async update(id: string, data: any) {
    return prisma.cicloReprodutivo.update({
      where: { id },
      data
    });
  }

  async inativarCiclosAntigos(animal_id: string) {
    return prisma.cicloReprodutivo.updateMany({
      where: { animal_id, ativo: true },
      data: { ativo: false }
    });
  }

  async delete(id: string) {
    return prisma.cicloReprodutivo.delete({
      where: { id }
    });
  }
}
