import { useUserAuth } from "@/lib/user-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Leaf, ArrowLeft, Plus } from "lucide-react";
import type { Report } from "@shared/schema";

export default function MyReports() {
  const { user } = useUserAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/user/login");
    }
  }, [user, setLocation]);

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/users", user?.id, "reports"],
    enabled: !!user,
  });

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "verified":
      case "collected":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button size="sm" variant="ghost" onClick={() => setLocation("/user/dashboard")} data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold">Trash-to-Treasure</span>
            </div>
          </div>
          <Button className="gap-2" onClick={() => setLocation("/user/report")} data-testid="button-new-report">
            <Plus className="h-4 w-4" />
            New Report
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" data-testid="text-title">
          My Reports
        </h1>

        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading reports...
            </CardContent>
          </Card>
        ) : reports && reports.length > 0 ? (
          <div className="space-y-4" data-testid="list-reports">
            {reports.map((report) => (
              <Card key={report.id} className="hover-elevate" data-testid={`card-report-${report.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2" data-testid={`text-location-${report.id}`}>
                        {report.location}
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p data-testid={`text-type-${report.id}`}>
                          <strong>Type:</strong> {report.wasteType}
                        </p>
                        <p data-testid={`text-amount-${report.id}`}>
                          <strong>Amount:</strong> {report.amount} kg
                        </p>
                        <p data-testid={`text-date-${report.id}`}>
                          <strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(report.status)} data-testid={`badge-status-${report.id}`}>
                      {report.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No reports yet</p>
              <Button onClick={() => setLocation("/user/report")} data-testid="button-create-report">
                Create Your First Report
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
