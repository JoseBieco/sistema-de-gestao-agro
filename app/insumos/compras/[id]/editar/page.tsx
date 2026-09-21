import { AppShell } from "@/components/layout/app-shell"
import { getCompra, getInsumos } from "../../../actions"
import { InsumoCompraEditClient } from "./page-client"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"

export default async function EditarPedidoCompraPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  
  const compra = await getCompra(id)
  
  if (!compra) return notFound()
  
  if (compra.romaneios && compra.romaneios.length > 0) {
    // Bloquear edição se já tem recebimentos
    redirect(`/insumos/compras/${id}`)
  }

  const insumos = await getInsumos()
  const fornecedores = await prisma.parceiro.findMany({
    where: { tipo: "fornecedor_insumo" },
    orderBy: { nome: "asc" }
  })

  return (
    <AppShell title={`Editar Pedido #${id.slice(0,8)}`}>
      <InsumoCompraEditClient 
        initialData={compra} 
        insumos={insumos || []} 
        fornecedores={fornecedores || []} 
      />
    </AppShell>
  )
}
