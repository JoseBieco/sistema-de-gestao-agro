import { AppShell } from "@/components/layout/app-shell"
import { AnimalForm } from "@/components/animals/animal-form"

export default function NovoAnimalPage() {
  return (
    <AppShell title="Novo Animal">
      <AnimalForm />
    </AppShell>
  )
}
