import { prisma } from "@/lib/prisma";

export class AgendaVacinaRepository {
  async findAll() {
    return prisma.agendaVacina.findMany({
      include: {
        animal: {
          include: { raca: true }
        },
        tipo_vacina: true
      },
      orderBy: { data_prevista: "asc" }
    });
  }

  async findById(id: string) {
    return prisma.agendaVacina.findUnique({
      where: { id },
      include: {
        animal: true,
        tipo_vacina: true
      }
    });
  }

  async create(data: any) {
    return prisma.agendaVacina.create({
      data
    });
  }

  async update(id: string, data: any) {
    return prisma.agendaVacina.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.agendaVacina.delete({
      where: { id }
    });
  }
}
