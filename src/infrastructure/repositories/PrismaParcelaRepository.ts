import { prisma } from "@/lib/prisma";
import { IParcelaRepository } from "../../core/repositories/IParcelaRepository";
import { Parcela } from "../../core/domain/entities/Parcela";

export class PrismaParcelaRepository implements IParcelaRepository {
  async findAll(): Promise<Parcela[]> {
    return await prisma.parcela.findMany({
      include: {
        transacao: {
          select: {
            id: true,
            tipo: true,
            parceiro: {
              select: {
                id: true,
                nome: true,
              }
            }
          }
        }
      },
      orderBy: { data_vencimento: 'asc' }
    }) as any;
  }

  async findById(id: string): Promise<Parcela | null> {
    return await prisma.parcela.findUnique({
      where: { id },
      include: {
        transacao: {
          select: {
            id: true,
            tipo: true,
            parceiro: true
          }
        }
      }
    }) as any;
  }

  async create(data: Omit<Parcela, "id" | "created_at">): Promise<Parcela> {
    return await prisma.parcela.create({
      data: data as any,
    }) as any;
  }

  async update(id: string, data: Partial<Parcela>): Promise<Parcela> {
    return await prisma.parcela.update({
      where: { id },
      data: data as any,
    }) as any;
  }

  async delete(id: string): Promise<void> {
    await prisma.parcela.delete({
      where: { id },
    });
  }
}
