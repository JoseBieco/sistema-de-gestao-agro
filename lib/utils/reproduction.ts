import { addDays, format, parseISO } from "date-fns";

// Constantes baseadas na raça Nelore
const GESTACAO_MEDIA_DIAS = 290; // Média entre 286 e 294
const CICLO_ESTRAL_DIAS = 21; // Média do ciclo
const RETORNO_POS_PARTO_MIN = 60; // Dias para voltar a ciclar após parto

export function calcularPrevisoes(dados: {
  data_ultimo_parto?: string;
  data_ultimo_cio?: string;
  data_cobertura?: string;
}) {
  const resultado = {
    data_prevista_parto: null as Date | null,
    data_prevista_cio: null as Date | null,
    data_diagnostico: null as Date | null,
    status_sugerido: "vazia" as string,
  };

  // 1. Se foi coberta, calculamos o parto
  if (dados.data_cobertura) {
    const dataCob = parseISO(dados.data_cobertura);
    resultado.data_prevista_parto = addDays(dataCob, GESTACAO_MEDIA_DIAS);
    resultado.data_diagnostico = addDays(dataCob, 45); // Diagnóstico via toque/ultrassom
    resultado.status_sugerido = "aguardando_diagnostico";

    // Se foi coberta, a previsão de cio "pausa" (ou seria a data caso falhe, +21 dias)
    resultado.data_prevista_cio = addDays(dataCob, CICLO_ESTRAL_DIAS);
  }

  // 2. Se não foi coberta, mas teve cio recente
  else if (dados.data_ultimo_cio) {
    const dataCio = parseISO(dados.data_ultimo_cio);
    resultado.data_prevista_cio = addDays(dataCio, CICLO_ESTRAL_DIAS);
    resultado.status_sugerido = "vazia";
  }

  // 3. Se acabou de parir (está em anestro pós-parto)
  else if (dados.data_ultimo_parto) {
    const dataParto = parseISO(dados.data_ultimo_parto);
    // Estima retorno ao cio
    resultado.data_prevista_cio = addDays(dataParto, RETORNO_POS_PARTO_MIN);
    resultado.status_sugerido = "lactacao";
  }

  return resultado;
}
