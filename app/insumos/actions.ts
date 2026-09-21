"use server"

import { getErrorMessage } from "@/lib/utils/errors";

import { revalidatePath } from "next/cache";

// Workaround para importar prisma de forma segura nos server actions
const getPrisma = async () => {
  const mod = await import("@/lib/prisma");
  // Se o export default for o prisma ou se for export { prisma }
  return mod.prisma || mod.default;
};

// ==========================================
// CATÁLOGO DE INSUMOS
// ==========================================

// Insumos são itens de estoque com categoria "INSUMO" (ver prisma/schema.prisma
// ItemEstoque — o mesmo cadastro/Kardex é compartilhado com o módulo sanitário,
// que usa categoria "SANITARIO").

export async function getInsumos() {
  const prisma = await getPrisma();
  return await prisma.itemEstoque.findMany({
    where: { categoria: "INSUMO" },
    orderBy: { nome: "asc" },
  });
}

export async function createInsumo(data: { nome: string; unidade_base: string; descricao?: string }) {
  try {
    const prisma = await getPrisma();
    const result = await prisma.itemEstoque.create({
      data: {
        categoria: "INSUMO",
        nome: data.nome,
        unidade_medida: data.unidade_base,
        descricao: data.descricao,
      }
    });
    revalidatePath("/insumos");
    revalidatePath("/insumos/catalogo");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateInsumo(id: string, data: { nome: string; unidade_base: string; descricao?: string }) {
  try {
    const prisma = await getPrisma();
    const result = await prisma.itemEstoque.update({
      where: { id },
      data: {
        nome: data.nome,
        unidade_medida: data.unidade_base,
        descricao: data.descricao,
      }
    });
    revalidatePath("/insumos");
    revalidatePath("/insumos/catalogo");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}


// ==========================================
// COMPRAS DE INSUMOS
// ==========================================

export async function getCompras() {
  const prisma = await getPrisma();
  return await prisma.insumoCompra.findMany({
    include: {
      parceiro: true,
      itens: { include: { insumo: true } },
    },
    orderBy: { data_solicitacao: "desc" },
  });
}

export async function getCompra(id: string) {
  const prisma = await getPrisma();
  return await prisma.insumoCompra.findUnique({
    where: { id },
    include: {
      parceiro: true,
      itens: { include: { insumo: true } },
      parcelas: { orderBy: { numero_parcela: "asc" } },
      romaneios: { include: { itens: true } }
    },
  });
}

export async function updateCompra(id: string, payload: any) {
  try {
    const prisma = await getPrisma();
    
    const compraExistente = await prisma.insumoCompra.findUnique({
      where: { id },
      include: { romaneios: true }
    });

    if (!compraExistente) {
      throw new Error("Compra não encontrada");
    }

    if (compraExistente.romaneios && compraExistente.romaneios.length > 0) {
      throw new Error("Não é possível editar uma compra que já possui itens recebidos");
    }

    await prisma.$transaction(async (tx: any) => {
      // 1. Limpa itens e parcelas antigas
      await tx.insumoCompraItem.deleteMany({ where: { insumo_compra_id: id } });
      await tx.insumoParcela.deleteMany({ where: { insumo_compra_id: id } });

      let valor_itens = 0;
      const itensComTotais = payload.itens.map((item: any) => {
        const total = item.quantidade_compra * item.valor_unitario;
        valor_itens += total;
        return {
          item_id: item.insumo_id,
          quantidade_compra: item.quantidade_compra,
          unidade_compra: item.unidade_compra,
          fator_conversao: item.fator_conversao,
          valor_unitario: item.valor_unitario,
          valor_total: total
        };
      });

      const valor_total = valor_itens + payload.valor_frete + payload.valor_outros_custos;

      await tx.insumoCompra.update({
        where: { id },
        data: {
          parceiro_id: payload.parceiro_id,
          data_solicitacao: new Date(payload.data_solicitacao),
          data_prevista_entrega: payload.data_prevista_entrega ? new Date(payload.data_prevista_entrega) : null,
          valor_itens,
          valor_frete: payload.valor_frete,
          valor_outros_custos: payload.valor_outros_custos,
          valor_total,
          observacoes: payload.observacoes,
          itens: {
            create: itensComTotais
          },
          parcelas: {
            create: payload.parcelas.map((p: any) => ({
              numero_parcela: p.numero_parcela,
              valor: p.valor,
              forma_pagamento: p.forma_pagamento,
              data_vencimento: new Date(p.data_vencimento)
            }))
          }
        }
      });
    });

    revalidatePath("/insumos");
    revalidatePath("/insumos/compras");
    revalidatePath(`/insumos/compras/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createCompra(payload: {
  parceiro_id: string;
  data_solicitacao: string;
  data_prevista_entrega?: string;
  valor_frete: number;
  valor_outros_custos: number;
  observacoes?: string;
  itens: Array<{
    insumo_id: string;
    quantidade_compra: number;
    unidade_compra: string;
    fator_conversao: number;
    valor_unitario: number;
  }>;
  parcelas: Array<{
    numero_parcela: number;
    data_vencimento: string;
    valor: number;
    forma_pagamento?: string;
  }>;
}) {
  try {
    const prisma = await getPrisma();

    await prisma.$transaction(async (tx: any) => {
      let valor_itens = 0;
      const itensComTotais = payload.itens.map(item => {
        const total = item.quantidade_compra * item.valor_unitario;
        valor_itens += total;
        return {
          item_id: item.insumo_id,
          quantidade_compra: item.quantidade_compra,
          unidade_compra: item.unidade_compra,
          fator_conversao: item.fator_conversao,
          valor_unitario: item.valor_unitario,
          valor_total: total
        };
      });

      const valor_total = valor_itens + payload.valor_frete + payload.valor_outros_custos;

      const compra = await tx.insumoCompra.create({
        data: {
          parceiro_id: payload.parceiro_id,
          data_solicitacao: new Date(payload.data_solicitacao),
          data_prevista_entrega: payload.data_prevista_entrega ? new Date(payload.data_prevista_entrega) : null,
          valor_itens,
          valor_frete: payload.valor_frete,
          valor_outros_custos: payload.valor_outros_custos,
          valor_total,
          observacoes: payload.observacoes,
          itens: {
            create: itensComTotais
          },
          parcelas: {
            create: payload.parcelas.map(p => ({
              ...p,
              data_vencimento: new Date(p.data_vencimento)
            }))
          }
        }
      });
      return compra;
    });

    revalidatePath("/insumos");
    revalidatePath("/insumos/compras");
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function cancelCompra(id: string) {
  try {
    const prisma = await getPrisma();
    
    const compra = await prisma.insumoCompra.findUnique({
      where: { id },
      include: { romaneios: true }
    });

    if (!compra) {
      throw new Error("Compra não encontrada");
    }

    if (compra.romaneios && compra.romaneios.length > 0) {
      throw new Error("Não é possível cancelar uma compra que já possui itens recebidos. Estorne o recebimento primeiro.");
    }

    await prisma.$transaction(async (tx: any) => {
      // Deleta apenas as parcelas não pagas
      await tx.insumoParcela.deleteMany({
        where: {
          insumo_compra_id: id,
          status: { not: "PAGO" }
        }
      });

      // Atualiza o status da compra
      await tx.insumoCompra.update({
        where: { id },
        data: {
          status_entrega: "CANCELADO",
          status_pagamento: "CANCELADO"
        }
      });
    });

    revalidatePath("/insumos");
    revalidatePath("/insumos/compras");
    revalidatePath(`/insumos/compras/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// ==========================================
// RECEBIMENTO E ESTOQUE (KARDEX)
// ==========================================

export async function receiveRomaneio(payload: {
  insumo_compra_id: string;
  data_entrega: string;
  nome_recebedor?: string;
  observacoes?: string;
  itens_recebidos: Array<{
    insumo_compra_item_id: string;
    quantidade_entregue: number; // na unidade_compra
    numero_lote?: string;
    data_validade?: string;
  }>;
}) {
  try {
    const prisma = await getPrisma();

    await prisma.$transaction(async (tx: any) => {
      // 1. Criar o Romaneio e Itens
      const romaneio = await tx.romaneioEntrega.create({
        data: {
          insumo_compra_id: payload.insumo_compra_id,
          data_entrega: new Date(payload.data_entrega),
          nome_recebedor: payload.nome_recebedor,
          observacoes: payload.observacoes,
          itens: {
            create: payload.itens_recebidos.map(item => ({
              insumo_compra_item_id: item.insumo_compra_item_id,
              quantidade_entregue: item.quantidade_entregue,
              numero_lote: item.numero_lote,
              data_validade: item.data_validade ? new Date(item.data_validade) : null,
            }))
          }
        },
        include: { itens: true }
      });

      // 2. Buscar a compra para ratear o frete
      const compra = await tx.insumoCompra.findUnique({
        where: { id: payload.insumo_compra_id }
      });

      if (!compra) throw new Error("Compra não encontrada");

      // Custo extra total para rateio
      const totalCustosExtras = compra.valor_frete + compra.valor_outros_custos;
      // Evita divisão por zero quando a compra não tem valor de itens (ex: itens gratuitos)
      const ratioCustosExtras = compra.valor_itens > 0 ? totalCustosExtras / compra.valor_itens : 0; // % de acrescimo em cada item

      // 3. Processar Kardex para cada item entregue
      for (const itemEntregue of romaneio.itens) {
        // Buscar o item da compra para obter fator_conversao, item_id, valor_unitario
        const compraItem = await tx.insumoCompraItem.findUnique({
          where: { id: itemEntregue.insumo_compra_item_id }
        });

        const quantidade_base = itemEntregue.quantidade_entregue * compraItem.fator_conversao;

        // Custo rateado por unidade da COMPRA (ex: Tonelada)
        const custo_unitario_com_rateio = compraItem.valor_unitario * (1 + ratioCustosExtras);
        // Custo rateado pela unidade BASE (ex: Kg)
        const custo_por_base_unit = custo_unitario_com_rateio / compraItem.fator_conversao;

        // 3.1 Inserir no Kardex
        await tx.movimentacaoEstoque.create({
          data: {
            item_id: compraItem.item_id,
            tipo_transacao: "ENTRADA_COMPRA",
            quantidade: quantidade_base,
            data_transacao: romaneio.data_entrega,
            referencia_id: itemEntregue.id,
            numero_lote: itemEntregue.numero_lote,
            data_validade: itemEntregue.data_validade,
            custo_por_unidade: custo_por_base_unit,
          }
        });

        // 3.2 Atualizar Cache de Estoque do Insumo
        await tx.itemEstoque.update({
          where: { id: compraItem.item_id },
          data: {
            estoque_atual: {
              increment: quantidade_base
            }
          }
        });
      }

      // 4. Atualizar Status de Entrega da Compra
      const compraTotal = await tx.insumoCompra.findUnique({
        where: { id: payload.insumo_compra_id },
        include: {
          itens: true,
          romaneios: { include: { itens: true } }
        }
      });

      let todasEntregues = true;
      for (const itemCompra of compraTotal.itens) {
        let qtdEntregue = 0;
        compraTotal.romaneios.forEach((rom: any) => {
          rom.itens.forEach((ri: any) => {
            if (ri.insumo_compra_item_id === itemCompra.id) {
              qtdEntregue += Number(ri.quantidade_entregue);
            }
          });
        });
        if (qtdEntregue < Number(itemCompra.quantidade_compra)) {
          todasEntregues = false;
          break;
        }
      }

      await tx.insumoCompra.update({
        where: { id: payload.insumo_compra_id },
        data: {
          status_entrega: todasEntregues ? "ENTREGUE" : "PARCIALMENTE_ENTREGUE"
        }
      });
    });

    revalidatePath("/insumos");
    revalidatePath("/insumos/compras");
    revalidatePath("/insumos/kardex");
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getMovimentacoesEstoque() {
  const prisma = await getPrisma();
  return await prisma.movimentacaoEstoque.findMany({
    where: { item: { categoria: "INSUMO" } },
    include: { item: true },
    orderBy: { data_transacao: "desc" },
  });
}
