"use server"

import { LocalService } from "@/src/core/services/LocalService";
import { revalidatePath } from "next/cache";

const localService = new LocalService();

export async function getLocais() {
  return await localService.getAllLocais();
}

export async function getLocal(id: string) {
  return await localService.getLocalById(id);
}

export async function createLocal(data: any) {
  const result = await localService.createLocal(data);
  revalidatePath("/manejo");
  revalidatePath("/parcelas");
  return result;
}

export async function updateLocal(id: string, data: any) {
  const result = await localService.updateLocal(id, data);
  revalidatePath("/manejo");
  revalidatePath("/parcelas");
  return result;
}

export async function deleteLocal(id: string) {
  await localService.deleteLocal(id);
  revalidatePath("/manejo");
  revalidatePath("/parcelas");
}

export async function moveAnimals(records: any[], destinationId: string, animalIds: string[]) {
  // Using Prisma directly here for this complex transaction, or better, we can import prisma
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  await prisma.$transaction([
    prisma.historicoMovimentacao.createMany({
      data: records.map((r) => ({
        animal_id: r.animal_id,
        local_origem_id: r.local_origem_id,
        local_destino_id: destinationId,
        data_movimentacao: new Date(r.data_movimentacao),
        motivo: r.motivo,
      })),
    }),
    prisma.animal.updateMany({
      where: { id: { in: animalIds } },
      data: { local_id: destinationId },
    })
  ]);

  revalidatePath("/manejo");
}
