import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ManagementClient } from "@/components/management/management-client";
import { Animal } from "@/lib/types/database";

export default async function ManejoPage() {
  const supabase = await createClient();

  const [locaisRes, animaisRes] = await Promise.all([
    supabase.from("locais").select("*").order("nome"),
    supabase
      .from("animais")
      .select("id, numero_brinco, nome, local_id")
      .eq("status", "ativo"),
  ]);

  return (
    <AppShell title="Manejo de Pastagens">
      <ManagementClient
        locais={locaisRes.data || []}
        animais={(animaisRes.data || []) as Animal[]}
      />
    </AppShell>
  );
}
