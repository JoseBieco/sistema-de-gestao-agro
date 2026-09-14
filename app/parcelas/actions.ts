"use server"

import { ParcelaService } from "@/src/core/services/ParcelaService";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const parcelaService = new ParcelaService();

export async function getParcelas() {
  return await parcelaService.getAllParcelas();
}

export async function getAllParcelasUnified() {
  const [parcelasRebanho, parcelasEstoque] = await Promise.all([
    prisma.parcela.findMany({
      include: { transacao: { include: { parceiro: true } } },
      orderBy: { data_vencimento: "asc" }
    }),
    prisma.insumoParcela.findMany({
      include: { compra: { include: { parceiro: true } } },
      orderBy: { data_vencimento: "asc" }
    })
  ]);

  const unified = [
    ...parcelasRebanho.map((p: any) => ({
      ...p,
      origem: "REBANHO",
      parceiro_nome: p.transacao?.parceiro?.nome || "-",
      tipo_operacao: p.transacao?.tipo === "compra" ? "Despesa" : "Receita",
    })),
    ...parcelasEstoque.map((p: any) => ({
      ...p,
      origem: "ESTOQUE",
      parceiro_nome: p.compra?.parceiro?.nome || "-",
      tipo_operacao: "Despesa", // Compras de insumo sempre são despesa
    }))
  ];

  unified.sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime());

  return unified;
}

export async function getParcela(id: string) {
  return await parcelaService.getParcelaById(id);
}

export async function createParcela(data: any) {
  try {
    const result = await parcelaService.createParcela(data);
    revalidatePath("/parcelas");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateParcela(id: string, data: any) {
  try {
    const result = await parcelaService.updateParcela(id, data);
    revalidatePath("/parcelas");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteParcela(id: string) {
  try {
    await parcelaService.deleteParcela(id);
    revalidatePath("/parcelas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function payParcela(id: string, paymentData: any) {
  try {

    const parcela = await prisma.parcela.update({
      where: { id },
      data: {
        status: "pago",
        valor: paymentData.valor !== undefined ? Number(paymentData.valor) : undefined,
        data_pagamento: paymentData.data_pagamento ? new Date(paymentData.data_pagamento) : null,
        data_baixa_promissoria: paymentData.data_baixa_promissoria ? new Date(paymentData.data_baixa_promissoria) : null,
        observacoes: paymentData.observacoes !== undefined ? paymentData.observacoes : undefined,
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
    return { success: true, data: parcela };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function payInsumoParcela(id: string, paymentData: any) {
  try {
    const parcela = await prisma.insumoParcela.update({
      where: { id },
      data: {
        status: "PAGO",
        data_pagamento: paymentData.data_pagamento ? new Date(paymentData.data_pagamento) : null,
        forma_pagamento: paymentData.forma_pagamento,
      }
    });

    const allParcelas = await prisma.insumoParcela.findMany({
      where: { insumo_compra_id: parcela.insumo_compra_id },
      select: { status: true }
    });

    if (allParcelas.every((p: any) => p.status === "PAGO")) {
      await prisma.insumoCompra.update({
        where: { id: parcela.insumo_compra_id },
        data: { status_pagamento: "PAGO" }
      });
    } else {
      await prisma.insumoCompra.update({
        where: { id: parcela.insumo_compra_id },
        data: { status_pagamento: "PENDENTE_PAGAMENTO" } // could be PARCIALMENTE_PAGO if we added it to enum
      });
    }

    revalidatePath("/parcelas");
    revalidatePath("/insumos/compras");
    return { success: true, data: parcela };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

