"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  initialFazenda: any;
}

export function ConfiguracoesClient({
  initialRacas,
  initialTiposVacina,
  totalAnimais,
  initialFazenda,
}: ConfiguracoesClientProps) {
  const [racas, setRacas] = useState(initialRacas);
  const [tiposVacina, setTiposVacina] = useState(initialTiposVacina);
  const [editingRaca, setEditingRaca] = useState<Raca | null>(null);
  const [editingVacina, setEditingVacina] = useState<TipoVacina | null>(null);
  const [mesesAplicacao, setMesesAplicacao] = useState<number[]>([]);
  const [racaDialogOpen, setRacaDialogOpen] = useState(false);
  const [vacinaDialogOpen, setVacinaDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSavingFazenda, setIsSavingFazenda] = useState(false);

  // Configurações gerais
  const [configFazenda, setConfigFazenda] = useState({
    nome: initialFazenda?.nome || "Fazenda Exemplo",
    cnpj: initialFazenda?.cnpj || "",
    ie: initialFazenda?.ie || "",
    endereco: initialFazenda?.endereco || "",
    cidade: initialFazenda?.cidade || "",
    estado: initialFazenda?.estado || "SP",
  });

  async function handleSaveFazenda(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSavingFazenda(true);

    try {
      const { updateFazenda } = await import("@/app/configuracoes/actions");
      const result = await updateFazenda(configFazenda);
      
      if (result.success) {
        toast.success("Dados da propriedade salvos com sucesso!");
      } else {
        toast.error("Erro ao salvar dados da propriedade.");
      }
    } catch (error) {
      toast.error("Erro de conexão.");
    } finally {
      setIsSavingFazenda(false);
    }
  }

  async function handleSaveRaca(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        nome: formData.get("nome") as string,
        descricao: (formData.get("descricao") as string) || null,
      };

      const { createRaca, updateRaca } = await import("@/app/racas/actions");

      if (editingRaca) {
        const res = await updateRaca(editingRaca.id, data); if (res?.error) { toast.error("Erro: " + res.error); return; } const updated = res?.data;
        if (updated) {
          setRacas((prev) =>
            prev.map((r) => (r.id === editingRaca.id ? { ...r, ...data } : r))
          );
          toast.success("Raça atualizada com sucesso.");
        }
      } else {
        const res = await createRaca(data); if (res?.error) { toast.error("Erro: " + res.error); return; } const newRaca = res?.data;
        if (newRaca) {
          setRacas((prev) => [...prev, newRaca]);
          toast.success("Raça criada com sucesso.");
        }
      }

      setRacaDialogOpen(false);
      setEditingRaca(null);
    } catch (error) {
      toast.error("Erro ao salvar raça.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveVacina(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const dose_unica = formData.get("dose_unica") === "on";

      const data = {
        nome: formData.get("nome") as string,
        descricao: (formData.get("descricao") as string) || null,
        doses_por_ano: dose_unica 
          ? 1 
          : Number.parseInt(formData.get("doses_por_ano") as string) || 1,
        dias_entre_doses: dose_unica 
          ? 0 
          : Number.parseInt(formData.get("dias_entre_doses") as string) || 365,
        obrigatoria: formData.get("obrigatoria") === "on",
        apenas_femeas: formData.get("apenas_femeas") === "on",
        dose_unica,
        meses_aplicacao: mesesAplicacao,
      };

      const { createTipoVacina, updateTipoVacina } = await import(
        "@/app/vacinas/actions"
      );

      if (editingVacina) {
        const res = await updateTipoVacina(editingVacina.id, data); if (res?.error) { toast.error("Erro: " + res.error); return; } const updated = res?.data;
        if (updated) {
          setTiposVacina((prev) =>
            prev.map((v) => (v.id === editingVacina.id ? { ...v, ...data, meses_aplicacao: mesesAplicacao } : v))
          );
          toast.success("Vacina atualizada com sucesso.");
        }
      } else {
        const res = await createTipoVacina(data); if (res?.error) { toast.error("Erro: " + res.error); return; } const newVacina = res?.data;
        if (newVacina) {
          setTiposVacina((prev) => [...prev, newVacina]);
          toast.success("Vacina criada com sucesso.");
        }
      }

      setVacinaDialogOpen(false);
      setEditingVacina(null);
      setMesesAplicacao([]);
    } catch (error) {
      toast.error("Erro ao salvar vacina.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteRaca(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta raça?")) return;

    const { deleteRaca } = await import("@/app/racas/actions");
    const res = await deleteRaca(id); if (res?.error) { toast.error("Erro: " + res.error); return; }
    setRacas((prev) => prev.filter((r) => r.id !== id));
    toast.success("Raça excluída com sucesso.");
  }

  async function handleDeleteVacina(id: string) {
    if (!confirm("Tem certeza que deseja excluir este tipo de vacina?")) return;

    const { deleteTipoVacina } = await import("@/app/vacinas/actions");
    const res = await deleteTipoVacina(id); if (res?.error) { toast.error("Erro: " + res.error); return; }
    setTiposVacina((prev) => prev.filter((v) => v.id !== id));
    toast.success("Vacina excluída com sucesso.");
  }

  const [isDoseUnica, setIsDoseUnica] = useState(false);

  // When opening edit dialog, we need to set isDoseUnica
  function handleEditVacina(vacina: TipoVacina) {
    setEditingVacina(vacina);
    setIsDoseUnica(vacina.dose_unica || false);
    setMesesAplicacao(vacina.meses_aplicacao || []);
    setVacinaDialogOpen(true);
  }

  function handleNewVacina() {
    setEditingVacina(null);
    setIsDoseUnica(false);
    setMesesAplicacao([]);
    setVacinaDialogOpen(true);
  }

  const meses = [
    { num: 1, label: "Jan" },
    { num: 2, label: "Fev" },
    { num: 3, label: "Mar" },
    { num: 4, label: "Abr" },
    { num: 5, label: "Mai" },
    { num: 6, label: "Jun" },
    { num: 7, label: "Jul" },
    { num: 8, label: "Ago" },
    { num: 9, label: "Set" },
    { num: 10, label: "Out" },
    { num: 11, label: "Nov" },
    { num: 12, label: "Dez" },
  ];

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
              <form onSubmit={handleSaveFazenda} className="space-y-4">
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ / CPF</Label>
                    <Input
                      id="cnpj"
                      value={configFazenda.cnpj}
                      onChange={(e) =>
                        setConfigFazenda((prev) => ({
                          ...prev,
                          cnpj: e.target.value,
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
                <Button type="submit" disabled={isSavingFazenda}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSavingFazenda ? "Salvando..." : "Salvar Alterações"}
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
              <Button onClick={handleNewVacina}>
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
                      <TableCell>{vacina.dose_unica ? "Única" : `${vacina.doses_por_ano}x`}</TableCell>
                      <TableCell>{vacina.dose_unica ? "-" : `${vacina.dias_entre_doses} dias`}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {vacina.dose_unica && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              Dose Única
                            </Badge>
                          )}
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
                            onClick={() => handleEditVacina(vacina)}
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
            <div className="space-y-3 pt-2 pb-2">
              <div className="flex items-center gap-3">
                <Switch
                  id="dose_unica"
                  name="dose_unica"
                  checked={isDoseUnica}
                  onCheckedChange={setIsDoseUnica}
                />
                <Label htmlFor="dose_unica">Dose única na vida (ex: Brucelose)</Label>
              </div>
            </div>
            {!isDoseUnica && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="doses_por_ano">Doses por Ano</Label>
                  <Input
                    id="doses_por_ano"
                    name="doses_por_ano"
                    type="number"
                    min="1"
                    defaultValue={editingVacina?.doses_por_ano || 1}
                    required={!isDoseUnica}
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
                    required={!isDoseUnica}
                  />
                </div>
              </div>
            )}
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

            <div className="space-y-2 pt-2 border-t">
              <Label>Meses de Aplicação na Fazenda (Planejamento)</Label>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-12 mt-2">
                {meses.map((m) => {
                  const isSelected = mesesAplicacao.includes(m.num);
                  return (
                    <button
                      key={m.num}
                      type="button"
                      onClick={() => {
                        setMesesAplicacao((prev) =>
                          prev.includes(m.num)
                            ? prev.filter((x) => x !== m.num)
                            : [...prev, m.num]
                        );
                      }}
                      className={`px-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        isSelected
                          ? "bg-green-600 text-white shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                Selecione os meses em que o rebanho deve receber esta vacina.
              </p>
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
