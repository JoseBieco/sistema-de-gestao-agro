"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

// Produtos sanitários são itens de estoque com categoria "SANITARIO" (ver
// prisma/schema.prisma ItemEstoque — o mesmo cadastro/Kardex é compartilhado
// com o módulo de insumos, que usa categoria "INSUMO").

// --- Produtos Sanitários (CRUD) ---

export async function getProdutosSanitarios() {
  try {
    return await prisma.itemEstoque.findMany({
      where: { categoria: "SANITARIO" },
      orderBy: { nome: "asc" }
    })
  } catch (error) {
    console.error("Erro ao buscar produtos sanitários:", error)
    throw new Error("Não foi possível carregar os produtos.")
  }
}

export async function getProdutoSanitarioById(id: string) {
  try {
    return await prisma.itemEstoque.findUnique({
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
    const produto = await prisma.itemEstoque.create({
      data: {
        categoria: "SANITARIO",
        nome: data.nome,
        tipo: data.tipo,
        estoque_atual: data.quantidade_estoque,
        unidade_medida: data.unidade_medida,
        indicacao: data.indicacao
      }
    })

    // Registra a movimentação inicial se houver quantidade > 0
    if (data.quantidade_estoque > 0) {
      await prisma.movimentacaoEstoque.create({
        data: {
          item_id: produto.id,
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
    const produto = await prisma.itemEstoque.update({
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
    await prisma.itemEstoque.delete({
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
    return await prisma.movimentacaoEstoque.findMany({
      where: { item_id: produtoId },
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
    if (!data.produto_id) {
      return { success: false, error: "Produto é obrigatório." }
    }
    if (!Number.isFinite(data.quantidade) || (data.tipo_transacao !== "AJUSTE" && data.quantidade <= 0)) {
      return { success: false, error: "Quantidade inválida." }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Trava a linha do item para evitar leitura-e-escrita concorrente
      // (duas movimentações simultâneas não podem calcular o novo saldo a partir
      // do mesmo valor "antigo").
      // Observação: estoque_atual é numeric(12,3) no Postgres, e o driver
      // pg devolve colunas numeric como string (para não perder precisão) —
      // diferente do restante do app, essa consulta não passa pela extensão do
      // Prisma Client que converte Decimal -> number, então convertemos aqui.
      const [item] = await tx.$queryRaw<{ estoque_atual: string }[]>`
        SELECT estoque_atual FROM itens_estoque WHERE id = ${data.produto_id} FOR UPDATE
      `

      if (!item) throw new Error("Produto não encontrado")

      let novoEstoque = Number(item.estoque_atual)
      if (data.tipo_transacao === "ENTRADA") {
        novoEstoque += data.quantidade
      } else if (data.tipo_transacao === "SAIDA") {
        novoEstoque -= data.quantidade
      } else if (data.tipo_transacao === "AJUSTE") {
        novoEstoque = data.quantidade // Para ajuste, a quantidade enviada pode ser o novo total
      }

      if (novoEstoque < 0) {
        throw new Error("Estoque insuficiente para essa saída.")
      }

      // Cria a movimentação
      const mov = await tx.movimentacaoEstoque.create({
        data: {
          item_id: data.produto_id,
          tipo_transacao: data.tipo_transacao,
          quantidade: data.quantidade,
          observacoes: data.observacoes
        }
      })

      await tx.itemEstoque.update({
        where: { id: data.produto_id },
        data: { estoque_atual: novoEstoque }
      })

      return mov
    })

    revalidatePath("/sanitario/estoque")
    return { success: true, data: result }
  } catch (error) {
    console.error("Erro ao registrar movimentação:", error)
    const message = error instanceof Error && error.message === "Estoque insuficiente para essa saída."
      ? error.message
      : "Falha ao registrar movimentação."
    return { success: false, error: message }
  }
}
