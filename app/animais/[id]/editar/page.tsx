import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/layout/app-shell"
import { AnimalForm } from "@/components/animals/animal-form"

interface EditarAnimalPageProps {
  params: Promise<{ id: string }>
}

export default async function EditarAnimalPage({ params }: EditarAnimalPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: animal } = await supabase.from("animais").select("*").eq("id", id).single()

  if (!animal) {
    notFound()
  }

  return (
    <AppShell title="Editar Animal">
      <AnimalForm animal={animal} />
    </AppShell>
  )
}
