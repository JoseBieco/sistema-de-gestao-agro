import { prisma } from "@/lib/prisma";

export class TipoVacinaRepository {
  async findAll() {
    return prisma.tipoVacina.findMany({
      orderBy: { nome: "asc" }
    });
  }

  async findById(id: string) {
    return prisma.tipoVacina.findUnique({
      where: { id }
    });
  }

  async create(data: any) {
    return prisma.tipoVacina.create({
      data
    });
  }

  async update(id: string, data: any) {
    return prisma.tipoVacina.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.tipoVacina.delete({
      where: { id }
    });
  }
}
