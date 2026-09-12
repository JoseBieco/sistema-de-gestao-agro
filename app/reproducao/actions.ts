"use server"

import { CicloReprodutivoService } from "@/src/core/services/CicloReprodutivoService";
import { revalidatePath } from "next/cache";

const cicloService = new CicloReprodutivoService();

export async function getCiclos() {
  return await cicloService.getAll();
}

export async function createCiclo(data: any) {
  const result = await cicloService.create({
    ...data,
    data_inseminacao: data.data_inseminacao ? new Date(data.data_inseminacao) : null,
    previsao_parto: data.previsao_parto ? new Date(data.previsao_parto) : null,
    data_parto: data.data_parto ? new Date(data.data_parto) : null,
  });
  revalidatePath("/reproducao");
  return result;
}

export async function updateCiclo(id: string, data: any) {
  const result = await cicloService.update(id, {
    ...data,
    data_inseminacao: data.data_inseminacao ? new Date(data.data_inseminacao) : undefined,
    previsao_parto: data.previsao_parto ? new Date(data.previsao_parto) : undefined,
    data_parto: data.data_parto ? new Date(data.data_parto) : undefined,
  });
  revalidatePath("/reproducao");
  return result;
}

export async function deleteCiclo(id: string) {
  await cicloService.delete(id);
  revalidatePath("/reproducao");
}
