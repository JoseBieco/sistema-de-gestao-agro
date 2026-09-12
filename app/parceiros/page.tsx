import { AppShell } from "@/components/layout/app-shell";
import { ParceirosPageClient } from "./page-client";
import { getParceiros } from "./actions";

export default async function ParceirosPage() {
  const parceiros = await getParceiros();

  return (
    <AppShell title="Parceiros">
      <ParceirosPageClient initialParceiros={parceiros || []} />
    </AppShell>
  );
}
