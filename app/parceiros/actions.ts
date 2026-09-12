"use server"

import { ParceiroService } from "@/src/core/services/ParceiroService";
import { revalidatePath } from "next/cache";

const parceiroService = new ParceiroService();

export async function getParceiros() {
  return await parceiroService.getAllParceiros();
}

export async function getParceiro(id: string) {
  return await parceiroService.getParceiroById(id);
}

export async function createParceiro(data: any) {
  const result = await parceiroService.createParceiro(data);
  revalidatePath("/parceiros");
  return result;
}

export async function updateParceiro(id: string, data: any) {
  const result = await parceiroService.updateParceiro(id, data);
  revalidatePath("/parceiros");
  return result;
}

export async function deleteParceiro(id: string) {
  await parceiroService.deleteParceiro(id);
  revalidatePath("/parceiros");
}
