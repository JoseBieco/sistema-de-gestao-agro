import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ReproductionPageClient } from "@/components/reproduction/reproduction-page-client";
import { Animal } from "@/lib/types/database";

export default async function ReproducaoPage() {
  const supabase = await createClient();

  // Buscar Fêmeas ativas (para o formulário)
  const { data: femeas } = await supabase
    .from("animais")
    .select("id, nome, numero_brinco")
    .eq("genero", "F")
    .eq("status", "ativo")
    .order("nome");

  // Buscar Touros (para o formulário)
  const { data: touros } = await supabase
    .from("animais")
    .select("id, nome, numero_brinco")
    .eq("genero", "M")
    .eq("status", "ativo")
    .order("nome");

  // Buscar Ciclos Ativos
  const { data: ciclos, error } = await supabase
    .from("ciclos_reprodutivos")
    .select(
      `
      *,
      animal:animais!animal_id(id, nome, numero_brinco)
    `
    )
    .eq("ativo", true)
    .order("data_prevista_cio", { ascending: true });

  // Sempre bom logar o erro se houver
  if (error) {
    console.error("Erro ao buscar ciclos:", error);
  }

  return (
    <AppShell title="Controle Reprodutivo">
      <ReproductionPageClient
        ciclos={ciclos || []}
        femeas={(femeas || []) as Animal[]}
        touros={(touros || []) as Animal[]}
      />
    </AppShell>
  );
}
