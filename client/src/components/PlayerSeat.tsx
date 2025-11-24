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
  0: "left-4 top-12",
  1: "left-1/2 -translate-x-1/2 top-2",
  2: "right-4 top-12",
  3: "left-4 bottom-12",
  4: "left-1/2 -translate-x-1/2 bottom-2",
  5: "right-4 bottom-12",
};

export function PlayerSeat({ player, position, showCards = false }: PlayerSeatProps) {
  if (!player) {
    return (
      <div 
        className={`absolute ${positionClasses[position]} flex flex-col items-center gap-2`}
        data-testid={`seat-empty-${position}`}
      >
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted/50 flex items-center justify-center bg-muted/5">
          <span className="text-xs text-muted-foreground">Empty Seat</span>
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
        <Avatar className={`w-20 h-20 border-4 ${player.isActive ? 'border-primary shadow-lg' : 'border-muted/50'} transition-all`}>
          <AvatarFallback className={`bg-gradient-to-br ${player.isActive ? 'from-primary to-primary/70' : 'from-muted to-muted/70'} text-primary-foreground font-bold text-lg`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {player.roundsWon >= 1 && (
          <div className="absolute -top-3 -right-3 flex gap-0.5" data-testid={`crowns-${player.userId}`}>
            <Crown className="w-6 h-6 text-accent fill-accent drop-shadow-lg animate-bounce" />
            {player.roundsWon >= 2 && (
              <Crown className="w-6 h-6 text-accent fill-accent drop-shadow-lg animate-bounce" style={{ animationDelay: '0.1s' }} />
            )}
          </div>
        )}
        
        {!player.isConnected && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-xs text-white font-bold">Offline</span>
          </div>
        )}
      </div>
      
      <div className="text-center min-w-fit">
        <div className="text-sm font-semibold text-foreground" data-testid={`player-name-${player.userId}`}>
          {player.username}
        </div>
        <div className="flex items-center gap-1 justify-center mt-1">
          <div className="inline-flex items-center gap-1 bg-accent/10 px-3 py-1 rounded-full">
            <span className="text-yellow-600 dark:text-yellow-400 font-bold">💰</span>
            <span className="text-xs font-mono font-bold text-foreground" data-testid={`player-balance-${player.userId}`}>
              ${player.balance}
            </span>
          </div>
        </div>
      </div>
      
      {showCards && player.cards.length > 0 && (
        <div className="flex gap-0.5 mt-2 flex-wrap justify-center max-w-xs" data-testid={`player-cards-${player.userId}`}>
          {player.cards.map((card, idx) => (
            <PlayingCard 
              key={idx} 
              card={card} 
              small 
              className="animate-card-deal"
              style={{ animationDelay: `${idx * 80}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
