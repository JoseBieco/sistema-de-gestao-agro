"use server"

import { RacaService } from "@/src/core/services/RacaService";
import { revalidatePath } from "next/cache";

const racaService = new RacaService();

export async function getRacas() {
  return await racaService.getAllRacas();
}

export async function createRaca(data: any) {
  try {
    const result = await racaService.createRaca(data);
    revalidatePath("/racas");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRaca(id: string, data: any) {
  try {
    const result = await racaService.updateRaca(id, data);
    revalidatePath("/racas");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRaca(id: string) {
  try {
    await racaService.deleteRaca(id);
    revalidatePath("/racas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
