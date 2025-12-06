import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Ruler } from "lucide-react";
import type { Local } from "@/lib/types/database";

interface PastureCardProps {
  local: Local;
  currentOccupancy: number;
  onClick?: () => void;
}

export function PastureCard({
  local,
  currentOccupancy,
  onClick,
}: PastureCardProps) {
  const occupancyRate =
    local.capacidade_maxima > 0
      ? (currentOccupancy / local.capacidade_maxima) * 100
      : 0;

  // Cores baseadas na lotação
  let progressColor = "bg-primary";
  if (occupancyRate > 100) progressColor = "bg-red-600";
  else if (occupancyRate > 80) progressColor = "bg-amber-500";
  else progressColor = "bg-emerald-500";

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {local.nome}
        </CardTitle>
        <Badge variant="outline" className="capitalize">
          {local.tipo}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              {local.area_hectares} ha
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {currentOccupancy} / {local.capacidade_maxima} cab
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Lotação</span>
              <span
                className={occupancyRate > 100 ? "text-red-600 font-bold" : ""}
              >
                {occupancyRate.toFixed(0)}%
              </span>
            </div>
            <Progress
              value={Math.min(occupancyRate, 100)}
              className={progressColor}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
