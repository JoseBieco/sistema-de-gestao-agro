"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDocument, formatPhone } from "@/lib/utils/format";
import { Plus, Edit, Trash2, Loader2, Users } from "lucide-react";
import type { Parceiro, TipoParceiro } from "@/lib/types/database";
import { toast } from "sonner";

interface ParceirosPageClientProps {
  initialParceiros: Parceiro[];
}

export function ParceirosPageClient({
  initialParceiros,
}: ParceirosPageClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [parceiros, setParceiros] = useState(initialParceiros);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingParceiro, setEditingParceiro] = useState<Parceiro | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "ambos" as TipoParceiro,
    documento: "",
    telefone: "",
    email: "",
    endereco: "",
    observacoes: "",
  });

  function openDialog(parceiro?: Parceiro) {
    if (parceiro) {
      setEditingParceiro(parceiro);
      setFormData({
        nome: parceiro.nome,
        tipo: parceiro.tipo,
        documento: parceiro.documento || "",
        telefone: parceiro.telefone || "",
        email: parceiro.email || "",
        endereco: parceiro.endereco || "",
        observacoes: parceiro.observacoes || "",
      });
    } else {
      setEditingParceiro(null);
      setFormData({
        nome: "",
        tipo: "ambos",
        documento: "",
        telefone: "",
        email: "",
        endereco: "",
        observacoes: "",
      });
    }
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!formData.nome.trim()) return;
    setLoading(true);

    try {
      if (editingParceiro) {
        const { error } = await supabase
          .from("parceiros")
          .update(formData)
          .eq("id", editingParceiro.id);
        if (error) {
          toast.error("Erro ao atualizar parceiro:" + error);
          throw error;
        } else toast.success("Parceiro atualizado com sucesso.");
      } else {
        const { error } = await supabase
          .from("parceiros")
          .insert({ ...formData, ativo: true });
        if (error) throw error;
      }
      // Atualizar o state sem necessitar de buscar as informações no banco novamente
      const { data } = await supabase
        .from("parceiros")
        .select("*")
        .order("nome");
      if (data) setParceiros(data);
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Erro ao salvar parceiro:" + error);
      console.error("Erro ao salvar parceiro:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este parceiro?")) return;

    try {
      const { error } = await supabase.from("parceiros").delete().eq("id", id);
      if (error) throw error;

      setParceiros(parceiros.filter((p) => p.id !== id));
      toast.success("Sucesso ao excluir o parceiro.");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao excluir parceiro:" + error);
      console.error("Erro ao excluir parceiro:", error);
    }
  }

  const tipoLabel = {
    comprador: "Comprador",
    vendedor: "Vendedor",
    ambos: "Comprador/Vendedor",
  };

  const tipoBadgeVariant = {
    comprador: "default",
    vendedor: "secondary",
    ambos: "outline",
  } as const;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cadastro de Parceiros
          </CardTitle>
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Parceiro
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parceiros.length > 0 ? (
                parceiros.map((parceiro) => (
                  <TableRow key={parceiro.id}>
                    <TableCell className="font-medium">
                      {parceiro.nome}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tipoBadgeVariant[parceiro.tipo]}>
                        {tipoLabel[parceiro.tipo]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {parceiro.documento
                        ? formatDocument(parceiro.documento)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {parceiro.telefone ? formatPhone(parceiro.telefone) : "-"}
                    </TableCell>
                    <TableCell>{parceiro.email || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(parceiro)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(parceiro.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    Nenhum parceiro cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingParceiro ? "Editar Parceiro" : "Novo Parceiro"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Nome completo ou razão social"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(v: TipoParceiro) =>
                    setFormData({ ...formData, tipo: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprador">Comprador</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="documento">CPF/CNPJ</Label>
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) =>
                    setFormData({ ...formData, documento: e.target.value })
                  }
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) =>
                  setFormData({ ...formData, endereco: e.target.value })
                }
                placeholder="Endereço completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                placeholder="Informações adicionais..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.nome.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingParceiro ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
