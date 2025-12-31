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
import {
  FamilyMember,
  GenealogyTree,
} from "@/components/animals/genealogy-tree"; // Importar novo componente

interface AnimalPageProps {
  params: Promise<{ id: string }>;
}

export default async function AnimalPage({ params }: AnimalPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Busca os detalhes do animal
  const { data: animalData, error } = await supabase
    .from("animais")
    .select(
      `
      *,
      mae:mae_id ( id, numero_brinco, nome ),
      pai:pai_id ( id, numero_brinco, nome ),
      filhos_como_mae:animais!mae_id ( id, numero_brinco, nome ),
      filhos_como_pai:animais!pai_id ( id, numero_brinco, nome )
    `
    )
    .eq("id", id)
    .single();

  if (error || !animalData) {
    console.error("Erro ao buscar animal:", error);
    notFound();
  }

  // Busca histórico de peso
  const { data: historicoPesagem } = await supabase
    .from("historico_pesagem")
    .select("*")
    .eq("animal_id", id)
    .order("data_pesagem", { ascending: false });

  // @@@@@@@@@@ Os avós será modificado futuramente
  // Busca Avós (Genealogia Profunda)
  // Como a View já nos dá os IDs de pai e mãe, usamos eles para buscar os avós
  // let avos: {
  //   maternos: {
  //     mae: {
  //       id: any;
  //       numero_brinco: any;
  //       nome: any;
  //     } | null;
  //     pai: {
  //       id: any;
  //       numero_brinco: any;
  //       nome: any;
  //     } | null;
  //   };
  //   paternos: {
  //     mae: {
  //       id: any;
  //       numero_brinco: any;
  //       nome: any;
  //     } | null;
  //     pai: {
  //       id: any;
  //       numero_brinco: any;
  //       nome: any;
  //     } | null;
  //   };
  // } = {
  //   maternos: { mae: null, pai: null },
  //   paternos: { mae: null, pai: null },
  // };

  // const promises = [];

  // // Buscar avós maternos (se tiver mãe)
  // if (animalBase.mae_id) {
  //   promises.push(
  //     supabase
  //       .from("animais")
  //       .select("id, numero_brinco, nome, mae_id, pai_id") // Precisamos dos IDs dos avós
  //       .eq("id", animalBase.mae_id)
  //       .single()
  //       .then(async ({ data: mae }) => {
  //         if (mae) {
  //           // Buscar detalhes dos avós maternos
  //           if (mae.mae_id) {
  //             const { data: avoMae } = await supabase
  //               .from("animais")
  //               .select("id, numero_brinco, nome")
  //               .eq("id", mae.mae_id)
  //               .single();
  //             avos.maternos.mae = avoMae;
  //           }
  //           if (mae.pai_id) {
  //             const { data: avoPai } = await supabase
  //               .from("animais")
  //               .select("id, numero_brinco, nome")
  //               .eq("id", mae.pai_id)
  //               .single();
  //             avos.maternos.pai = avoPai;
  //           }
  //         }
  //       })
  //   );
  // }

  // // Buscar avós paternos (se tiver pai)
  // if (animalBase.pai_id) {
  //   promises.push(
  //     supabase
  //       .from("animais")
  //       .select("id, numero_brinco, nome, mae_id, pai_id")
  //       .eq("id", animalBase.pai_id)
  //       .single()
  //       .then(async ({ data: pai }) => {
  //         if (pai) {
  //           if (pai.mae_id) {
  //             const { data: avoMae } = await supabase
  //               .from("animais")
  //               .select("id, numero_brinco, nome")
  //               .eq("id", pai.mae_id)
  //               .single();
  //             avos.paternos.mae = avoMae;
  //           }
  //           if (pai.pai_id) {
  //             const { data: avoPai } = await supabase
  //               .from("animais")
  //               .select("id, numero_brinco, nome")
  //               .eq("id", pai.pai_id)
  //               .single();
  //             avos.paternos.pai = avoPai;
  //           }
  //         }
  //       })
  //   );
  // }

  // await Promise.all(promises);

  // Tratamento de dados para a Árvore
  // Une os arrays de filhos (geralmente um deles estará vazio dependendo do sexo, mas isso cobre ambos os casos)
  const rawFilhos = [
    ...(animalData.filhos_como_mae || []),
    ...(animalData.filhos_como_pai || []),
  ];

  // Ordena filhos por brinco ou nome para ficar organizado
  const filhos: FamilyMember[] = rawFilhos
    .map((f: any) => ({
      id: f.id,
      numero_brinco: f.numero_brinco,
      nome: f.nome,
    }))
    .sort((a, b) => a.numero_brinco.localeCompare(b.numero_brinco));

  // Prepara objetos tipados para o componente
  const animalPrincipal: FamilyMember = {
    id: animalData.id,
    numero_brinco: animalData.numero_brinco,
    nome: animalData.nome,
    genero: animalData.genero,
  };

  const pai: FamilyMember | null = animalData.pai
    ? {
        id: animalData.pai.id,
        numero_brinco: animalData.pai.numero_brinco,
        nome: animalData.pai.nome,
      }
    : null;

  const mae: FamilyMember | null = animalData.mae
    ? {
        id: animalData.mae.id,
        numero_brinco: animalData.mae.numero_brinco,
        nome: animalData.mae.nome,
      }
    : null;

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
                {animalData.numero_brinco || animalData.nome || "Animal"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(animalData.status)}>
                  {animalData.status.charAt(0).toUpperCase() +
                    animalData.status.slice(1)}
                </Badge>
                <Badge
                  variant={animalData.genero === "M" ? "default" : "secondary"}
                >
                  {animalData.genero === "M" ? "Macho" : "Fêmea"}
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
                    {animalData.numero_brinco || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Nome</dt>
                  <dd className="text-sm font-medium">
                    {animalData.nome || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Raça</dt>
                  <dd className="text-sm font-medium">
                    {animalData.raca_nome || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Origem</dt>
                  <dd className="text-sm font-medium capitalize">
                    {animalData.origem}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Data de Nascimento
                  </dt>
                  <dd className="text-sm font-medium">
                    {animalData.data_nascimento
                      ? formatDate(animalData.data_nascimento)
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Idade</dt>
                  <dd className="text-sm font-medium">
                    {animalData.data_nascimento
                      ? calcularIdade(animalData.data_nascimento)
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Peso ao Nascer
                  </dt>
                  <dd className="text-sm font-medium">
                    {animalData.peso_nascimento
                      ? `${animalData.peso_nascimento} kg`
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Peso Atual</dt>
                  <dd className="text-sm font-medium">
                    {animalData.peso_atual
                      ? `${animalData.peso_atual} kg`
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
                  {animalData.mae_id ? (
                    <span className="text-sm font-medium">
                      {animalData.mae_brinco ||
                        animalData.mae_nome ||
                        "Sem identificação"}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Não informada
                    </span>
                  )}
                </div>

                {animalData.mae_id && (
                  <Link href={`/animais/${animalData.mae_id}`}>
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
                  {animalData.pai_id ? (
                    <span className="text-sm font-medium">
                      {animalData.pai_brinco ||
                        animalData.pai_nome ||
                        "Sem identificação"}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Não informado
                    </span>
                  )}
                </div>

                {animalData.pai_id && (
                  <Link href={`/animais/${animalData.pai_id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Acessar detalhes
                    </Button>
                  </Link>
                )}
              </div>

              {/* BRUCELOSE (Apenas Fêmeas) */}
              {animalData.genero === "F" && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Brucelose
                      </p>
                      <Badge
                        variant={
                          animalData.vacina_brucelose ? "default" : "secondary"
                        }
                      >
                        {animalData.vacina_brucelose
                          ? "Vacinada"
                          : "Não vacinada"}
                      </Badge>
                    </div>
                    {animalData.data_brucelose && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Data da vacina
                        </p>
                        <p className="text-sm font-medium">
                          {formatDate(animalData.data_brucelose)}
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
            <GenealogyTree
              animal={animalPrincipal}
              pai={pai}
              mae={mae}
              filhos={filhos}
            />
          </div>

          {/* Histórico de Peso */}
          <div className="lg:col-span-3">
            <WeightHistory
              animalId={animalData.id}
              history={historicoPesagem || []}
              currentWeight={animalData.peso_atual}
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
