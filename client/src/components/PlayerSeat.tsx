import { Crown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlayingCard } from "./PlayingCard";
import { PlayerState } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface PlayerSeatProps {
  player: PlayerState | null;
  position: number;
  showCards?: boolean;
}

const positionClasses: Record<number, string> = {
  0: "left-8 top-16",
  1: "left-1/2 -translate-x-1/2 top-4",
  2: "right-8 top-16",
  3: "left-8 bottom-16",
  4: "left-1/2 -translate-x-1/2 bottom-4",
  5: "right-8 bottom-16",
};

export function PlayerSeat({ player, position, showCards = false }: PlayerSeatProps) {
  if (!player) {
    return (
      <div 
        className={`absolute ${positionClasses[position]} flex flex-col items-center gap-2`}
        data-testid={`seat-empty-${position}`}
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Empty</span>
        </div>
      </div>
    );
  }

  const initials = player.username
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div 
      className={`absolute ${positionClasses[position]} flex flex-col items-center gap-2`}
      data-testid={`seat-player-${player.userId}`}
    >
      <div className="relative">
        <Avatar className={`w-16 h-16 border-2 ${player.isActive ? 'border-primary' : 'border-muted'}`}>
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {player.roundsWon >= 1 && (
          <div className="absolute -top-2 -right-2 flex gap-0.5" data-testid={`crowns-${player.userId}`}>
            <Crown className="w-5 h-5 text-accent fill-accent animate-bounce-in" />
            {player.roundsWon >= 2 && (
              <Crown className="w-5 h-5 text-accent fill-accent animate-bounce-in" />
            )}
          </div>
        )}
        
        {!player.isConnected && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">Away</span>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <div className="text-sm font-medium text-foreground" data-testid={`player-name-${player.userId}`}>
          {player.username}
        </div>
        <Badge variant="secondary" className="text-xs mt-1" data-testid={`player-balance-${player.userId}`}>
          ${player.balance}
        </Badge>
      </div>
      
      {showCards && player.cards.length > 0 && (
        <div className="flex gap-1 mt-1" data-testid={`player-cards-${player.userId}`}>
          {player.cards.map((card, idx) => (
            <PlayingCard 
              key={idx} 
              card={card} 
              small 
              className="animate-card-deal"
              style={{ animationDelay: `${idx * 100}ms` } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
}
