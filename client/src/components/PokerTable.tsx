import { PlayerSeat } from "./PlayerSeat";
import { PlayingCard } from "./PlayingCard";
import { GameState } from "@shared/schema";
import { Coins, Clock, Spade } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PokerTableProps {
  gameState: GameState;
}

export function PokerTable({ gameState }: PokerTableProps) {
  const players = [...Array(6)].map((_, idx) => 
    gameState.players.find(p => p.seatPosition === idx) || null
  );

  return (
    <div className="w-full h-full flex items-center justify-center p-0 md:p-4" data-testid="poker-table">
      <div className="relative w-full h-full md:aspect-video">
        {/* Table felt background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f5e3a] via-[#0a4028] to-[#051f14] rounded-full shadow-2xl border-8 border-[#8b7355]/40">
          {/* Inner border/rim */}
          <div className="absolute inset-6 border-4 border-[#8b7355]/30 rounded-full" />
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5 rounded-full" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
          }} />
        </div>

        {/* Player seats around table */}
        {players.map((player, idx) => (
          <PlayerSeat 
            key={idx} 
            player={player} 
            position={idx}
            showCards={gameState.status === "in_progress"}
          />
        ))}
        
        {/* Center pot and cards area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
          
          {/* Community Cards */}
          {gameState.communityCards && gameState.communityCards.length > 0 && (
            <div className="flex flex-col items-center gap-2" data-testid="community-cards">
              <div className="text-xs font-semibold text-[#ffd700] tracking-widest uppercase">Community</div>
              <div className="flex gap-2 drop-shadow-lg">
                {gameState.communityCards.map((card, idx) => (
                  <PlayingCard 
                    key={idx} 
                    card={card}
                    className="animate-card-deal"
                    style={{ animationDelay: `${idx * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pot Display */}
          <div className="text-center" data-testid="pot-display">
            <div className="text-xs font-semibold text-[#ffd700] tracking-widest uppercase mb-2">Total Pot</div>
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm px-8 py-4 rounded-full shadow-2xl border-2 border-[#ffd700]/30 hover:border-[#ffd700]/50 transition-all">
              <Coins className="w-8 h-8 text-[#ffd700] animate-pulse" />
              <span className="text-4xl font-display font-bold text-[#ffd700] drop-shadow-lg" data-testid="pot-amount">
                ${gameState.totalPot}
              </span>
            </div>
          </div>
        </div>
        
        {/* Round info - Top Left */}
        <div className="absolute top-6 left-6 flex flex-col gap-3" data-testid="round-indicator">
          <Badge variant="secondary" className="text-base font-semibold bg-black/50 text-[#ffd700] border-[#ffd700]/30">
            <Spade className="w-4 h-4 mr-2" />
            Round {gameState.currentRound} / 3
          </Badge>
          {gameState.roundTimeRemaining !== undefined && (
            <Badge variant="outline" className="text-sm bg-black/50 text-[#ffd700] border-[#ffd700]/30">
              <Clock className="w-3 h-3 mr-1" />
              {gameState.roundTimeRemaining}s remaining
            </Badge>
          )}
        </div>
        
        {/* Last round winner - Top Right */}
        {gameState.lastRoundWinner && (
          <div 
            className="absolute top-6 right-6 bg-[#ffd700]/95 backdrop-blur text-[#051f14] px-6 py-4 rounded-lg shadow-2xl border-2 border-[#ffd700] drop-shadow-lg"
            data-testid="last-winner"
          >
            <div className="text-xs font-bold tracking-widest uppercase opacity-75">Last Winner</div>
            <div className="font-display font-bold text-lg">{gameState.lastRoundWinner.username}</div>
            <div className="text-xs font-semibold opacity-75">{gameState.lastRoundWinner.handName}</div>
          </div>
        )}
      </div>
    </div>
  );
}
