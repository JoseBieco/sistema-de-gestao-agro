"use server"

import { getErrorMessage } from "@/lib/utils/errors";
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
    if (data.tipo !== "compra" && data.tipo !== "venda") {
      return { success: false, error: "Tipo de transação inválido." };
    }
    if (!data.valor_total || Number(data.valor_total) <= 0) {
      return { success: false, error: "O valor total deve ser maior que zero." };
    }
    if (!data.qtd_parcelas || Number(data.qtd_parcelas) <= 0) {
      return { success: false, error: "A quantidade de parcelas deve ser maior que zero." };
    }

    const result = await prisma.transacao.create({
      data: {
        tipo: data.tipo,
        parceiro_id: data.parceiro_id || null,
        data_negociacao: new Date(data.data_negociacao),
        qtd_parcelas: data.qtd_parcelas,
        forma_pagamento: data.forma_pagamento,
        valor_total: data.valor_total,
        desconto_carcaca: data.desconto_carcaca,
        observacoes: data.observacoes,
        status: data.status || "pendente",
        gta_url: data.gta_url,
        nota_fiscal_url: data.nota_fiscal_url,
        animais: data.animais_ids ? {
          connect: data.animais_ids.map((id: string) => ({ id }))
        } : undefined,
        grupos: data.grupos_data ? {
          create: data.grupos_data.map((g: any) => ({
            nome: g.nome,
            tipo_medida: g.tipo_medida,
            valor_unidade: g.valor_unidade,
            quantidade_animais: g.quantidade_animais,
            peso_total: g.peso_total,
            valor_calculado: g.valor_calculado,
            animais: g.animais_ids ? {
              connect: g.animais_ids.map((id: string) => ({ id }))
            } : undefined
          }))
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
        data: { comprador_id: data.parceiro_id || null }
      });
    } else if (data.tipo === "venda" && data.animais_ids) {
      await prisma.animal.updateMany({
        where: { id: { in: data.animais_ids } },
        data: { status: "VENDIDO", vendedor_id: data.parceiro_id || null }
      });
    }

    revalidatePath("/compras");
    revalidatePath("/vendas");
    revalidatePath("/parcelas");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateTransacao(id: string, data: any) {
  try {
    const transacaoAtual = await prisma.transacao.findUnique({
      where: { id },
      include: { animais: true }
    });

    // Extract parceiro_id before delegating, in case we need to update it
    const novoParceiroId = data.parceiro_id !== undefined ? (data.parceiro_id === "" ? null : data.parceiro_id) : undefined;
    if (data.parceiro_id === "") {
        data.parceiro_id = null;
    }

    const result = await transacaoService.updateTransacao(id, data);

    if (novoParceiroId !== undefined && transacaoAtual && transacaoAtual.parceiro_id !== novoParceiroId) {
       const animaisIds = transacaoAtual.animais.map((a: any) => a.id);
       if (animaisIds.length > 0) {
         if (transacaoAtual.tipo === "compra") {
            await prisma.animal.updateMany({
              where: { id: { in: animaisIds } },
              data: { comprador_id: novoParceiroId }
            });
         } else if (transacaoAtual.tipo === "venda") {
            await prisma.animal.updateMany({
              where: { id: { in: animaisIds } },
              data: { vendedor_id: novoParceiroId }
            });
         }
       }
    }

    revalidatePath("/compras");
    revalidatePath("/vendas");
    revalidatePath("/parcelas");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
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
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
