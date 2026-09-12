import { AppShell } from "@/components/layout/app-shell"
import { AnimalsPageClient } from "./page-client"
import { getAnimais } from "./actions"

export default async function AnimaisPage() {
  const animals = await getAnimais()

  return (
    <AppShell title="Animais">
      <AnimalsPageClient initialAnimals={animals || []} />
    </AppShell>
  )
}
