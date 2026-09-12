import { IAnimalRepository, IRacaRepository } from "../../core/repositories/IAnimalRepository";
import { Animal, Raca } from "../../core/domain/entities/Animal";
import { prisma } from "@/lib/prisma";

export class PrismaAnimalRepository implements IAnimalRepository {
  async findAll(): Promise<Animal[]> {
    const animais = await prisma.animal.findMany({
      include: {
        raca: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return animais as Animal[];
  }

  async findById(id: string): Promise<Animal | null> {
    const animal = await prisma.animal.findUnique({
      where: { id },
      include: {
        raca: true,
      },
    });
    return animal as Animal | null;
  }

  async findByIdDetailed(id: string): Promise<any> {
    return await prisma.animal.findUnique({
      where: { id },
      include: {
        raca: true,
        mae: { select: { id: true, brinco: true, nome: true } },
        pai: { select: { id: true, brinco: true, nome: true } },
        filhos_mae: { select: { id: true, brinco: true, nome: true } },
        filhos_pai: { select: { id: true, brinco: true, nome: true } },
        historico_pesagem: { orderBy: { data_pesagem: 'desc' } },
        agenda_vacinas: { include: { tipo_vacina: true }, orderBy: { data_prevista: 'desc' }, take: 5 }
      }
    });
  }

  async create(data: Omit<Animal, "id" | "created_at">): Promise<Animal> {
    const animal = await prisma.animal.create({
      data: {
        ...data,
      },
      include: {
        raca: true,
      }
    });
    return animal as Animal;
  }

  async update(id: string, data: Partial<Animal>): Promise<Animal> {
    const animal = await prisma.animal.update({
      where: { id },
      data,
      include: {
        raca: true,
      }
    });
    return animal as Animal;
  }

  async delete(id: string): Promise<void> {
    await prisma.animal.delete({
      where: { id },
    });
  }
}

export class PrismaRacaRepository implements IRacaRepository {
  async findAll(): Promise<Raca[]> {
    return await prisma.raca.findMany({
      orderBy: { nome: "asc" }
    });
  }

  async findById(id: string): Promise<Raca | null> {
    return await prisma.raca.findUnique({
      where: { id }
    });
  }

  async create(data: Omit<Raca, "id" | "created_at">): Promise<Raca> {
    return await prisma.raca.create({
      data,
    });
  }

  async update(id: string, data: Partial<Raca>): Promise<Raca> {
    return await prisma.raca.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.raca.delete({
      where: { id },
    });
  }
}
