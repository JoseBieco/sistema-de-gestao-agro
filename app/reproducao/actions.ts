"use server"

import { CicloReprodutivoService } from "@/src/core/services/CicloReprodutivoService";
import { revalidatePath } from "next/cache";

const cicloService = new CicloReprodutivoService();

export async function getCiclos() {
  return await cicloService.getAtivos();
}

export async function createCiclo(data: any) {
  const result = await cicloService.create({
    ...data,
    data_ultimo_parto: data.data_ultimo_parto ? new Date(data.data_ultimo_parto) : null,
    data_ultimo_cio: data.data_ultimo_cio ? new Date(data.data_ultimo_cio) : null,
    data_cobertura: data.data_cobertura ? new Date(data.data_cobertura) : null,
    data_prevista_parto: data.data_prevista_parto ? new Date(data.data_prevista_parto) : null,
    data_prevista_cio: data.data_prevista_cio ? new Date(data.data_prevista_cio) : null,
    data_diagnostico_gestacao: data.data_diagnostico_gestacao ? new Date(data.data_diagnostico_gestacao) : null,
  });
  revalidatePath("/reproducao");
  return result;
}

export async function updateCiclo(id: string, data: any) {
  const result = await cicloService.update(id, {
    ...data,
    data_ultimo_parto: data.data_ultimo_parto ? new Date(data.data_ultimo_parto) : undefined,
    data_ultimo_cio: data.data_ultimo_cio ? new Date(data.data_ultimo_cio) : undefined,
    data_cobertura: data.data_cobertura ? new Date(data.data_cobertura) : undefined,
    data_prevista_parto: data.data_prevista_parto ? new Date(data.data_prevista_parto) : undefined,
    data_prevista_cio: data.data_prevista_cio ? new Date(data.data_prevista_cio) : undefined,
    data_diagnostico_gestacao: data.data_diagnostico_gestacao ? new Date(data.data_diagnostico_gestacao) : undefined,
  });
  revalidatePath("/reproducao");
  return result;
}

export async function deleteCiclo(id: string) {
  await cicloService.delete(id);
  revalidatePath("/reproducao");
}
