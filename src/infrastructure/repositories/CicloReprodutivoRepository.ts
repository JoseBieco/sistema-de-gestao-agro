import { prisma } from "@/lib/prisma";

export class CicloReprodutivoRepository {
  async findAll() {
    return prisma.cicloReprodutivo.findMany({
      include: {
        femea: true,
        reprodutor: true
      },
      orderBy: { data_inseminacao: "desc" }
    });
  }

  async findById(id: string) {
    return prisma.cicloReprodutivo.findUnique({
      where: { id },
      include: {
        femea: true,
        reprodutor: true
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

  async delete(id: string) {
    return prisma.cicloReprodutivo.delete({
      where: { id }
    });
  }
}
