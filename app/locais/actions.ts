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
  try {
    const result = await localService.createLocal(data);
    revalidatePath("/manejo");
    revalidatePath("/parcelas");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLocal(id: string, data: any) {
  try {
    const result = await localService.updateLocal(id, data);
    revalidatePath("/manejo");
    revalidatePath("/parcelas");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLocal(id: string) {
  try {
    await localService.deleteLocal(id);
    revalidatePath("/manejo");
    revalidatePath("/parcelas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function moveAnimals(records: any[], destinationId: string, animalIds: string[]) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.$transaction([
      prisma.historicoMovimentacao.createMany({
        data: records.map((r: any) => ({
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
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
