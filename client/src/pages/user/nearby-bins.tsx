import { useUserAuth } from "@/lib/user-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Leaf, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import type { Bin } from "@shared/schema";

export default function NearbyBins() {
  const { user } = useUserAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/user/login");
    }
  }, [user, setLocation]);

  const { data: bins, isLoading } = useQuery<Bin[]>({
    queryKey: ["/api/bins"],
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button size="sm" variant="ghost" onClick={() => setLocation("/user/dashboard")} data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">Zero-to-Hero</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2" data-testid="text-title">
          Nearby Waste Bins
        </h1>
        <p className="text-muted-foreground mb-8">Find waste collection bins near you</p>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              Loading nearby bins...
            </CardContent>
          </Card>
        ) : bins && bins.length > 0 ? (
          <div className="space-y-4" data-testid="list-bins">
            {bins.map((bin) => (
              <Card key={bin.id} className="hover-elevate" data-testid={`card-bin-${bin.id}`}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1" data-testid={`text-location-${bin.id}`}>
                          {bin.location}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Coordinates: {bin.latitude}, {bin.longitude}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span data-testid={`text-capacity-${bin.id}`}>
                            <strong>Capacity:</strong> {bin.capacity} kg
                          </span>
                          <span 
                            className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium"
                            data-testid={`badge-status-${bin.id}`}
                          >
                            {bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No waste bins available yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
