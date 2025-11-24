import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PokerTable } from "@/components/PokerTable";
import { WinnerModal } from "@/components/WinnerModal";
import { TableHistory } from "@/components/TableHistory";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { GameState, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";

export default function Game() {
  const [, params] = useRoute("/game/:tableId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<{
    name: string;
    hand: string;
    isTableWinner: boolean;
  } | null>(null);
  const [roundHistory, setRoundHistory] = useState<any[]>([]);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  useEffect(() => {
    if (!params?.tableId || !user) return;

    const newSocket = io({
      path: "/socket.io",
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      newSocket.emit("join-table", {
        tableId: params.tableId,
        userId: user.id,
      });
    });

    newSocket.on("game-state", (state: GameState) => {
      setGameState(state);
    });

    newSocket.on("round-winner", (data: {
      userId: string;
      username: string;
      handName: string;
      isTableWinner: boolean;
    }) => {
      setWinnerInfo({
        name: data.username,
        hand: data.handName,
        isTableWinner: data.isTableWinner,
      });
      setShowWinner(true);

      // Auto-close modal after 5 seconds
      setTimeout(() => setShowWinner(false), 5000);

      // Update history
      setRoundHistory(prev => [...prev, {
        roundNumber: gameState?.currentRound || 1,
        winnerName: data.username,
        handName: data.handName,
        isTie: false,
      }]);
    });

    newSocket.on("round-tie", () => {
      toast({
        title: "Round Tied",
        description: "Multiple players have identical hands. Moving to next round.",
      });

      setRoundHistory(prev => [...prev, {
        roundNumber: gameState?.currentRound || 1,
        winnerName: null,
        handName: null,
        isTie: true,
      }]);
    });

    newSocket.on("game-ended", (data: { winners: string[]; commission: string }) => {
      toast({
        title: "Game Ended",
        description: `Commission: $${data.commission}. Returning to lobby...`,
      });

      setTimeout(() => {
        setLocation("/lobby");
      }, 5000);
    });

    newSocket.on("error", (data: { message: string }) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: data.message,
      });
      setTimeout(() => setLocation("/lobby"), 2000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [params?.tableId, user?.id]);

  const handleLeaveTable = () => {
    if (socket) {
      socket.close();
    }
    setLocation("/lobby");
  };

  const handleGoToAdmin = () => {
    if (socket) {
      socket.close();
    }
    setLocation("/admin");
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <div className="text-muted-foreground">Joining table...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col relative">
      <header className="absolute top-0 left-0 right-0 z-20 md:relative md:border-b md:border-border md:shadow-sm md:bg-card">
        <div className="max-w-7xl mx-auto px-2 md:px-6 py-2 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLeaveTable}
              data-testid="button-leave-table"
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="hidden md:block">
              <h1 className="text-xl font-display font-bold">{gameState.tableName}</h1>
              <p className="text-sm text-muted-foreground">
                ${gameState.stakeAmount} per round
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <TableHistory rounds={roundHistory} />
            {user?.username === "admin" && (
              <Button variant="outline" size="sm" onClick={handleGoToAdmin} data-testid="button-admin-panel" className="hidden md:flex">
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 md:py-8 mt-12 md:mt-0">
        <PokerTable gameState={gameState} />
      </main>

      {winnerInfo && (
        <WinnerModal
          open={showWinner}
          onClose={() => setShowWinner(false)}
          winnerName={winnerInfo.name}
          handName={winnerInfo.hand}
          isTableWinner={winnerInfo.isTableWinner}
        />
      )}
    </div>
  );
}
