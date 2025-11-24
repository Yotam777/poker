import { Card as CardType } from "@shared/schema";

interface PlayingCardProps {
  card: CardType;
  className?: string;
  small?: boolean;
}

const suitSymbols: Record<string, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors: Record<string, string> = {
  hearts: "text-red-600",
  diamonds: "text-red-600",
  clubs: "text-gray-900 dark:text-gray-100",
  spades: "text-gray-900 dark:text-gray-100",
};

export function PlayingCard({ card, className = "", small = false }: PlayingCardProps) {
  const suitSymbol = suitSymbols[card.suit];
  const suitColor = suitColors[card.suit];
  
  return (
    <div 
      className={`
        bg-white rounded-md shadow-lg flex flex-col items-center justify-center
        border border-gray-200
        ${small ? "w-10 h-14 text-xs" : "w-14 h-20 text-base"}
        ${className}
      `}
      data-testid={`card-${card.rank}-${card.suit}`}
    >
      <div className={`font-bold ${suitColor} ${small ? "text-sm" : "text-lg"}`}>
        {card.rank}
      </div>
      <div className={`${suitColor} ${small ? "text-lg" : "text-2xl"} leading-none`}>
        {suitSymbol}
      </div>
      <div className={`font-bold ${suitColor} ${small ? "text-sm" : "text-lg"} rotate-180`}>
        {card.rank}
      </div>
    </div>
  );
}
