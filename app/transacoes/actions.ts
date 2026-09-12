"use server"

import { TransacaoService } from "@/src/core/services/TransacaoService";
import { revalidatePath } from "next/cache";

const transacaoService = new TransacaoService();

export async function getTransacoes() {
  return await transacaoService.getAllTransacoes();
}

export async function getTransacao(id: string) {
  return await transacaoService.getTransacaoById(id);
}

import { prisma } from "@/lib/prisma";

export async function createTransacao(data: any) {
  try {
    const result = await prisma.transacao.create({
      data: {
        tipo: data.tipo,
        parceiro_id: data.parceiro_id,
        data_negociacao: new Date(data.data_negociacao),
        qtd_parcelas: data.qtd_parcelas,
        forma_pagamento: data.forma_pagamento,
        valor_total: data.valor_total,
        observacoes: data.observacoes,
        status: data.status || "pendente",
        gta_url: data.gta_url,
        nota_fiscal_url: data.nota_fiscal_url,
        animais: data.animais_ids ? {
          connect: data.animais_ids.map((id: string) => ({ id }))
        } : undefined,
        parcelas: {
          create: Array.from({ length: data.qtd_parcelas }).map((_, i) => {
            const dataVencimento = new Date(data.data_negociacao);
            dataVencimento.setDate(dataVencimento.getDate() + (i + 1) * 30);
            return {
              numero_parcela: i + 1,
              data_vencimento: dataVencimento,
              valor: data.valor_total / data.qtd_parcelas,
              status: "pendente"
            }
          })
        }
      }
    });

    if (data.tipo === "compra" && data.animais_ids) {
      await prisma.animal.updateMany({
        where: { id: { in: data.animais_ids } },
        data: { comprador_id: data.parceiro_id }
      });
    } else if (data.tipo === "venda" && data.animais_ids) {
      await prisma.animal.updateMany({
        where: { id: { in: data.animais_ids } },
        data: { status: "VENDIDO", vendedor_id: data.parceiro_id }
      });
    }

    revalidatePath("/compras");
    revalidatePath("/vendas");
    revalidatePath("/parcelas");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTransacao(id: string, data: any) {
  try {
    const result = await transacaoService.updateTransacao(id, data);
    revalidatePath("/compras");
    revalidatePath("/vendas");
    revalidatePath("/parcelas");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTransacao(id: string) {
  try {
    const transacao = await prisma.transacao.findUnique({
      where: { id },
      include: { animais: true }
    });

    if (transacao && transacao.animais.length > 0) {
      const animaisIds = transacao.animais.map(a => a.id);
      if (transacao.tipo === "compra") {
        await prisma.animal.updateMany({
          where: { id: { in: animaisIds } },
          data: { comprador_id: null }
        });
      } else if (transacao.tipo === "venda") {
        await prisma.animal.updateMany({
          where: { id: { in: animaisIds } },
          data: { status: "ATIVO", vendedor_id: null }
        });
      }
    }

    await transacaoService.deleteTransacao(id);
    revalidatePath("/compras");
    revalidatePath("/vendas");
    revalidatePath("/parcelas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
