import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Edit, Ban, Trash2, Settings as SettingsIcon, LogOut, Coins, Users, DollarSign, TrendingUp, TableProperties, History, Home } from "lucide-react";
import { User, Settings } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Metrics {
  totalPlayers: number;
  activePlayers: number;
  totalTables: number;
  totalCommissionCollected: string;
  totalPotsDistributed: string;
  commissionRate: string;
  gamesCompleted: number;
}

interface AuditLog {
  id: string;
  eventType: string;
  gameId?: string;
  userId?: string;
  details?: any;
  createdAt: string;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createTableDialogOpen, setCreateTableDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [editAdminDialogOpen, setEditAdminDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: user, isLoading: userLoading, refetch: refetchUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/admin/settings"],
  });

  const { data: metrics } = useQuery<Metrics>({
    queryKey: ["/api/admin/metrics"],
  });

  const { data: auditLogs } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/audit-logs"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; balance: string }) => {
      return await apiRequest("POST", "/api/admin/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User created successfully" });
      setCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create user" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      return await apiRequest("PATCH", `/api/admin/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User updated successfully" });
      setEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update user" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/users/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User deleted successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete user" });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { commissionRate: string }) => {
      return await apiRequest("PATCH", "/api/admin/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Success", description: "Settings updated successfully" });
      setSettingsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update settings" });
    },
  });

  const createTableMutation = useMutation({
    mutationFn: async (data: { name: string; stakeAmount: string; password?: string; isPrivate: boolean }) => {
      return await apiRequest("POST", "/api/admin/tables", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      toast({ title: "Success", description: "Table created successfully" });
      setCreateTableDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create table" });
    },
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLocation("/");
  };

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createUserMutation.mutate({
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      balance: formData.get("balance") as string,
    });
  };

  const handleEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;
    const formData = new FormData(e.currentTarget);
    updateUserMutation.mutate({
      id: selectedUser.id,
      data: {
        balance: formData.get("balance") as string,
      },
    });
  };

  const handleToggleSuspend = (user: User) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { isSuspended: !user.isSuspended },
    });
  };

  const handleUpdateSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateSettingsMutation.mutate({
      commissionRate: formData.get("commissionRate") as string,
    });
  };

  const handleCreateTable = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    createTableMutation.mutate({
      name: formData.get("tableName") as string,
      stakeAmount: formData.get("stakeAmount") as string,
      password: (formData.get("isPrivate") as string) === "on" ? (formData.get("password") as string) : undefined,
      isPrivate: (formData.get("isPrivate") as string) === "on",
    }, {
      onSuccess: () => {
        form.reset();
        const passwordField = document.getElementById('passwordField');
        if (passwordField) passwordField.style.display = 'none';
      }
    });
  };

  const handleEditAdminBalance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    updateUserMutation.mutate({
      id: user.id,
      data: {
        balance: formData.get("adminBalance") as string,
      },
    }, {
      onSuccess: () => {
        refetchUser();
        setEditAdminDialogOpen(false);
        toast({ title: "Success", description: "Your balance has been updated" });
      }
    });
  };

  const totalPlayers = users?.length || 0;
  const activePlayers = users?.filter(u => !u.isSuspended).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border shadow-sm bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Poker Royal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="text-right mr-2">
                  <div className="text-xs text-muted-foreground">Your Balance</div>
                  <div className="text-lg font-bold text-accent">${user.balance}</div>
                </div>
                <Dialog open={editAdminDialogOpen} onOpenChange={setEditAdminDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-edit-admin-balance">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit Balance
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Your Balance</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditAdminBalance} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminBalance">Balance ($)</Label>
                        <Input
                          id="adminBalance"
                          name="adminBalance"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={user.balance}
                          required
                          data-testid="input-admin-balance"
                        />
                      </div>
                      <Button type="submit" className="w-full" data-testid="button-save-admin-balance">
                        Update Balance
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
            <Button variant="ghost" onClick={() => setLocation("/lobby")} data-testid="button-to-lobby">
              <Home className="w-4 h-4 mr-2" />
              Play Games
            </Button>
            <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Dashboard Metrics */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-4">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="stat-total-players">{metrics?.totalPlayers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{metrics?.activePlayers || 0} active</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TableProperties className="w-4 h-4" />
                  Tables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary" data-testid="stat-total-tables">{metrics?.totalTables || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Commission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent" data-testid="stat-commission">${metrics?.totalCommissionCollected || "0"}</div>
                <p className="text-xs text-muted-foreground mt-1">{metrics?.commissionRate}% rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="stat-games">{metrics?.gamesCompleted || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">completed</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold">Player Management</h3>
                <p className="text-sm text-muted-foreground">Create and manage player accounts</p>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="button-open-settings">
                      <SettingsIcon className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Commission Settings</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateSettings} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                        <Input
                          id="commissionRate"
                          name="commissionRate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          defaultValue={settings?.commissionRate || "5.00"}
                          required
                          data-testid="input-commission-rate"
                        />
                      </div>
                      <Button type="submit" className="w-full" data-testid="button-save-settings">
                        Save Settings
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-user">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          required
                          data-testid="input-create-username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          data-testid="input-create-password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="balance">Initial Balance</Label>
                        <Input
                          id="balance"
                          name="balance"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue="100.00"
                          required
                          data-testid="input-create-balance"
                        />
                      </div>
                      <Button type="submit" className="w-full" data-testid="button-submit-create">
                        Create User
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {usersLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <div className="text-muted-foreground">Loading users...</div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.filter(u => !u.isAdmin).map(user => (
                        <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>
                            <span className="font-mono">${user.balance}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isSuspended ? "destructive" : "secondary"}>
                              {user.isSuspended ? "Suspended" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user);
                                setEditDialogOpen(true);
                              }}
                              data-testid={`button-edit-${user.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleSuspend(user)}
                              data-testid={`button-suspend-${user.id}`}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              data-testid={`button-delete-${user.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold">Table Management</h3>
                <p className="text-sm text-muted-foreground">Create and manage poker tables</p>
              </div>
              
              <Dialog open={createTableDialogOpen} onOpenChange={setCreateTableDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-table">
                    <TableProperties className="w-4 h-4 mr-2" />
                    Create Table
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Table</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTable} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tableName">Table Name</Label>
                      <Input
                        id="tableName"
                        name="tableName"
                        placeholder="e.g., High Stakes Table"
                        required
                        data-testid="input-table-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stakeAmount">Stake Amount ($)</Label>
                      <Input
                        id="stakeAmount"
                        name="stakeAmount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="10.00"
                        required
                        data-testid="input-stake-amount"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        name="isPrivate"
                        data-testid="checkbox-private"
                        className="w-4 h-4 rounded"
                      />
                      <Label htmlFor="isPrivate" className="font-normal">Make Private (Password Protected)</Label>
                    </div>
                    <div className="space-y-2" id="passwordField" style={{ display: 'none' }}>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter password"
                        data-testid="input-table-password"
                      />
                    </div>
                    <Button type="submit" className="w-full" data-testid="button-submit-table">
                      Create Table
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <TableProperties className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Tables are automatically created when players join, or you can create custom tables above.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <div>
              <h3 className="text-xl font-display font-bold">Audit Logs</h3>
              <p className="text-sm text-muted-foreground">Game events and system activity</p>
            </div>

            <Card>
              <CardContent className="p-0">
                {auditLogs && auditLogs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Type</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Game</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.slice(0, 50).map(log => (
                        <TableRow key={log.id} data-testid={`audit-log-${log.id}`}>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{log.eventType}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.userId ? log.userId.slice(0, 8) : '-'}</TableCell>
                          <TableCell className="text-sm">{log.gameId ? log.gameId.slice(0, 8) : '-'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No audit logs yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-balance">Balance</Label>
              <Input
                id="edit-balance"
                name="balance"
                type="number"
                step="0.01"
                min="0"
                defaultValue={selectedUser?.balance}
                required
                data-testid="input-edit-balance"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="button-submit-edit">
              Update Balance
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <script>{`
        document.getElementById('isPrivate')?.addEventListener('change', (e) => {
          document.getElementById('passwordField').style.display = e.target.checked ? 'block' : 'none';
        });
      `}</script>
    </div>
  );
}
