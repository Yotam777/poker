import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TableCard } from "@/components/TableCard";
import { Button } from "@/components/ui/button";
import { Coins, LogOut, Users, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { io } from "socket.io-client";

interface LobbyTable extends Table {
  playerCount: number;
  playerNames: string[];
}

export default function Lobby() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: tables = [], isLoading: tablesLoading } = useQuery<LobbyTable[]>({
    queryKey: ["/api/tables"],
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  // Listen for real-time table updates
  useEffect(() => {
    const socket = io();
    
    socket.on("table-created", () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
    });
    
    socket.on("tables-updated", () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
    });
    
    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setLocation("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout",
      });
    }
  };

  const handleJoinTable = async (tableId: string) => {
    const table = tables?.find(t => t.id === tableId);
    if (!table || !currentUser) return;

    const requiredBalance = parseFloat(table.stakeAmount) * 3;
    const userBalance = parseFloat(currentUser.balance);

    if (userBalance < requiredBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You need at least $${requiredBalance.toFixed(2)} to join this table (3 rounds × $${table.stakeAmount})`,
      });
      return;
    }

    setLocation(`/game/${tableId}`);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border shadow-sm bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Coins className="w-4 sm:w-5 h-4 sm:h-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg sm:text-2xl font-display font-bold truncate">Poker Royal</h1>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-4 flex-wrap justify-end">
              {currentUser && (
                <>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs sm:text-sm text-muted-foreground">Balance</div>
                    <div className="text-sm sm:text-lg font-bold text-accent" data-testid="user-balance">
                      ${currentUser.balance}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-center hidden sm:block px-2">
                    {currentUser.username}
                  </div>
                </>
              )}
              {currentUser?.username === "admin" && (
                <Button size="sm" variant="outline" onClick={() => setLocation("/admin")} data-testid="button-admin-panel" className="text-xs sm:text-sm">
                  <Settings className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleLogout} data-testid="button-logout" className="text-xs sm:text-sm">
                <LogOut className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-1 sm:mb-2">Available Tables</h2>
          <p className="text-xs sm:text-base text-muted-foreground">Join a table to start playing</p>
        </div>

        {tablesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <div className="text-muted-foreground">Loading tables...</div>
          </div>
        ) : Array.isArray(tables) && tables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6" data-testid="tables-grid">
            {tables.map((table) => {
              if (!table || !table.id) return null;
              return (
                <TableCard
                  key={table.id}
                  table={table}
                  playerCount={table.playerCount || 0}
                  playerNames={table.playerNames || []}
                  onJoin={handleJoinTable}
                  canJoin={currentUser !== null && (table.playerCount || 0) < (table.maxPlayers || 6)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <Users className="w-12 sm:w-16 h-12 sm:h-16 text-muted-foreground mx-auto" />
            <div className="text-lg sm:text-xl font-medium">No tables available</div>
            <p className="text-sm sm:text-base text-muted-foreground">{tables && tables.length === 0 ? 'No tables created yet. Contact an admin to create tables.' : 'Loading...'}</p>
          </div>
        )}
      </main>
    </div>
  );
}
