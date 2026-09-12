"use server"

import { RacaService } from "@/src/core/services/RacaService";
import { revalidatePath } from "next/cache";

const racaService = new RacaService();

export async function getRacas() {
  return await racaService.getAllRacas();
}

export async function createRaca(data: any) {
  const result = await racaService.createRaca(data);
  revalidatePath("/racas");
  return result;
}

export async function updateRaca(id: string, data: any) {
  const result = await racaService.updateRaca(id, data);
  revalidatePath("/racas");
  return result;
}

export async function deleteRaca(id: string) {
  await racaService.deleteRaca(id);
  revalidatePath("/racas");
}
