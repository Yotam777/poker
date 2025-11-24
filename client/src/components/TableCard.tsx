import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Lock } from "lucide-react";
import { Table } from "@shared/schema";

interface TableCardProps {
  table: Table;
  playerCount: number;
  playerNames: string[];
  onJoin: (tableId: string) => void;
  canJoin: boolean;
}

export function TableCard({ table, playerCount, playerNames, onJoin, canJoin }: TableCardProps) {
  return (
    <Card 
      className="hover-elevate transition-all duration-200"
      data-testid={`table-card-${table.id}`}
    >
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-2xl font-display">{table.name}</CardTitle>
          {table.password && (
            <Lock className="w-4 h-4 text-muted-foreground" data-testid="table-locked" />
          )}
        </div>
        <div className="text-4xl font-display font-bold text-accent mt-2" data-testid={`table-stake-${table.id}`}>
          ${table.stakeAmount}
        </div>
        <div className="text-xs text-muted-foreground">per round</div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm" data-testid={`table-player-count-${table.id}`}>
            {playerCount} / {table.maxPlayers} players
          </span>
        </div>
        
        {playerNames.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Seated Players:</div>
            <div className="flex flex-wrap gap-1">
              {playerNames.slice(0, 6).map((name, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs"
                  data-testid={`seated-player-${idx}`}
                >
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={() => onJoin(table.id)}
          disabled={!canJoin}
          className="w-full"
          data-testid={`button-join-table-${table.id}`}
        >
          {playerCount >= table.maxPlayers ? "Table Full" : "Join Table"}
        </Button>
      </CardFooter>
    </Card>
  );
}
