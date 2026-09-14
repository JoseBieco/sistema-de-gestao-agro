import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, ShoppingCart, Truck, History } from "lucide-react"

export default async function InsumosDashboardPage() {
  return (
    <AppShell title="Módulo de Nutrição e Insumos">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catálogo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Gerencie os insumos e unidades base.</p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/insumos/catalogo">Acessar Catálogo</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Pedidos, fretes e financeiro.</p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/insumos/compras">Acessar Compras</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebimentos</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Entradas parciais, lotes e validade.</p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/insumos/recebimento">Acessar Romaneios</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kardex</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Rastreabilidade e auditoria de estoque.</p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/insumos/kardex">Acessar Kardex</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Entregas Atrasadas</CardTitle>
            <CardDescription>Pedidos que já passaram da data prevista de entrega.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <Truck className="h-8 w-8 mb-2 opacity-20" />
              <p>Nenhuma entrega atrasada no momento.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-600">Lotes Próximos ao Vencimento</CardTitle>
            <CardDescription>Insumos que vencem nos próximos 30 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <Package className="h-8 w-8 mb-2 opacity-20" />
              <p>Nenhum lote vencendo em breve.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
