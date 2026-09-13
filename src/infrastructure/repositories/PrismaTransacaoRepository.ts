import { prisma } from "@/lib/prisma";
import { ITransacaoRepository } from "../../core/repositories/ITransacaoRepository";
import { Transacao } from "../../core/domain/entities/Transacao";

export class PrismaTransacaoRepository implements ITransacaoRepository {
  async findAll(): Promise<Transacao[]> {
    return await prisma.transacao.findMany({
      include: {
        parceiro: true,
        animais: {
          include: { raca: true }
        },
        parcelas: true,
        grupos: {
          include: { animais: { select: { id: true } } }
        }
      },
      orderBy: { data_negociacao: 'desc' }
    }) as any;
  }

  async findById(id: string): Promise<Transacao | null> {
    return await prisma.transacao.findUnique({
      where: { id },
      include: {
        parceiro: true,
        animais: {
          include: { raca: true }
        },
        parcelas: true,
        grupos: {
          include: { animais: { select: { id: true } } }
        }
      }
    }) as any;
  }

  async create(data: Omit<Transacao, "id" | "created_at">): Promise<Transacao> {
    return await prisma.transacao.create({
      data: data as any,
    }) as any;
  }

  async update(id: string, data: Partial<Transacao>): Promise<Transacao> {
    return await prisma.transacao.update({
      where: { id },
      data: data as any,
    }) as any;
  }

  async delete(id: string): Promise<void> {
    await prisma.transacao.delete({
      where: { id },
    });
  }
}
