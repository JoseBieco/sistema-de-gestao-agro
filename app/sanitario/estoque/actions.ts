"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

// --- Produtos Sanitários (CRUD) ---

export async function getProdutosSanitarios() {
  try {
    return await prisma.produtoSanitario.findMany({
      orderBy: { nome: "asc" }
    })
  } catch (error) {
    console.error("Erro ao buscar produtos sanitários:", error)
    throw new Error("Não foi possível carregar os produtos.")
  }
}

export async function getProdutoSanitarioById(id: string) {
  try {
    return await prisma.produtoSanitario.findUnique({
      where: { id }
    })
  } catch (error) {
    console.error("Erro ao buscar produto sanitário:", error)
    throw new Error("Não foi possível carregar o produto.")
  }
}

export async function createProdutoSanitario(data: {
  nome: string
  tipo: string
  quantidade_estoque: number
  unidade_medida: string
  indicacao?: string
}) {
  try {
    const produto = await prisma.produtoSanitario.create({
      data: {
        nome: data.nome,
        tipo: data.tipo,
        quantidade_estoque: data.quantidade_estoque,
        unidade_medida: data.unidade_medida,
        indicacao: data.indicacao
      }
    })

    // Registra a movimentação inicial se houver quantidade > 0
    if (data.quantidade_estoque > 0) {
      await prisma.movimentacaoEstoqueSanitario.create({
        data: {
          produto_id: produto.id,
          tipo_transacao: "ENTRADA",
          quantidade: data.quantidade_estoque,
          observacoes: "Estoque inicial"
        }
      })
    }

    revalidatePath("/sanitario/estoque")
    return { success: true, data: produto }
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return { success: false, error: "Falha ao criar produto sanitário." }
  }
}

export async function updateProdutoSanitario(id: string, data: {
  nome: string
  tipo: string
  unidade_medida: string
  indicacao?: string
}) {
  try {
    const produto = await prisma.produtoSanitario.update({
      where: { id },
      data: {
        nome: data.nome,
        tipo: data.tipo,
        unidade_medida: data.unidade_medida,
        indicacao: data.indicacao
      }
    })
    revalidatePath("/sanitario/estoque")
    return { success: true, data: produto }
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return { success: false, error: "Falha ao atualizar produto sanitário." }
  }
}

export async function deleteProdutoSanitario(id: string) {
  try {
    await prisma.produtoSanitario.delete({
      where: { id }
    })
    revalidatePath("/sanitario/estoque")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    return { success: false, error: "Falha ao excluir produto. Ele pode estar vinculado a alguma ocorrência ou tratamento." }
  }
}

// --- Movimentação de Estoque ---

export async function getMovimentacoesProduto(produtoId: string) {
  try {
    return await prisma.movimentacaoEstoqueSanitario.findMany({
      where: { produto_id: produtoId },
      orderBy: { data_transacao: "desc" }
    })
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error)
    throw new Error("Não foi possível carregar as movimentações.")
  }
}

export async function registrarMovimentacaoSanitaria(data: {
  produto_id: string
  tipo_transacao: "ENTRADA" | "SAIDA" | "AJUSTE"
  quantidade: number
  observacoes?: string
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Cria a movimentação
      const mov = await tx.movimentacaoEstoqueSanitario.create({
        data: {
          produto_id: data.produto_id,
          tipo_transacao: data.tipo_transacao,
          quantidade: data.quantidade,
          observacoes: data.observacoes
        }
      })

      // Atualiza o total do estoque
      const produto = await tx.produtoSanitario.findUnique({
        where: { id: data.produto_id }
      })

      if (!produto) throw new Error("Produto não encontrado")

      let novoEstoque = produto.quantidade_estoque
      if (data.tipo_transacao === "ENTRADA") {
        novoEstoque += data.quantidade
      } else if (data.tipo_transacao === "SAIDA") {
        novoEstoque -= data.quantidade
      } else if (data.tipo_transacao === "AJUSTE") {
        novoEstoque = data.quantidade // Para ajuste, a quantidade enviada pode ser o novo total
      }

      await tx.produtoSanitario.update({
        where: { id: data.produto_id },
        data: { quantidade_estoque: novoEstoque }
      })

      return mov
    })

    revalidatePath("/sanitario/estoque")
    return { success: true, data: result }
  } catch (error) {
    console.error("Erro ao registrar movimentação:", error)
    return { success: false, error: "Falha ao registrar movimentação." }
  }
}
