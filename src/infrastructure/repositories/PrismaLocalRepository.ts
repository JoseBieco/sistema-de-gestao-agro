import { prisma } from "@/lib/prisma";
import { ILocalRepository } from "../../core/repositories/ILocalRepository";
import { Local } from "../../core/domain/entities/Local";

export class PrismaLocalRepository implements ILocalRepository {
  async findAll(): Promise<Local[]> {
    return await prisma.local.findMany({
      orderBy: { nome: 'asc' }
    }) as any;
  }

  async findById(id: string): Promise<Local | null> {
    return await prisma.local.findUnique({
      where: { id },
    }) as any;
  }

  async create(data: Omit<Local, "id" | "created_at">): Promise<Local> {
    return await prisma.local.create({
      data: data as any,
    }) as any;
  }

  async update(id: string, data: Partial<Local>): Promise<Local> {
    return await prisma.local.update({
      where: { id },
      data: data as any,
    }) as any;
  }

  async delete(id: string): Promise<void> {
    await prisma.local.delete({
      where: { id },
    });
  }
}
