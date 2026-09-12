"use server"

import { CotacaoService } from "@/src/core/services/CotacaoService";
import { prisma } from "@/lib/prisma";

const cotacaoService = new CotacaoService();

export async function obterCotacoesInteligentes(produto: string, uf: string = "SP") {
  return await cotacaoService.obterCotacaoDoDia(produto, uf);
}

export async function getCotacoesHistoricas(produto?: string) {
  return await prisma.cotacaoHistorica.findMany({
    where: produto ? { produto } : undefined,
    orderBy: { data: "desc" },
    take: 50
  });
}
