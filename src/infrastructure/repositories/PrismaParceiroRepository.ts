import { prisma } from "@/lib/prisma";
import { IParceiroRepository } from "../../core/repositories/IParceiroRepository";
import { Parceiro } from "../../core/domain/entities/Parceiro";

export class PrismaParceiroRepository implements IParceiroRepository {
  async findAll(): Promise<Parceiro[]> {
    return await prisma.parceiro.findMany({
      orderBy: { nome: 'asc' }
    }) as any;
  }

  async findById(id: string): Promise<Parceiro | null> {
    return await prisma.parceiro.findUnique({
      where: { id },
    }) as any;
  }

  async create(data: Omit<Parceiro, "id" | "created_at">): Promise<Parceiro> {
    return await prisma.parceiro.create({
      data: data as any,
    }) as any;
  }

  async update(id: string, data: Partial<Parceiro>): Promise<Parceiro> {
    return await prisma.parceiro.update({
      where: { id },
      data: data as any,
    }) as any;
  }

  async delete(id: string): Promise<void> {
    await prisma.parceiro.delete({
      where: { id },
    });
  }
}
