import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { History, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RoundHistory {
  roundNumber: number;
  winnerName: string | null;
  handName: string | null;
  isTie: boolean;
}

interface TableHistoryProps {
  rounds: RoundHistory[];
}

export function TableHistory({ rounds }: TableHistoryProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" data-testid="button-history">
          <History className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle className="text-2xl font-display">Round History</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          <div className="space-y-4" data-testid="history-list">
            {rounds.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No rounds played yet
              </div>
            ) : (
              rounds.map((round, idx) => (
                <div 
                  key={idx}
                  className="border border-border rounded-lg p-4 space-y-2"
                  data-testid={`history-round-${round.roundNumber}`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Round {round.roundNumber}</Badge>
                    {round.winnerName && !round.isTie && (
                      <Crown className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  
                  {round.isTie ? (
                    <div className="text-sm text-muted-foreground">
                      Tie - No Winner
                    </div>
                  ) : round.winnerName ? (
                    <>
                      <div className="font-semibold" data-testid={`history-winner-${round.roundNumber}`}>
                        {round.winnerName}
                      </div>
                      <div className="text-sm text-accent" data-testid={`history-hand-${round.roundNumber}`}>
                        {round.handName}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      In Progress
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
