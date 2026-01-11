import { useUserAuth } from "@/lib/user-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Leaf, ArrowLeft, Loader2 } from "lucide-react";
import type { Transaction, Reward } from "@shared/schema";

export default function RewardsHistory() {
  const { user } = useUserAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/user/login");
    }
  }, [user, setLocation]);

  const { data: transactions, isLoading: transLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/users", user?.id, "transactions"],
    enabled: !!user,
  });

  const { data: rewards } = useQuery<Reward>({
    queryKey: ["/api/users", user?.id, "rewards"],
    enabled: !!user,
  });

  if (!user) return null;

  const earnedTransactions = transactions?.filter(t => t.type === "earned") || [];
  const redeemedTransactions = transactions?.filter(t => t.type === "redeemed") || [];
  const totalEarned = earnedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalRedeemed = redeemedTransactions.reduce((sum, t) => sum + t.amount, 0);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 5: return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case 4: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case 3: return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case 2: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getLevelName = (level: number) => {
    const names = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
    return names[level - 1] || "Bronze";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button size="sm" variant="ghost" onClick={() => setLocation("/user/dashboard")} data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">Trash-to-Treasure</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" data-testid="text-title">
          Your Rewards History
        </h1>

        {/* Current Status Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Current Points</p>
                <p className="text-4xl font-bold" data-testid="text-current-points">
                  {rewards?.points ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Your Level</p>
                <div className="space-y-2">
                  <p className="text-3xl font-bold" data-testid="text-level">
                    {rewards?.level ?? 1}
                  </p>
                  <Badge className={getLevelColor(rewards?.level ?? 1)} data-testid="badge-level-name">
                    {getLevelName(rewards?.level ?? 1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                <p className="text-3xl font-bold text-green-600" data-testid="text-earned">
                  {totalEarned}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Redeemed</p>
                <p className="text-3xl font-bold text-red-600" data-testid="text-redeemed">
                  {totalRedeemed}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progression */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Level Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" data-testid="level-progression">
              {[
                { level: 1, name: "Bronze", points: "0+", color: "bg-gray-100 dark:bg-gray-900/30" },
                { level: 2, name: "Silver", points: "500+", color: "bg-yellow-100 dark:bg-yellow-900/30" },
                { level: 3, name: "Gold", points: "1,500+", color: "bg-green-100 dark:bg-green-900/30" },
                { level: 4, name: "Platinum", points: "3,000+", color: "bg-blue-100 dark:bg-blue-900/30" },
                { level: 5, name: "Diamond", points: "5,000+", color: "bg-purple-100 dark:bg-purple-900/30" },
              ].map((tier) => (
                <div key={tier.level} className={`p-4 rounded-lg ${tier.color} ${rewards?.level === tier.level ? 'ring-2 ring-primary' : ''}`} data-testid={`tier-${tier.level}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{tier.name} - {tier.points} points</span>
                    {rewards?.level === tier.level && (
                      <Badge variant="default" data-testid={`badge-current-tier`}>Current</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transactions History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                Loading transactions...
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3" data-testid="transactions-list">
                {transactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-start justify-between py-3 px-4 bg-muted/50 rounded-lg hover-elevate"
                      data-testid={`transaction-${tx.id}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground" data-testid={`tx-description-${tx.id}`}>
                          {tx.description}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`tx-date-${tx.id}`}>
                          {new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={tx.type === "earned" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}
                          data-testid={`tx-type-${tx.id}`}
                        >
                          {tx.type === "earned" ? "+" : "-"}{tx.amount}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No transactions yet</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
