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
      // Refetch tables immediately when a new table is created
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold">Poker Royal</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser && (
              <>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Balance</div>
                  <div className="text-lg font-bold text-accent" data-testid="user-balance">
                    ${currentUser.balance}
                  </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-sm font-medium" data-testid="user-name">
                  {currentUser.username}
                </div>
              </>
            )}
            {currentUser?.username === "admin" && (
              <Button variant="outline" onClick={() => setLocation("/admin")} data-testid="button-admin-panel">
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold mb-2">Available Tables</h2>
          <p className="text-muted-foreground">Join a table to start playing</p>
        </div>

        {tablesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <div className="text-muted-foreground">Loading tables...</div>
          </div>
        ) : Array.isArray(tables) && tables.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="tables-grid">
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
            <Users className="w-16 h-16 text-muted-foreground mx-auto" />
            <div className="text-xl font-medium">No tables available</div>
            <p className="text-muted-foreground">{tables && tables.length === 0 ? 'No tables created yet. Contact an admin to create tables.' : 'Loading...'}</p>
          </div>
        )}
      </main>
    </div>
  );
}
