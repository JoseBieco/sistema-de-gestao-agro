"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, ArrowDownUp, Trash2 } from "lucide-react"
import { registrarMovimentacaoSanitaria, deleteProdutoSanitario } from "./actions"

export function EstoquePageClient({ initialProdutos }: { initialProdutos: any[] }) {
  const router = useRouter()
  const [isMovimentacaoOpen, setIsMovimentacaoOpen] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<any>(null)
  
  const [movData, setMovData] = useState({
    tipo_transacao: "ENTRADA",
    quantidade: "",
    observacoes: ""
  })

  const openMovimentacao = (produto: any) => {
    setSelectedProduto(produto)
    setMovData({ tipo_transacao: "ENTRADA", quantidade: "", observacoes: "" })
    setIsMovimentacaoOpen(true)
  }

  const handleMovimentacaoSubmit = async () => {
    if (!selectedProduto || !movData.quantidade) return
    
    await registrarMovimentacaoSanitaria({
      produto_id: selectedProduto.id,
      tipo_transacao: movData.tipo_transacao as any,
      quantidade: parseFloat(movData.quantidade),
      observacoes: movData.observacoes
    })
    
    setIsMovimentacaoOpen(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este produto?")) {
      await deleteProdutoSanitario(id)
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Estoque</h2>
        <Button onClick={() => router.push("/sanitario/estoque/novo")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Indicação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialProdutos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhum produto cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                initialProdutos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>{produto.tipo === "REMEDIO" ? "Remédio" : "Vacina"}</TableCell>
                    <TableCell>{produto.quantidade_estoque}</TableCell>
                    <TableCell>{produto.unidade_medida}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{produto.indicacao}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => openMovimentacao(produto)} title="Movimentar Estoque">
                        <ArrowDownUp className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => router.push(`/sanitario/estoque/${produto.id}/editar`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDelete(produto.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isMovimentacaoOpen} onOpenChange={setIsMovimentacaoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movimentar Estoque - {selectedProduto?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Movimentação</Label>
              <Select 
                value={movData.tipo_transacao} 
                onValueChange={(val) => setMovData({ ...movData, tipo_transacao: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada (+)</SelectItem>
                  <SelectItem value="SAIDA">Saída (-)</SelectItem>
                  <SelectItem value="AJUSTE">Ajuste (Substituir total)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade ({selectedProduto?.unidade_medida})</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={movData.quantidade} 
                onChange={(e) => setMovData({ ...movData, quantidade: e.target.value })} 
                placeholder="Ex: 10" 
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input 
                value={movData.observacoes} 
                onChange={(e) => setMovData({ ...movData, observacoes: e.target.value })} 
                placeholder="Opcional" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMovimentacaoOpen(false)}>Cancelar</Button>
            <Button onClick={handleMovimentacaoSubmit}>Salvar Movimentação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
