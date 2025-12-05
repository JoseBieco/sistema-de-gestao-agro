"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimalsTable } from "@/components/animals/animals-table"
import { Plus, Beef, Users } from "lucide-react"
import type { Animal } from "@/lib/types/database"

interface AnimalsPageClientProps {
  initialAnimals: Animal[]
}

export function AnimalsPageClient({ initialAnimals }: AnimalsPageClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [animals, setAnimals] = useState(initialAnimals)
  const [activeTab, setActiveTab] = useState("todos")

  async function refreshAnimals() {
    const { data } = await supabase
      .from("animais")
      .select(`
        *,
        raca:racas(id, nome)
      `)
      .order("created_at", { ascending: false })

    if (data) {
      setAnimals(data)
    }
    router.refresh()
  }

  const filteredAnimals = animals.filter((a) => {
    if (activeTab === "todos") return true
    if (activeTab === "ativos") return a.status === "ativo"
    if (activeTab === "machos") return a.genero === "M" && a.status === "ativo"
    if (activeTab === "femeas") return a.genero === "F" && a.status === "ativo"
    return true
  })

  const stats = {
    total: animals.length,
    ativos: animals.filter((a) => a.status === "ativo").length,
    machos: animals.filter((a) => a.genero === "M" && a.status === "ativo").length,
    femeas: animals.filter((a) => a.genero === "F" && a.status === "ativo").length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Beef className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <Beef className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold">{stats.ativos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Machos</p>
              <p className="text-2xl font-bold">{stats.machos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-pink-500/10 p-3">
              <Users className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fêmeas</p>
              <p className="text-2xl font-bold">{stats.femeas}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rebanho</CardTitle>
          <Link href="/animais/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Animal
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="todos">Todos ({stats.total})</TabsTrigger>
              <TabsTrigger value="ativos">Ativos ({stats.ativos})</TabsTrigger>
              <TabsTrigger value="machos">Machos ({stats.machos})</TabsTrigger>
              <TabsTrigger value="femeas">Fêmeas ({stats.femeas})</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              <AnimalsTable animals={filteredAnimals} onRefresh={refreshAnimals} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
