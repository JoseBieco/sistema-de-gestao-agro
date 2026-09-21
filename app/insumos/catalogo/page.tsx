import { AppShell } from "@/components/layout/app-shell"
import { getInsumos } from "../actions"
import { InsumosCatalogoClient } from "./page-client"

export default async function InsumosCatalogoPage() {
  const insumos = await getInsumos()

  return (
    <AppShell title="Catálogo de Insumos">
      <InsumosCatalogoClient initialData={insumos || []} />
    </AppShell>
  )
}
