"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Calculator, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { ScrollArea } from "@/components/ui/scroll-area";

export type SaleGroup = {
  id: string;
  name: string;
  tipo_medida: "kilo" | "arroba";
  valor_unidade: number;
  animais_ids: string[];
};

interface SaleGroupsEditorProps {
  animaisDisponiveis: any[];
  onGroupsChange: (animaisIds: string[], groupsSummary: string, groupsData: any[]) => void;
  onTotalCalculated: (total: number) => void;
  descontoCarcacaInicial?: number;
  onDescontoCarcacaChange?: (val: number) => void;
  tipo?: "compra" | "venda";
}

export function SaleGroupsEditor({ 
  animaisDisponiveis, 
  onGroupsChange, 
  onTotalCalculated,
  descontoCarcacaInicial = 50,
  onDescontoCarcacaChange,
  tipo = "venda"
}: SaleGroupsEditorProps) {
  const [groups, setGroups] = useState<SaleGroup[]>([]);
  const [descontoCarcaca, setDescontoCarcaca] = useState<number>(descontoCarcacaInicial);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setDescontoCarcaca(descontoCarcacaInicial);
  }, [descontoCarcacaInicial]);

  const addGroup = () => {
    setGroups([
      ...groups,
      {
        id: crypto.randomUUID(),
        name: `Grupo ${groups.length + 1}`,
        tipo_medida: "arroba",
        valor_unidade: 0,
        animais_ids: [],
      }
    ]);
  };

  const updateGroup = (id: string, updates: Partial<SaleGroup>) => {
    setGroups(groups.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const removeGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  const toggleAnimalInGroup = (groupId: string, animalId: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        const isSelected = g.animais_ids.includes(animalId);
        return {
          ...g,
          animais_ids: isSelected 
            ? g.animais_ids.filter(id => id !== animalId)
            : [...g.animais_ids, animalId]
        };
      }
      return g;
    }));
  };

  // Derive all selected animals and summary for parent
  useEffect(() => {
    const allSelectedIds = new Set<string>();
    let summary = "Grupos de Venda:\n";
    let totalComputed = 0;
    const groupsData: any[] = [];

    groups.forEach(g => {
      g.animais_ids.forEach(id => allSelectedIds.add(id));
      
      let groupTotalWeight = 0;
      let groupComputedValue = 0;
      let qtty = 0;
      
      g.animais_ids.forEach(id => {
        const animal = animaisDisponiveis.find(a => a.id === id);
        if (animal) {
          qtty++;
          const peso = animal.peso_atual || 0;
          groupTotalWeight += peso;
          
          if (g.tipo_medida === "kilo") {
            groupComputedValue += peso * g.valor_unidade;
          } else {
            groupComputedValue += ((peso * (descontoCarcaca / 100)) / 15) * g.valor_unidade;
          }
        }
      });
      
      totalComputed += groupComputedValue;
      
      summary += `- ${g.name} (${g.tipo_medida === "arroba" ? "Arroba" : "Kilo"} a R$${g.valor_unidade}): ${qtty} animais. Total calculado: R$${groupComputedValue.toFixed(2)}\n`;
      
      groupsData.push({
        nome: g.name,
        tipo_medida: g.tipo_medida,
        valor_unidade: g.valor_unidade,
        quantidade_animais: qtty,
        peso_total: groupTotalWeight,
        valor_calculado: groupComputedValue,
        animais_ids: g.animais_ids
      });
    });
    
    summary += `(Config: Desconto Carcaça = ${descontoCarcaca}%)`;
    
    onGroupsChange(Array.from(allSelectedIds), summary, groupsData);
  }, [groups, descontoCarcaca, animaisDisponiveis]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCalculateTotal = () => {
    let finalTotal = 0;
    let animaisSemPeso = 0;
    
    groups.forEach(g => {
      g.animais_ids.forEach(id => {
        const animal = animaisDisponiveis.find(a => a.id === id);
        if (animal) {
          const peso = animal.peso_atual || 0;
          if (peso === 0) animaisSemPeso++;
          
          if (g.tipo_medida === "kilo") {
            finalTotal += peso * g.valor_unidade;
          } else {
            finalTotal += ((peso * (descontoCarcaca / 100)) / 15) * g.valor_unidade;
          }
        }
      });
    });
    
    const calculated = Math.round(finalTotal * 100) / 100;
    onTotalCalculated(calculated);
    
    import("sonner").then(({ toast }) => {
      if (calculated === 0) {
        toast.warning("O cálculo resultou em R$ 0,00. Verifique os valores unitários ou se os animais têm 'Peso Atual' preenchido.");
      } else {
        toast.success(`Valor calculado com sucesso: R$ ${calculated.toFixed(2)}`);
        if (animaisSemPeso > 0) {
          toast.info(`${animaisSemPeso} animal(is) selecionado(s) estão com peso zero.`);
        }
      }
    });
  };

  const filteredAnimais = animaisDisponiveis.filter(animal => {
    const term = searchTerm.toLowerCase();
    return !term || animal.brinco?.toLowerCase().includes(term) || animal.nome?.toLowerCase().includes(term);
  });

  // To prevent selecting the same animal in multiple groups
  const allSelectedAnimalsExcludingGroup = (groupId: string) => {
    const ids = new Set<string>();
    groups.forEach(g => {
      if (g.id !== groupId) {
        g.animais_ids.forEach(id => ids.add(id));
      }
    });
    return ids;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Grupos de {tipo === "compra" ? "Compra" : "Venda"}</h3>
        <Button type="button" variant="outline" size="sm" onClick={addGroup}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Grupo
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg border">
        <Label className="whitespace-nowrap font-medium text-sm">Configuração da Arroba:</Label>
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            className="w-24 h-8" 
            value={descontoCarcaca} 
            onChange={e => {
              const val = Number(e.target.value) || 0;
              setDescontoCarcaca(val);
              if (onDescontoCarcacaChange) onDescontoCarcacaChange(val);
            }} 
          />
          <span className="text-sm text-muted-foreground">% (Desconto Carcaça)</span>
        </div>
      </div>

      {groups.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-6 bg-muted/20 border border-dashed rounded-lg">
          Nenhum grupo de {tipo === "compra" ? "compra" : "venda"} criado. Você pode adicionar grupos para calcular o valor automaticamente por arroba ou kilo.
        </div>
      )}

      {groups.map((group, index) => {
        const disabledIds = allSelectedAnimalsExcludingGroup(group.id);
        
        return (
          <Card key={group.id} className="border shadow-sm">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 bg-muted/30">
              <div className="flex items-center gap-2 flex-1">
                <Input 
                  value={group.name} 
                  onChange={e => updateGroup(group.id, { name: e.target.value })}
                  className="h-8 w-40 font-medium"
                />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeGroup(group.id)} className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Cobrar por</Label>
                  <Select 
                    value={group.tipo_medida} 
                    onValueChange={(v: any) => updateGroup(group.id, { tipo_medida: v })}
                  >
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arroba">Arroba (@)</SelectItem>
                      <SelectItem value="kilo">Kilo (kg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Valor por unidade (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    className="h-8"
                    value={group.valor_unidade || ""}
                    onChange={e => updateGroup(group.id, { valor_unidade: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Animais neste grupo ({group.animais_ids.length})</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-7 text-xs"
                  />
                </div>
                <ScrollArea className="h-[150px] rounded border p-1 bg-background">
                  <div className="grid gap-1">
                    {filteredAnimais.map(animal => {
                      const isSelected = group.animais_ids.includes(animal.id);
                      const isTaken = disabledIds.has(animal.id);
                      if (!isSelected && isTaken) return null; // Hide animals taken by other groups to keep it clean

                      return (
                        <label
                          key={animal.id}
                          className={`flex items-center gap-2 rounded p-1.5 cursor-pointer transition-colors ${
                            isSelected ? "bg-primary/10" : "hover:bg-muted"
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleAnimalInGroup(group.id, animal.id)}
                            className="w-3.5 h-3.5"
                          />
                          <span className="text-xs flex-1">
                            {animal.brinco} {animal.nome ? `- ${animal.nome}` : ""}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{animal.peso_atual} kg</span>
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {groups.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button type="button" variant="secondary" onClick={handleCalculateTotal} className="w-full sm:w-auto bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
            <Calculator className="mr-2 h-4 w-4" />
            Calcular Valor Total
          </Button>
        </div>
      )}
    </div>
  );
}
