"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import type { Raca } from "@/lib/types/database";
import { toast } from "sonner";

interface RacasPageClientProps {
  initialRacas: Raca[];
}

export function RacasPageClient({ initialRacas }: RacasPageClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [racas, setRacas] = useState(initialRacas);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingRaca, setEditingRaca] = useState<Raca | null>(null);
  const [formData, setFormData] = useState({ nome: "", descricao: "" });

  function openDialog(raca?: Raca) {
    if (raca) {
      setEditingRaca(raca);
      setFormData({ nome: raca.nome, descricao: raca.descricao || "" });
    } else {
      setEditingRaca(null);
      setFormData({ nome: "", descricao: "" });
    }
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!formData.nome.trim()) return;
    setLoading(true);

    try {
      if (editingRaca) {
        const { error } = await supabase
          .from("racas")
          .update(formData)
          .eq("id", editingRaca.id);
        if (error) throw error;
        else toast.success("Sucesso ao editar a raça.");
      } else {
        const { error } = await supabase.from("racas").insert(formData);
        if (error) throw error;
        else toast.success("Sucesso ao criar a raça.");
      }

      const { data } = await supabase.from("racas").select("*").order("nome");
      if (data) setRacas(data);
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Erro ao salvar raça:" + error);
      console.error("Erro ao salvar raça:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta raça?")) return;

    try {
      const { error } = await supabase.from("racas").delete().eq("id", id);
      if (error) throw error;
      else toast.success("Sucesso ao excluir a raça.");

      setRacas(racas.filter((r) => r.id !== id));
      router.refresh();
    } catch (error) {
      toast.error("Erro ao excluir raça:" + error);
      console.error("Erro ao excluir raça:", error);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cadastro de Raças</CardTitle>
          <Button onClick={() => openDialog()}>
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
              {racas.length > 0 ? (
                racas.map((raca) => (
                  <TableRow key={raca.id}>
                    <TableCell className="font-medium">{raca.nome}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {raca.descricao || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(raca)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(raca.id)}
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
                    colSpan={3}
                    className="text-center text-muted-foreground py-8"
                  >
                    Nenhuma raça cadastrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRaca ? "Editar Raça" : "Nova Raça"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="Ex: Nelore"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                placeholder="Descrição da raça (opcional)"
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
              {editingRaca ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
