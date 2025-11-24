import { PlayerSeat } from "./PlayerSeat";
import { PlayingCard } from "./PlayingCard";
import { GameState } from "@shared/schema";
import { Coins, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PokerTableProps {
  gameState: GameState;
}

export function PokerTable({ gameState }: PokerTableProps) {
  const players = [...Array(6)].map((_, idx) => 
    gameState.players.find(p => p.seatPosition === idx) || null
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-8" data-testid="poker-table">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-primary to-primary/80 rounded-[50%] shadow-2xl p-12 border-8 border-primary/40">
        <div className="absolute inset-8 border-4 border-primary-foreground/20 rounded-[50%]" />
        
        {players.map((player, idx) => (
          <PlayerSeat 
            key={idx} 
            player={player} 
            position={idx}
            showCards={gameState.status === "in_progress"}
          />
        ))}
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
          <div className="text-center" data-testid="pot-display">
            <div className="text-sm text-primary-foreground/70 mb-1">Total Pot</div>
            <div className="flex items-center gap-2 bg-background/90 backdrop-blur px-6 py-3 rounded-full shadow-lg">
              <Coins className="w-6 h-6 text-accent" />
              <span className="text-3xl font-display font-bold text-foreground animate-pulse-scale" data-testid="pot-amount">
                ${gameState.totalPot}
              </span>
            </div>
          </div>
          
          {gameState.communityCards && gameState.communityCards.length > 0 && (
            <div className="flex flex-col items-center gap-2" data-testid="community-cards">
              <div className="text-xs text-primary-foreground/70">Community Cards</div>
              <div className="flex gap-2">
                {gameState.communityCards.map((card, idx) => (
                  <PlayingCard 
                    key={idx} 
                    card={card}
                    className="animate-card-deal"
                    style={{ animationDelay: `${idx * 150}ms` } as React.CSSProperties}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="absolute top-4 left-4 flex flex-col gap-2" data-testid="round-indicator">
          <Badge variant="secondary" className="text-base font-semibold">
            Round {gameState.currentRound} of 3
          </Badge>
          {gameState.roundTimeRemaining !== undefined && (
            <Badge variant="outline" className="text-sm">
              <Clock className="w-3 h-3 mr-1" />
              {gameState.roundTimeRemaining}s
            </Badge>
          )}
        </div>
        
        {gameState.lastRoundWinner && (
          <div 
            className="absolute top-4 right-4 bg-accent/90 backdrop-blur text-accent-foreground px-4 py-2 rounded-lg shadow-lg"
            data-testid="last-winner"
          >
            <div className="text-xs font-medium">Last Round Winner</div>
            <div className="font-bold">{gameState.lastRoundWinner.username}</div>
            <div className="text-xs">{gameState.lastRoundWinner.handName}</div>
          </div>
        )}
      </div>
    </div>
  );
}
