import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ConfiguracoesClient } from "@/components/settings/configuracoes-client";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();

  const [{ data: racas }, { data: tiposVacina }, { count: totalAnimais }] =
    await Promise.all([
      supabase.from("racas").select("*").order("nome"),
      supabase.from("tipos_vacina").select("*").order("nome"),
      supabase.from("animais").select("*", { count: "exact", head: true }),
    ]);

  return (
    <AppShell title="Configurações">
      <ConfiguracoesClient
        initialRacas={racas || []}
        initialTiposVacina={tiposVacina || []}
        totalAnimais={totalAnimais || 0}
      />
    </AppShell>
  );
}
