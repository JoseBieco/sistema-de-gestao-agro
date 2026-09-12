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
  try {
    const result = await parceiroService.createParceiro(data);
    revalidatePath("/parceiros");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateParceiro(id: string, data: any) {
  try {
    const result = await parceiroService.updateParceiro(id, data);
    revalidatePath("/parceiros");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteParceiro(id: string) {
  try {
    await parceiroService.deleteParceiro(id);
    revalidatePath("/parceiros");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
