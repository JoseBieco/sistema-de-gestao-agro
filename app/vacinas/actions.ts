"use server"

import { VacinaService } from "@/src/core/services/VacinaService";
import { revalidatePath } from "next/cache";

const vacinaService = new VacinaService();

// Tipos de Vacina
export async function getTiposVacina() {
  return await vacinaService.getAllTiposVacina();
}

export async function createTipoVacina(data: any) {
  const result = await vacinaService.createTipoVacina(data);
  revalidatePath("/vacinas");
  return result;
}

export async function updateTipoVacina(id: string, data: any) {
  const result = await vacinaService.updateTipoVacina(id, data);
  revalidatePath("/vacinas");
  return result;
}

export async function deleteTipoVacina(id: string) {
  await vacinaService.deleteTipoVacina(id);
  revalidatePath("/vacinas");
}

// Agenda de Vacinas
export async function getAgendas() {
  return await vacinaService.getAllAgendas();
}

export async function createAgenda(data: any) {
  const result = await vacinaService.createAgenda({
    ...data,
    data_prevista: new Date(data.data_prevista),
    data_aplicacao: data.data_aplicacao ? new Date(data.data_aplicacao) : null
  });
  revalidatePath("/agenda");
  return result;
}

export async function updateAgenda(id: string, data: any) {
  const result = await vacinaService.updateAgenda(id, {
    ...data,
    data_prevista: data.data_prevista ? new Date(data.data_prevista) : undefined,
    data_aplicacao: data.data_aplicacao ? new Date(data.data_aplicacao) : undefined
  });
  revalidatePath("/agenda");
  return result;
}

export async function deleteAgenda(id: string) {
  await vacinaService.deleteAgenda(id);
  revalidatePath("/agenda");
}
