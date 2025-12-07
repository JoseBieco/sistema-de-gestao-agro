import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, calcularIdade, getStatusColor } from "@/lib/utils/format";
import { Edit, ArrowLeft, Beef, Syringe, Dna } from "lucide-react";
import { WeightHistory } from "@/components/animals/weight-history";
import { GenealogyTree } from "@/components/animals/genealogy-tree"; // Importar novo componente

interface AnimalPageProps {
  params: Promise<{ id: string }>;
}

export default async function AnimalPage({ params }: AnimalPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Busca os detalhes do animal usando a VIEW (estrutura plana)
  const { data: animalBase, error } = await supabase
    .from("animais_detalhes")
    .select("*")
    .eq("id", id)
    .single();

  if (!animalBase) {
    notFound();
  }

  // Busca histórico de peso
  const { data: historicoPesagem } = await supabase
    .from("historico_pesagem")
    .select("*")
    .eq("animal_id", id)
    .order("data_pesagem", { ascending: false });

  // Busca Avós (Genealogia Profunda)
  // Como a View já nos dá os IDs de pai e mãe, usamos eles para buscar os avós
  let avos: {
    maternos: {
      mae: {
        id: any;
        numero_brinco: any;
        nome: any;
      } | null;
      pai: {
        id: any;
        numero_brinco: any;
        nome: any;
      } | null;
    };
    paternos: {
      mae: {
        id: any;
        numero_brinco: any;
        nome: any;
      } | null;
      pai: {
        id: any;
        numero_brinco: any;
        nome: any;
      } | null;
    };
  } = {
    maternos: { mae: null, pai: null },
    paternos: { mae: null, pai: null },
  };

  const promises = [];

  // Buscar avós maternos (se tiver mãe)
  if (animalBase.mae_id) {
    promises.push(
      supabase
        .from("animais")
        .select("id, numero_brinco, nome, mae_id, pai_id") // Precisamos dos IDs dos avós
        .eq("id", animalBase.mae_id)
        .single()
        .then(async ({ data: mae }) => {
          if (mae) {
            // Buscar detalhes dos avós maternos
            if (mae.mae_id) {
              const { data: avoMae } = await supabase
                .from("animais")
                .select("id, numero_brinco, nome")
                .eq("id", mae.mae_id)
                .single();
              avos.maternos.mae = avoMae;
            }
            if (mae.pai_id) {
              const { data: avoPai } = await supabase
                .from("animais")
                .select("id, numero_brinco, nome")
                .eq("id", mae.pai_id)
                .single();
              avos.maternos.pai = avoPai;
            }
          }
        })
    );
  }

  // Buscar avós paternos (se tiver pai)
  if (animalBase.pai_id) {
    promises.push(
      supabase
        .from("animais")
        .select("id, numero_brinco, nome, mae_id, pai_id")
        .eq("id", animalBase.pai_id)
        .single()
        .then(async ({ data: pai }) => {
          if (pai) {
            if (pai.mae_id) {
              const { data: avoMae } = await supabase
                .from("animais")
                .select("id, numero_brinco, nome")
                .eq("id", pai.mae_id)
                .single();
              avos.paternos.mae = avoMae;
            }
            if (pai.pai_id) {
              const { data: avoPai } = await supabase
                .from("animais")
                .select("id, numero_brinco, nome")
                .eq("id", pai.pai_id)
                .single();
              avos.paternos.pai = avoPai;
            }
          }
        })
    );
  }

  await Promise.all(promises);

  // 4. Busca histórico de vacinas
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
                {animalBase.numero_brinco || animalBase.nome || "Animal"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(animalBase.status)}>
                  {animalBase.status.charAt(0).toUpperCase() +
                    animalBase.status.slice(1)}
                </Badge>
                <Badge
                  variant={animalBase.genero === "M" ? "default" : "secondary"}
                >
                  {animalBase.genero === "M" ? "Macho" : "Fêmea"}
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
                    {animalBase.numero_brinco || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Nome</dt>
                  <dd className="text-sm font-medium">
                    {animalBase.nome || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Raça</dt>
                  <dd className="text-sm font-medium">
                    {animalBase.raca_nome || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Origem</dt>
                  <dd className="text-sm font-medium capitalize">
                    {animalBase.origem}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Data de Nascimento
                  </dt>
                  <dd className="text-sm font-medium">
                    {animalBase.data_nascimento
                      ? formatDate(animalBase.data_nascimento)
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Idade</dt>
                  <dd className="text-sm font-medium">
                    {animalBase.data_nascimento
                      ? calcularIdade(animalBase.data_nascimento)
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Peso ao Nascer
                  </dt>
                  <dd className="text-sm font-medium">
                    {animalBase.peso_nascimento
                      ? `${animalBase.peso_nascimento} kg`
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Peso Atual</dt>
                  <dd className="text-sm font-medium">
                    {animalBase.peso_atual
                      ? `${animalBase.peso_atual} kg`
                      : "-"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
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
                  {animalBase.mae_id ? (
                    <span className="text-sm font-medium">
                      {animalBase.mae_brinco ||
                        animalBase.mae_nome ||
                        "Sem identificação"}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Não informada
                    </span>
                  )}
                </div>

                {animalBase.mae_id && (
                  <Link href={`/animais/${animalBase.mae_id}`}>
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
                  {animalBase.pai_id ? (
                    <span className="text-sm font-medium">
                      {animalBase.pai_brinco ||
                        animalBase.pai_nome ||
                        "Sem identificação"}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Não informado
                    </span>
                  )}
                </div>

                {animalBase.pai_id && (
                  <Link href={`/animais/${animalBase.pai_id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Acessar detalhes
                    </Button>
                  </Link>
                )}
              </div>

              {/* BRUCELOSE (Apenas Fêmeas) */}
              {animalBase.genero === "F" && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Brucelose
                      </p>
                      <Badge
                        variant={
                          animalBase.vacina_brucelose ? "default" : "secondary"
                        }
                      >
                        {animalBase.vacina_brucelose
                          ? "Vacinada"
                          : "Não vacinada"}
                      </Badge>
                    </div>
                    {animalBase.data_brucelose && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Data da vacina
                        </p>
                        <p className="text-sm font-medium">
                          {formatDate(animalBase.data_brucelose)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Genealogia Visual */}
          <div className="lg:col-span-3">
            {/* // @ts-expect-error Ajustar as tipagens depois */}
            <GenealogyTree animal={animalBase} avos={avos} />
          </div>

          {/* Histórico de Peso */}
          <div className="lg:col-span-3">
            <WeightHistory
              animalId={animalBase.id}
              history={historicoPesagem || []}
              currentWeight={animalBase.peso_atual}
            />
          </div>

          {/* Vaccine History */}
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
