"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import {
  Settings,
  Palette,
  Database,
  Syringe,
  Tag,
  Plus,
  Edit,
  Trash2,
  Building2,
  Save,
  AlertTriangle,
} from "lucide-react";
import type { Raca, TipoVacina } from "@/lib/types/database";

interface ConfiguracoesClientProps {
  initialRacas: Raca[];
  initialTiposVacina: TipoVacina[];
  totalAnimais: number;
}

export function ConfiguracoesClient({
  initialRacas,
  initialTiposVacina,
  totalAnimais,
}: ConfiguracoesClientProps) {
  const [racas, setRacas] = useState(initialRacas);
  const [tiposVacina, setTiposVacina] = useState(initialTiposVacina);
  const [editingRaca, setEditingRaca] = useState<Raca | null>(null);
  const [editingVacina, setEditingVacina] = useState<TipoVacina | null>(null);
  const [racaDialogOpen, setRacaDialogOpen] = useState(false);
  const [vacinaDialogOpen, setVacinaDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Configurações gerais
  const [configFazenda, setConfigFazenda] = useState({
    nome: "Fazenda Exemplo",
    ie: "",
    endereco: "",
    cidade: "",
    estado: "SP",
  });

  async function handleSaveRaca(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get("nome") as string,
      descricao: (formData.get("descricao") as string) || null,
    };

    const supabase = createClient();

    if (editingRaca) {
      const { error } = await supabase
        .from("racas")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", editingRaca.id);

      if (!error) {
        setRacas((prev) =>
          prev.map((r) => (r.id === editingRaca.id ? { ...r, ...data } : r))
        );
      }
    } else {
      const { data: newRaca, error } = await supabase
        .from("racas")
        .insert(data)
        .select()
        .single();

      if (!error && newRaca) {
        setRacas((prev) => [...prev, newRaca]);
      }
    }

    setLoading(false);
    setRacaDialogOpen(false);
    setEditingRaca(null);
  }

  async function handleSaveVacina(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get("nome") as string,
      descricao: (formData.get("descricao") as string) || null,
      doses_por_ano:
        Number.parseInt(formData.get("doses_por_ano") as string) || 1,
      dias_entre_doses:
        Number.parseInt(formData.get("dias_entre_doses") as string) || 365,
      obrigatoria: formData.get("obrigatoria") === "on",
      apenas_femeas: formData.get("apenas_femeas") === "on",
    };

    const supabase = createClient();

    if (editingVacina) {
      const { error } = await supabase
        .from("tipos_vacina")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", editingVacina.id);

      if (!error) {
        setTiposVacina((prev) =>
          prev.map((v) => (v.id === editingVacina.id ? { ...v, ...data } : v))
        );
      }
    } else {
      const { data: newVacina, error } = await supabase
        .from("tipos_vacina")
        .insert(data)
        .select()
        .single();

      if (!error && newVacina) {
        setTiposVacina((prev) => [...prev, newVacina]);
      }
    }

    setLoading(false);
    setVacinaDialogOpen(false);
    setEditingVacina(null);
  }

  async function handleDeleteRaca(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta raça?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("racas").delete().eq("id", id);

    if (!error) {
      setRacas((prev) => prev.filter((r) => r.id !== id));
    }
  }

  async function handleDeleteVacina(id: string) {
    if (!confirm("Tem certeza que deseja excluir este tipo de vacina?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("tipos_vacina").delete().eq("id", id);

    if (!error) {
      setTiposVacina((prev) => prev.filter((v) => v.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="geral" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Fazenda</span>
          </TabsTrigger>
          <TabsTrigger value="racas" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Raças</span>
          </TabsTrigger>
          <TabsTrigger value="vacinas" className="flex items-center gap-2">
            <Syringe className="h-4 w-4" />
            <span className="hidden sm:inline">Vacinas</span>
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba Fazenda */}
        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados da Propriedade
              </CardTitle>
              <CardDescription>
                Informações básicas que aparecerão em relatórios e documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome_fazenda">Nome da Fazenda</Label>
                    <Input
                      id="nome_fazenda"
                      value={configFazenda.nome}
                      onChange={(e) =>
                        setConfigFazenda((prev) => ({
                          ...prev,
                          nome: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ie">Inscrição Estadual</Label>
                    <Input
                      id="ie"
                      value={configFazenda.ie}
                      onChange={(e) =>
                        setConfigFazenda((prev) => ({
                          ...prev,
                          ie: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={configFazenda.endereco}
                    onChange={(e) =>
                      setConfigFazenda((prev) => ({
                        ...prev,
                        endereco: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={configFazenda.cidade}
                      onChange={(e) =>
                        setConfigFazenda((prev) => ({
                          ...prev,
                          cidade: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <select
                      id="estado"
                      value={configFazenda.estado}
                      onChange={(e) =>
                        setConfigFazenda((prev) => ({
                          ...prev,
                          estado: e.target.value,
                        }))
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {[
                        "AC",
                        "AL",
                        "AP",
                        "AM",
                        "BA",
                        "CE",
                        "DF",
                        "ES",
                        "GO",
                        "MA",
                        "MT",
                        "MS",
                        "MG",
                        "PA",
                        "PB",
                        "PR",
                        "PE",
                        "PI",
                        "RJ",
                        "RN",
                        "RS",
                        "RO",
                        "RR",
                        "SC",
                        "SP",
                        "SE",
                        "TO",
                      ].map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button type="button">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Raças */}
        <TabsContent value="racas" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Raças Cadastradas
                </CardTitle>
                <CardDescription>
                  Gerencie as raças disponíveis para cadastro de animais
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingRaca(null);
                  setRacaDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Raça
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {racas.map((raca) => (
                    <TableRow key={raca.id}>
                      <TableCell className="font-medium">{raca.nome}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {raca.descricao || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingRaca(raca);
                              setRacaDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRaca(raca.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Vacinas */}
        <TabsContent value="vacinas" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Syringe className="h-5 w-5" />
                  Tipos de Vacina
                </CardTitle>
                <CardDescription>
                  Configure as vacinas e seus intervalos de aplicação
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingVacina(null);
                  setVacinaDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Vacina
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Doses/Ano</TableHead>
                    <TableHead>Intervalo</TableHead>
                    <TableHead>Atributos</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiposVacina.map((vacina) => (
                    <TableRow key={vacina.id}>
                      <TableCell className="font-medium">
                        {vacina.nome}
                      </TableCell>
                      <TableCell>{vacina.doses_por_ano}x</TableCell>
                      <TableCell>{vacina.dias_entre_doses} dias</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {vacina.obrigatoria && (
                            <Badge variant="default" className="text-xs">
                              Obrigatória
                            </Badge>
                          )}
                          {vacina.apenas_femeas && (
                            <Badge variant="secondary" className="text-xs">
                              Só Fêmeas
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingVacina(vacina);
                              setVacinaDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteVacina(vacina.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Sistema */}
        <TabsContent value="sistema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Total de Animais
                  </p>
                  <p className="text-2xl font-bold">{totalAnimais}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Raças Cadastradas
                  </p>
                  <p className="text-2xl font-bold">{racas.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Tipos de Vacina
                  </p>
                  <p className="text-2xl font-bold">{tiposVacina.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Modo Escuro</p>
                  <p className="text-sm text-muted-foreground">
                    Ative o tema escuro para melhor visualização em ambientes
                    com pouca luz
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sidebar Compacta</p>
                  <p className="text-sm text-muted-foreground">
                    Reduza o tamanho da sidebar para mais espaço de trabalho
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-amber-900">
                    Limpar Dados de Teste
                  </p>
                  <p className="text-sm text-amber-700">
                    Remove todos os dados de teste do sistema
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-amber-600 text-amber-700 hover:bg-amber-100 bg-transparent"
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Raça */}
      <Dialog open={racaDialogOpen} onOpenChange={setRacaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRaca ? "Editar Raça" : "Nova Raça"}
            </DialogTitle>
            <DialogDescription>
              {editingRaca
                ? "Atualize as informações da raça"
                : "Cadastre uma nova raça"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRaca} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={editingRaca?.nome}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                defaultValue={editingRaca?.descricao || ""}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRacaDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Vacina */}
      <Dialog open={vacinaDialogOpen} onOpenChange={setVacinaDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVacina ? "Editar Vacina" : "Nova Vacina"}
            </DialogTitle>
            <DialogDescription>
              {editingVacina
                ? "Atualize as informações da vacina"
                : "Cadastre um novo tipo de vacina"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveVacina} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_vacina">Nome</Label>
              <Input
                id="nome_vacina"
                name="nome"
                defaultValue={editingVacina?.nome}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao_vacina">Descrição</Label>
              <Textarea
                id="descricao_vacina"
                name="descricao"
                defaultValue={editingVacina?.descricao || ""}
                rows={2}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="doses_por_ano">Doses por Ano</Label>
                <Input
                  id="doses_por_ano"
                  name="doses_por_ano"
                  type="number"
                  min="1"
                  defaultValue={editingVacina?.doses_por_ano || 1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dias_entre_doses">Dias entre Doses</Label>
                <Input
                  id="dias_entre_doses"
                  name="dias_entre_doses"
                  type="number"
                  min="1"
                  defaultValue={editingVacina?.dias_entre_doses || 365}
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="obrigatoria"
                  name="obrigatoria"
                  defaultChecked={editingVacina?.obrigatoria}
                />
                <Label htmlFor="obrigatoria">Vacina Obrigatória</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="apenas_femeas"
                  name="apenas_femeas"
                  defaultChecked={editingVacina?.apenas_femeas}
                />
                <Label htmlFor="apenas_femeas">Aplicar Apenas em Fêmeas</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setVacinaDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
