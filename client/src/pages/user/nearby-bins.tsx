import { useUserAuth } from "@/lib/user-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Leaf, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import type { Bin } from "@shared/schema";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // ✅ REQUIRED

// ✅ Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function NearbyBins() {
  const { user } = useUserAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) setLocation("/user/login");
  }, [user, setLocation]);

  const { data: bins, isLoading } = useQuery<Bin[]>({
    queryKey: ["/api/bins"],
    enabled: !!user,
    refetchInterval: 5000,
  });

  if (!user) return null;

  const center: [number, number] =
    bins && bins.length
      ? [Number(bins[0].latitude), Number(bins[0].longitude)]
      : [24.8607, 67.0011]; // Karachi

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setLocation("/user/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">Trash-to-Treasure</span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Nearby Waste Bins</h1>
        <p className="text-muted-foreground mb-6">
          Live map view (auto-updated)
        </p>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              Loading bins...
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 🗺️ MAP */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Bin Locations</CardTitle>
              </CardHeader>
              <CardContent>
                {/* ✅ FIXED HEIGHT CONTAINER */}
                <div className="w-full h-[400px] rounded-lg overflow-hidden">
                  <MapContainer
                    center={center}
                    zoom={13}
                    scrollWheelZoom
                    className="w-full h-full"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {bins?.map((bin) => (
                      <Marker
                        key={bin.id}
                        position={[
                          Number(bin.latitude),
                          Number(bin.longitude),
                        ]}
                      >
                        <Popup>
                          <strong>{bin.location}</strong>
                          <br />
                          Capacity: {bin.capacity} kg
                          <br />
                          Status: {bin.status}
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>

            {/* 📋 LIST */}
            <div className="space-y-4">
              {bins?.length ? (
                bins.map((bin) => (
                  <Card key={bin.id}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {bin.location}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {bin.latitude}, {bin.longitude}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    No bins available
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
