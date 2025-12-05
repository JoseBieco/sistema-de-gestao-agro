import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Construction } from "lucide-react"

export default function ConfiguracoesPage() {
  return (
    <AppShell title="Configurações">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Construction className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">Em Desenvolvimento</h3>
          <p className="text-sm text-muted-foreground mt-1">Módulo de configurações será implementado em breve</p>
        </CardContent>
      </Card>
    </AppShell>
  )
}
