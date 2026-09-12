"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getFazenda() {
  try {
    const fazenda = await prisma.fazenda.findFirst()
    return fazenda
  } catch (error) {
    console.error("Erro ao buscar dados da fazenda:", error)
    return null
  }
}

export async function updateFazenda(data: { nome: string; cnpj?: string; ie?: string; endereco?: string; cidade?: string; estado?: string }) {
  try {
    const existing = await prisma.fazenda.findFirst()
    
    if (existing) {
      await prisma.fazenda.update({
        where: { id: existing.id },
        data
      })
    } else {
      await prisma.fazenda.create({
        data
      })
    }
    
    revalidatePath("/configuracoes")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar dados da fazenda:", error)
    return { success: false, error }
  }
}
