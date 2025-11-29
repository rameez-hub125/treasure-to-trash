import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeftRight, 
  Search, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Coins,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/admin-layout";
import type { Transaction, User } from "@shared/schema";

type TransactionFilter = "all" | "earned" | "redeemed";

interface TransactionWithUser extends Transaction {
  user?: User;
}

export default function AdminTransactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionFilter>("all");

  const { data: transactions = [], isLoading } = useQuery<TransactionWithUser[]>({
    queryKey: ["/api/admin/transactions"],
  });

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    totalEarned: transactions.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.amount, 0),
    totalRedeemed: transactions.filter(t => t.type === 'redeemed').reduce((sum, t) => sum + t.amount, 0),
    earnedCount: transactions.filter(t => t.type === 'earned').length,
    redeemedCount: transactions.filter(t => t.type === 'redeemed').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Transactions Log</h1>
          <p className="text-muted-foreground">Track all token earnings and redemptions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-earned">
                    {stats.totalEarned.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-redeemed">
                    {stats.totalRedeemed.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Redeemed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-earn-transactions">
                    {stats.earnedCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Earn Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <ArrowLeftRight className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-redeem-transactions">
                    {stats.redeemedCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Redeem Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "earned", "redeemed"] as TransactionFilter[]).map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(type)}
              className="capitalize"
              data-testid={`button-filter-${type}`}
            >
              {type === "all" ? "All" : type}
            </Button>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-transactions"
          />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Transaction History</CardTitle>
            </div>
            <CardDescription>
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <ArrowLeftRight className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground mb-1">No transactions found</p>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Transactions will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={tx.type === 'earned' 
                              ? "bg-primary/10 text-primary border-primary/20" 
                              : "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                            }
                          >
                            {tx.type === 'earned' ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-primary">
                                {tx.user?.name?.charAt(0).toUpperCase() || "U"}
                              </span>
                            </div>
                            <span className="font-medium truncate max-w-32">
                              {tx.user?.name || `User #${tx.userId}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground truncate block max-w-48">
                            {tx.description}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            tx.type === 'earned' ? 'text-primary' : 'text-orange-600 dark:text-orange-400'
                          }`}>
                            {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(tx.date).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
