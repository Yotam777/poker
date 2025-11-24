import { Card as CardType } from "@shared/schema";

interface PlayingCardProps {
  card: CardType;
  className?: string;
  small?: boolean;
  style?: React.CSSProperties;
}

const suitSymbols: Record<string, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors: Record<string, { text: string; bg: string }> = {
  hearts: { text: "text-red-600", bg: "from-red-50 to-red-100 dark:from-red-950 dark:to-red-900" },
  diamonds: { text: "text-red-600", bg: "from-red-50 to-red-100 dark:from-red-950 dark:to-red-900" },
  clubs: { text: "text-gray-900 dark:text-gray-50", bg: "from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900" },
  spades: { text: "text-gray-900 dark:text-gray-50", bg: "from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900" },
};

export function PlayingCard({ card, className = "", small = false, style }: PlayingCardProps) {
  const suitSymbol = suitSymbols[card.suit];
  const colors = suitColors[card.suit];
  
  return (
    <div 
      className={`
        bg-gradient-to-br ${colors.bg} rounded-lg shadow-lg flex flex-col items-center justify-center
        border-2 border-gray-300 dark:border-gray-700
        ${small ? "w-12 h-16 text-xs" : "w-16 h-24 text-sm"}
        transition-all duration-200 hover:shadow-xl hover:scale-105
        ${className}
      `}
      data-testid={`card-${card.rank}-${card.suit}`}
      style={style}
    >
      <div className={`font-bold ${colors.text} ${small ? "text-xs" : "text-sm"} leading-tight`}>
        {card.rank}
      </div>
      <div className={`${colors.text} ${small ? "text-base" : "text-xl"} leading-none font-bold`}>
        {suitSymbol}
      </div>
      <div className={`font-bold ${colors.text} ${small ? "text-xs" : "text-sm"} leading-tight rotate-180`}>
        {card.rank}
      </div>
    </div>
  );
}
