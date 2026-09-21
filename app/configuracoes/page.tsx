import { AppShell } from "@/components/layout/app-shell";
import { ConfiguracoesClient } from "@/components/settings/configuracoes-client";
import { getRacas } from "@/app/racas/actions";
import { getTiposVacina } from "@/app/vacinas/actions";
import { getAnimais } from "@/app/animais/actions";
import { getFazenda } from "./actions";

export default async function ConfiguracoesPage() {
  const racas = await getRacas();
  const tiposVacina = await getTiposVacina();
  const animais = await getAnimais();
  const totalAnimais = animais.length;
  const fazenda = await getFazenda();

  return (
    <AppShell title="Configurações">
      <ConfiguracoesClient
        initialRacas={racas || []}
        initialTiposVacina={tiposVacina || []}
        totalAnimais={totalAnimais || 0}
        initialFazenda={fazenda}
      />
    </AppShell>
  );
}
