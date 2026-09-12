import { AppShell } from "@/components/layout/app-shell";
import { ManagementClient } from "@/components/management/management-client";
import { Animal } from "@/lib/types/database";
import { getLocais } from "../locais/actions";
import { getAnimais } from "../animais/actions";

export default async function ManejoPage() {
  const [locaisRes, animaisRes] = await Promise.all([
    getLocais(),
    getAnimais()
  ]);

  const activeAnimais = animaisRes ? animaisRes.filter((a: any) => a.status === "ativo") : [];

  return (
    <AppShell title="Manejo de Pastagens">
      <ManagementClient
        locais={locaisRes || []}
        animais={activeAnimais as any[]}
      />
    </AppShell>
  );
}
