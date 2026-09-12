"use server"

import { ParcelaService } from "@/src/core/services/ParcelaService";
import { revalidatePath } from "next/cache";

const parcelaService = new ParcelaService();

export async function getParcelas() {
  return await parcelaService.getAllParcelas();
}

export async function getParcela(id: string) {
  return await parcelaService.getParcelaById(id);
}

export async function createParcela(data: any) {
  const result = await parcelaService.createParcela(data);
  revalidatePath("/parcelas");
  return result;
}

export async function updateParcela(id: string, data: any) {
  const result = await parcelaService.updateParcela(id, data);
  revalidatePath("/parcelas");
  return result;
}

export async function deleteParcela(id: string) {
  await parcelaService.deleteParcela(id);
  revalidatePath("/parcelas");
}

export async function payParcela(id: string, paymentData: any) {
  const { prisma } = require('@/lib/prisma');

  const parcela = await prisma.parcela.update({
    where: { id },
    data: {
      status: "pago",
      data_pagamento: paymentData.data_pagamento ? new Date(paymentData.data_pagamento) : null,
      data_baixa_promissoria: paymentData.data_baixa_promissoria ? new Date(paymentData.data_baixa_promissoria) : null,
      foto_promissoria_frente_url: null, // Skipping file upload for now in local env
    }
  });

  const allParcelas = await prisma.parcela.findMany({
    where: { transacao_id: parcela.transacao_id },
    select: { status: true }
  });

  if (allParcelas.every((p: any) => p.status === "pago")) {
    await prisma.transacao.update({
      where: { id: parcela.transacao_id },
      data: { status: "finalizada" }
    });
  }

  revalidatePath("/parcelas");
  return parcela;
}
