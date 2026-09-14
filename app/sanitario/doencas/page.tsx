import { AppShell } from "@/components/layout/app-shell"
import { DoencasPageClient } from "./page-client"
import { getOcorrencias } from "./actions"

export default async function LivroDoencasPage() {
  const ocorrencias = await getOcorrencias()

  return (
    <AppShell title="Livro de Doenças (Protocolos)">
      <DoencasPageClient initialOcorrencias={ocorrencias} />
    </AppShell>
  )
}
