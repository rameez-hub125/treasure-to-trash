import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin-layout";
import { queryClient } from "@/lib/queryClient";
import type { Bin } from "@shared/schema";

export default function AdminBins() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    latitude: "",
    longitude: "",
    capacity: "",
    status: "active",
  });

  const { data: bins, isLoading } = useQuery<Bin[]>({
    queryKey: ["/api/admin/bins"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/admin/bins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create bin");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bins"] });
      setFormData({ location: "", latitude: "", longitude: "", capacity: "", status: "active" });
      setOpen(false);
      toast({
        title: "Success",
        description: "Bin location added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add bin location",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/bins/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete bin");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bins"] });
      toast({
        title: "Success",
        description: "Bin location deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete bin location",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-title">Bin Locations</h1>
            <p className="text-muted-foreground">Manage waste bin locations</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-bin">
                <Plus className="h-4 w-4" />
                Add Bin Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Bin Location</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location Name</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Main Street Corner"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    data-testid="input-location"
                    disabled={createMutation.isPending}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      placeholder="e.g., 40.7128"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      required
                      data-testid="input-latitude"
                      disabled={createMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      placeholder="e.g., -74.0060"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      required
                      data-testid="input-longitude"
                      disabled={createMutation.isPending}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (kg)</Label>
                  <Input
                    id="capacity"
                    placeholder="e.g., 100"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                    data-testid="input-capacity"
                    disabled={createMutation.isPending}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {createMutation.isPending ? "Adding..." : "Add Bin Location"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Bin Locations</CardTitle>
            <CardDescription>View and manage all waste bin locations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading bin locations...</div>
            ) : bins && bins.length > 0 ? (
              <div className="overflow-x-auto" data-testid="table-bins">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Coordinates</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bins.map((bin) => (
                      <TableRow key={bin.id} data-testid={`row-bin-${bin.id}`}>
                        <TableCell className="font-medium" data-testid={`text-location-${bin.id}`}>
                          {bin.location}
                        </TableCell>
                        <TableCell data-testid={`text-coords-${bin.id}`}>
                          {bin.latitude}, {bin.longitude}
                        </TableCell>
                        <TableCell data-testid={`text-capacity-${bin.id}`}>{bin.capacity} kg</TableCell>
                        <TableCell>
                          <Badge 
                            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            data-testid={`badge-status-${bin.id}`}
                          >
                            {bin.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(bin.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${bin.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No bin locations added yet. Add your first bin location!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
