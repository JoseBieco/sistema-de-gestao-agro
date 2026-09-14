import { AppShell } from "@/components/layout/app-shell"
import { prisma } from "@/lib/prisma"
import { getOcorrencias } from "../actions"
import { AplicarTratamentoClient } from "./page-client"

export default async function AplicarTratamentoPage() {
  const [animais, ocorrencias] = await Promise.all([
    prisma.animal.findMany({ select: { id: true, brinco: true, nome: true }, orderBy: { brinco: "asc" } }),
    getOcorrencias()
  ])

  return (
    <AppShell title="Aplicar Tratamento">
      <AplicarTratamentoClient animais={animais} ocorrencias={ocorrencias} />
    </AppShell>
  )
}
