import { AppShell } from "@/components/layout/app-shell";
import { ReproductionPageClient } from "@/components/reproduction/reproduction-page-client";
import { getCiclos } from "./actions";
import { getAnimais } from "@/app/animais/actions";

export default async function ReproducaoPage() {
  const animais = await getAnimais();
  const femeas = animais.filter((a) => a.sexo === "F" && a.status === "ATIVO");
  const touros = animais.filter((a) => a.sexo === "M" && a.status === "ATIVO");

  const ciclos = await getCiclos();

  return (
    <AppShell title="Controle Reprodutivo">
      <ReproductionPageClient
        ciclos={ciclos || []}
        femeas={femeas as any[]}
        touros={touros as any[]}
      />
    </AppShell>
  );
}
