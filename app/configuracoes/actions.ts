"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils/errors"

// A Fazenda é uma configuração única (singleton): só deve existir uma linha.
// Um id fixo + upsert evita a condição de corrida de "buscar, não achou,
// criar" (dois salvamentos simultâneos criando duas fazendas e deixando o
// app escolhendo uma ao acaso, já que findFirst() não tem ordenação).
const FAZENDA_ID = "fazenda_unica"

export async function getFazenda() {
  try {
    const fazenda = await prisma.fazenda.findUnique({ where: { id: FAZENDA_ID } })
    // Fallback para instalações antigas que ainda tenham uma linha criada
    // antes desse id fixo existir.
    return fazenda ?? (await prisma.fazenda.findFirst())
  } catch (error) {
    console.error("Erro ao buscar dados da fazenda:", error)
    return null
  }
}

export async function updateFazenda(data: { nome: string; cnpj?: string; ie?: string; endereco?: string; cidade?: string; estado?: string; desconto_carcaca?: number }) {
  try {
    await prisma.fazenda.upsert({
      where: { id: FAZENDA_ID },
      update: data,
      create: { id: FAZENDA_ID, ...data },
    })

    revalidatePath("/configuracoes")
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
