"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ArrowLeftRight, Map } from "lucide-react";
import { PastureCard } from "./pasture-card";
import { MoveAnimalsDialog } from "./move-animals-dialog";
import { NewPastureDialog } from "./new-pasture-dialog";
import type { Local, Animal } from "@/lib/types/database";

interface ManagementClientProps {
  locais: Local[];
  animais: Animal[];
}

export function ManagementClient({ locais, animais }: ManagementClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [newPastureOpen, setNewPastureOpen] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);

  // Calcular ocupação
  const occupancyMap = animais.reduce((acc, animal) => {
    if (animal.local_id) {
      acc[animal.local_id] = (acc[animal.local_id] || 0) + 1;
    } else {
      acc["sem_local"] = (acc["sem_local"] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredLocais = locais.filter((l) =>
    l.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    router.refresh();
  };

  const openMoveDialog = (originId?: string) => {
    setSelectedOrigin(originId || null);
    setMoveDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Ações */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar pasto ou local..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => openMoveDialog()}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Movimentar
          </Button>
          <Button onClick={() => setNewPastureOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Local
          </Button>
        </div>
      </div>

      {/* Alerta de animais sem local */}
      {occupancyMap["sem_local"] > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <Map className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-medium text-amber-900">
                Animais sem localização definida
              </h3>
              <p className="text-sm text-amber-700">
                Existem {occupancyMap["sem_local"]} animais que não estão
                alocados em nenhum pasto.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 hover:bg-amber-100 text-amber-800"
            onClick={() => openMoveDialog("sem_local")}
          >
            Alocar Agora
          </Button>
        </div>
      )}

      {/* Grid de Pastos */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredLocais.map((local) => (
          <PastureCard
            key={local.id}
            local={local}
            currentOccupancy={occupancyMap[local.id] || 0}
            onClick={() => openMoveDialog(local.id)}
          />
        ))}
      </div>

      {filteredLocais.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum local encontrado. Crie seu primeiro pasto ou curral.
        </div>
      )}

      {/* Dialogs */}
      <MoveAnimalsDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        onSuccess={handleRefresh}
        locais={locais}
        animais={animais}
        defaultOriginId={selectedOrigin}
      />

      <NewPastureDialog
        open={newPastureOpen}
        onOpenChange={setNewPastureOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
