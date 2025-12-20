import { useUserAuth } from "@/lib/user-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Leaf, LogOut, Plus, List, Gift, TrendingUp, Coins, MapPin } from "lucide-react";
import type { Report, Transaction, Reward } from "@shared/schema";

export default function UserDashboard() {
  const { user, logout } = useUserAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/user/login");
    }
  }, [user, setLocation]);

  const { data: reports } = useQuery<Report[]>({
    queryKey: ["/api/users", user?.id, "reports"],
    enabled: !!user,
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/users", user?.id, "transactions"],
    enabled: !!user,
  });

  const { data: rewards } = useQuery<Reward>({
    queryKey: ["/api/users", user?.id, "rewards"],
    enabled: !!user,
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">Zero-to-Hero</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground" data-testid="text-user-name">
              {user.name}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-welcome">
            Welcome, {user.name}!
          </h1>
          <p className="text-muted-foreground">Manage your waste reports and rewards</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your Points</p>
                  <p className="text-3xl font-bold" data-testid="text-points">
                    {rewards?.points ?? 0}
                  </p>
                </div>
                <Coins className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reports</p>
                  <p className="text-3xl font-bold" data-testid="text-report-count">
                    {reports?.length ?? 0}
                  </p>
                </div>
                <List className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Level</p>
                  <p className="text-3xl font-bold" data-testid="text-level">
                    {rewards?.level ?? 1}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your contribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full gap-2"
                onClick={() => setLocation("/user/report")}
                data-testid="button-report-waste"
              >
                <Plus className="h-4 w-4" />
                Report Waste
              </Button>
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={() => setLocation("/user/reports")}
                data-testid="button-view-reports"
              >
                <List className="h-4 w-4" />
                View My Reports
              </Button>
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={() => setLocation("/user/rewards")}
                data-testid="button-view-rewards"
              >
                <Gift className="h-4 w-4" />
                View Rewards
              </Button>
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={() => setLocation("/user/nearby-bins")}
                data-testid="button-view-bins"
              >
                <MapPin className="h-4 w-4" />
                Find Nearby Bins
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-3" data-testid="list-transactions">
                  {transactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      data-testid={`item-transaction-${tx.id}`}
                    >
                      <span className="text-sm text-muted-foreground">{tx.description}</span>
                      <span className={`font-semibold ${tx.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No transactions yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
