"use server"

import { VacinaService } from "@/src/core/services/VacinaService";
import { revalidatePath } from "next/cache";

const vacinaService = new VacinaService();

// Tipos de Vacina
export async function getTiposVacina() {
  return await vacinaService.getAllTiposVacina();
}

export async function createTipoVacina(data: any) {
  try {
    const result = await vacinaService.createTipoVacina(data);
    revalidatePath("/vacinas");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTipoVacina(id: string, data: any) {
  try {
    const result = await vacinaService.updateTipoVacina(id, data);
    revalidatePath("/vacinas");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTipoVacina(id: string) {
  try {
    await vacinaService.deleteTipoVacina(id);
    revalidatePath("/vacinas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Agenda de Vacinas
export async function getAgendas() {
  return await vacinaService.getAllAgendas();
}

export async function createAgenda(data: any) {
  try {
    const result = await vacinaService.createAgenda({
      ...data,
      data_prevista: new Date(data.data_prevista),
      data_aplicacao: data.data_aplicacao ? new Date(data.data_aplicacao) : null
    });
    revalidatePath("/agenda");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAgenda(id: string, data: any) {
  try {
    const result = await vacinaService.updateAgenda(id, {
      ...data,
      data_prevista: data.data_prevista ? new Date(data.data_prevista) : undefined,
      data_aplicacao: data.data_aplicacao ? new Date(data.data_aplicacao) : undefined
    });
    revalidatePath("/agenda");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAgenda(id: string) {
  try {
    await vacinaService.deleteAgenda(id);
    revalidatePath("/vacinas"); // Updated to match new route
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function applyVacinasEmLote(payload: {
  animais_ids: string[];
  tipo_vacina_id: string;
  data_aplicacao: string;
  observacoes: string;
}) {
  try {
    const { animais_ids, tipo_vacina_id, data_aplicacao, observacoes } = payload;
    const hoje = new Date().toISOString().split("T")[0];
    const isFuturo = data_aplicacao > hoje;
    
    const statusInicial = isFuturo ? "pendente" : "aplicada";
    const dataAplicacaoEfetiva = isFuturo ? null : data_aplicacao;
    
    // Get vaccine type info
    const tipoVacina = await vacinaService.getTipoVacinaById(tipo_vacina_id);
    if (!tipoVacina) throw new Error("Tipo de vacina não encontrado");

    for (const animalId of animais_ids) {
      const vacinaAplicada = await vacinaService.createAgenda({
        animal_id: animalId,
        tipo_vacina_id,
        data_prevista: new Date(data_aplicacao),
        data_aplicacao: dataAplicacaoEfetiva ? new Date(dataAplicacaoEfetiva) : null,
        status: statusInicial,
        dose_numero: 1,
        observacoes,
      });

      if (tipoVacina.doses_por_ano > 1 && tipoVacina.dias_entre_doses > 0) {
        const nextDate = new Date(data_aplicacao);
        nextDate.setDate(nextDate.getDate() + tipoVacina.dias_entre_doses);

        await vacinaService.createAgenda({
          animal_id: animalId,
          tipo_vacina_id,
          data_prevista: nextDate,
          status: "pendente",
          dose_numero: 2,
          vacina_pai_id: vacinaAplicada.id,
        });
      }
    }

    revalidatePath("/vacinas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function applyPendingVacina(payload: {
  agenda_id: string;
  data_aplicacao: string;
  observacoes: string;
}) {
  try {
    const { agenda_id, data_aplicacao, observacoes } = payload;
    
    const agenda = await vacinaService.getAgendaById(agenda_id);
    if (!agenda) throw new Error("Agenda não encontrada");

    const tipoVacina = await vacinaService.getTipoVacinaById(agenda.tipo_vacina_id);
    
    await vacinaService.updateAgenda(agenda_id, {
      data_aplicacao: new Date(data_aplicacao),
      status: "aplicada",
      observacoes: observacoes || agenda.observacoes,
    });

    if (tipoVacina && tipoVacina.doses_por_ano > agenda.dose_numero) {
      const nextDate = new Date(data_aplicacao);
      nextDate.setDate(nextDate.getDate() + tipoVacina.dias_entre_doses);

      await vacinaService.createAgenda({
        animal_id: agenda.animal_id,
        tipo_vacina_id: agenda.tipo_vacina_id,
        data_prevista: nextDate,
        status: "pendente",
        dose_numero: agenda.dose_numero + 1,
        vacina_pai_id: agenda.id,
      });
    }

    revalidatePath("/vacinas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
