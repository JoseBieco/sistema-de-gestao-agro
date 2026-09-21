"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function getOcorrencias() {
  try {
    return await prisma.ocorrenciaSanitaria.findMany({
      include: {
        produtos_indicados: {
          include: {
            produto: true,
            dosagens: true
          }
        }
      },
      orderBy: { nome: "asc" }
    })
  } catch (error) {
    console.error("Erro ao buscar ocorrências:", error)
    throw new Error("Não foi possível carregar as ocorrências.")
  }
}

export async function getOcorrenciaById(id: string) {
  try {
    return await prisma.ocorrenciaSanitaria.findUnique({
      where: { id },
      include: {
        produtos_indicados: {
          include: {
            produto: true,
            dosagens: true
          }
        }
      }
    })
  } catch (error) {
    console.error("Erro ao buscar ocorrência:", error)
    throw new Error("Não foi possível carregar a ocorrência.")
  }
}

type DosagemInput = {
  nome_faixa: string
  quantidade: number
}

type ProdutoIndicadoInput = {
  produto_id: string
  observacoes?: string
  dosagens: DosagemInput[]
}

export async function createOcorrencia(data: {
  nome: string
  descricao?: string
  produtos: ProdutoIndicadoInput[]
}) {
  try {
    const ocorrencia = await prisma.ocorrenciaSanitaria.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        produtos_indicados: {
          create: data.produtos.map(p => ({
            item_id: p.produto_id,
            observacoes: p.observacoes,
            dosagens: {
              create: p.dosagens.map(d => ({
                nome_faixa: d.nome_faixa,
                quantidade: d.quantidade
              }))
            }
          }))
        }
      }
    })
    revalidatePath("/sanitario/doencas")
    return { success: true, data: ocorrencia }
  } catch (error) {
    console.error("Erro ao criar ocorrência:", error)
    return { success: false, error: "Falha ao criar ocorrência/doença." }
  }
}

export async function updateOcorrencia(id: string, data: {
  nome: string
  descricao?: string
  produtos: ProdutoIndicadoInput[]
}) {
  try {
    // A abordagem mais segura para updates complexos (nested arrays) 
    // é deletar as relações antigas e recriá-las.
    await prisma.$transaction(async (tx) => {
      // 1. Atualiza dados base da ocorrência
      await tx.ocorrenciaSanitaria.update({
        where: { id },
        data: {
          nome: data.nome,
          descricao: data.descricao
        }
      })

      // 2. Deleta os produtos vinculados antigos (isso vai deletar as dosagens em cascata)
      await tx.ocorrenciaProduto.deleteMany({
        where: { ocorrencia_id: id }
      })

      // 3. Recria os produtos vinculados e suas dosagens
      for (const p of data.produtos) {
        await tx.ocorrenciaProduto.create({
          data: {
            ocorrencia_id: id,
            item_id: p.produto_id,
            observacoes: p.observacoes,
            dosagens: {
              create: p.dosagens.map(d => ({
                nome_faixa: d.nome_faixa,
                quantidade: d.quantidade
              }))
            }
          }
        })
      }
    })

    revalidatePath("/sanitario/doencas")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar ocorrência:", error)
    return { success: false, error: "Falha ao atualizar ocorrência/doença." }
  }
}

export async function deleteOcorrencia(id: string) {
  try {
    await prisma.ocorrenciaSanitaria.delete({
      where: { id }
    })
    revalidatePath("/sanitario/doencas")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir ocorrência:", error)
    return { success: false, error: "Falha ao excluir ocorrência." }
  }
}

// --- Aplicação de Tratamento ---

export async function aplicarTratamento(data: {
  animal_id: string
  ocorrencia_id: string
  observacoes?: string
  produtos: {
    produto_id: string
    quantidade: number // A quantidade que foi efetivamente aplicada baseada na dosagem escolhida
  }[]
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Registra o Tratamento
      const tratamento = await tx.tratamentoAplicado.create({
        data: {
          animal_id: data.animal_id,
          ocorrencia_id: data.ocorrencia_id,
          observacoes: data.observacoes,
          produtos_aplicados: {
            create: data.produtos.map(p => ({
              item_id: p.produto_id,
              quantidade_aplicada: p.quantidade
            }))
          }
        }
      })

      // 2. Para cada produto aplicado, da baixa no estoque
      for (const p of data.produtos) {
        // Registra a saída no histórico
        await tx.movimentacaoEstoque.create({
          data: {
            item_id: p.produto_id,
            tipo_transacao: "SAIDA",
            quantidade: p.quantidade,
            observacoes: `Aplicação de tratamento no animal. Tratamento ID: ${tratamento.id}`
          }
        })

        // Desconta a quantidade atual do produto
        await tx.itemEstoque.update({
          where: { id: p.produto_id },
          data: {
            estoque_atual: {
              decrement: p.quantidade
            }
          }
        })
      }

      return tratamento
    })

    revalidatePath("/sanitario/doencas")
    revalidatePath("/sanitario/estoque")
    return { success: true, data: result }
  } catch (error) {
    console.error("Erro ao aplicar tratamento:", error)
    return { success: false, error: "Falha ao aplicar tratamento e dar baixa no estoque." }
  }
}
