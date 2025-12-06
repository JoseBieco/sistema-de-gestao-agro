import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, calcularIdade, getStatusColor } from "@/lib/utils/format";
import { Edit, ArrowLeft, Beef, Dna, Syringe } from "lucide-react";
import { WeightHistory } from "@/components/animals/weight-history";

interface AnimalPageProps {
  params: Promise<{ id: string }>;
}

export default async function AnimalPage({ params }: AnimalPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Busca os detalhes do animal usando a VIEW
  const { data: animal, error } = await supabase
    .from("animais_detalhes") // Usando a View criada
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar animal:", error);
  }

  if (!animal) {
    notFound();
  }

  // Busca histórico de peso (separado, pois a View não traz lista aninhada)
  const { data: historicoPesagem } = await supabase
    .from("historico_pesagem")
    .select("*")
    .eq("animal_id", id)
    .order("data_pesagem", { ascending: false });

  // Busca histórico de vacinas
  const { data: vacinas } = await supabase
    .from("agenda_vacinas")
    .select(
      `
      *,
      tipo_vacina:tipos_vacina(id, nome)
    `
    )
    .eq("animal_id", id)
    .order("data_prevista", { ascending: false })
    .limit(5);

  return (
    <AppShell title="Detalhes do Animal">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/animais">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">
                {animal.numero_brinco || animal.nome || "Animal"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(animal.status)}>
                  {animal.status.charAt(0).toUpperCase() +
                    animal.status.slice(1)}
                </Badge>
                <Badge
                  variant={animal.genero === "M" ? "default" : "secondary"}
                >
                  {animal.genero === "M" ? "Macho" : "Fêmea"}
                </Badge>
              </div>
            </div>
          </div>
          <Link href={`/animais/${id}/editar`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Beef className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Brinco</dt>
                  <dd className="text-sm font-medium">
                    {animal.numero_brinco || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Nome</dt>
                  <dd className="text-sm font-medium">{animal.nome || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Raça</dt>
                  {/* Atualizado para usar o campo da View: raca_nome */}
                  <dd className="text-sm font-medium">
                    {animal.raca_nome || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Origem</dt>
                  <dd className="text-sm font-medium capitalize">
                    {animal.origem}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Data de Nascimento
                  </dt>
                  <dd className="text-sm font-medium">
                    {animal.data_nascimento
                      ? formatDate(animal.data_nascimento)
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Idade</dt>
                  <dd className="text-sm font-medium">
                    {animal.data_nascimento
                      ? calcularIdade(animal.data_nascimento)
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Peso ao Nascer
                  </dt>
                  <dd className="text-sm font-medium">
                    {animal.peso_nascimento
                      ? `${animal.peso_nascimento} kg`
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Peso Atual</dt>
                  <dd className="text-sm font-medium">
                    {animal.peso_atual ? `${animal.peso_atual} kg` : "-"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Genealogia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Dna className="h-5 w-5" />
                Genealogia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* MÃE */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Mãe</p>
                  {animal.mae_id ? (
                    <span className="text-sm font-medium">
                      {animal.mae_brinco ||
                        animal.mae_nome ||
                        "Sem identificação"}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Não informada
                    </span>
                  )}
                </div>

                {animal.mae_id && (
                  <Link href={`/animais/${animal.mae_id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Acessar detalhes
                    </Button>
                  </Link>
                )}
              </div>

              {/* PAI */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pai</p>
                  {animal.pai_id ? (
                    <span className="text-sm font-medium">
                      {animal.pai_brinco ||
                        animal.pai_nome ||
                        "Sem identificação"}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Não informado
                    </span>
                  )}
                </div>

                {animal.pai_id && (
                  <Link href={`/animais/${animal.pai_id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Acessar detalhes
                    </Button>
                  </Link>
                )}
              </div>

              {/* BRUCELOSE (Apenas Fêmeas) */}
              {animal.genero === "F" && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Brucelose
                      </p>
                      <Badge
                        variant={
                          animal.vacina_brucelose ? "default" : "secondary"
                        }
                      >
                        {animal.vacina_brucelose ? "Vacinada" : "Não vacinada"}
                      </Badge>
                    </div>
                    {animal.data_brucelose && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Data da vacina
                        </p>
                        <p className="text-sm font-medium">
                          {formatDate(animal.data_brucelose)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Peso */}
          <div className="lg:col-span-3">
            <WeightHistory
              animalId={animal.id}
              history={historicoPesagem || []}
              currentWeight={animal.peso_atual}
            />
          </div>

          {/* Histórico de Vacinas */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Syringe className="h-5 w-5" />
                Histórico de Vacinas
              </CardTitle>
              <Link href={`/vacinas?animal=${id}`}>
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {vacinas && vacinas.length > 0 ? (
                <div className="space-y-2">
                  {vacinas.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {v.tipo_vacina?.nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Prevista: {formatDate(v.data_prevista)}
                          {v.data_aplicacao &&
                            ` | Aplicada: ${formatDate(v.data_aplicacao)}`}
                        </p>
                      </div>
                      <Badge className={getStatusColor(v.status)}>
                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma vacina registrada
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
