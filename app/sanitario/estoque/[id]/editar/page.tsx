import { AppShell } from "@/components/layout/app-shell"
import { getProdutoSanitarioById } from "../../actions"
import { EditarProdutoClient } from "./page-client"
import { notFound } from "next/navigation"

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params
  const produto = await getProdutoSanitarioById(resolvedParams.id)
  
  if (!produto) {
    notFound()
  }

  return (
    <AppShell title="Editar Produto Sanitário">
      <EditarProdutoClient produto={produto} />
    </AppShell>
  )
}
