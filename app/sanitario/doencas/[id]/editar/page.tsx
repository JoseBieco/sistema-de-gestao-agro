import { AppShell } from "@/components/layout/app-shell"
import { getOcorrenciaById } from "../../actions"
import { getProdutosSanitarios } from "../../../estoque/actions"
import { EditarDoencaClient } from "./page-client"
import { notFound } from "next/navigation"

export default async function EditarDoencaPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params
  const [ocorrencia, produtos] = await Promise.all([
    getOcorrenciaById(resolvedParams.id),
    getProdutosSanitarios()
  ])
  
  if (!ocorrencia) notFound()

  return (
    <AppShell title="Editar Protocolo Sanitário">
      <EditarDoencaClient ocorrencia={ocorrencia} produtos={produtos} />
    </AppShell>
  )
}
