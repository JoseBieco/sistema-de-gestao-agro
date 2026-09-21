import { notFound } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { AnimalForm } from "@/components/animals/animal-form"
import { getAnimal } from "../../actions"

interface EditarAnimalPageProps {
  params: Promise<{ id: string }>
}

export default async function EditarAnimalPage({ params }: EditarAnimalPageProps) {
  const { id } = await params
  
  const animal = await getAnimal(id)

  if (!animal) {
    notFound()
  }

  return (
    <AppShell title="Editar Animal">
      <AnimalForm animal={animal} />
    </AppShell>
  )
}
