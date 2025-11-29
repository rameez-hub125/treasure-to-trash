import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Gift, 
  Plus, 
  Edit2, 
  Trash2, 
  Coins,
  Check,
  X,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Reward } from "@shared/schema";

interface RewardFormData {
  name: string;
  description: string;
  points: number;
  collectionInfo: string;
  isAvailable: boolean;
}

const defaultFormData: RewardFormData = {
  name: "",
  description: "",
  points: 0,
  collectionInfo: "",
  isAvailable: true,
};

export default function AdminRewards() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState<RewardFormData>(defaultFormData);
  const { toast } = useToast();

  const { data: rewards = [], isLoading } = useQuery<Reward[]>({
    queryKey: ["/api/admin/rewards"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: RewardFormData) => {
      return apiRequest("POST", "/api/admin/rewards", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rewards"] });
      toast({
        title: "Reward created",
        description: "New reward has been created successfully.",
      });
      setShowCreateDialog(false);
      setFormData(defaultFormData);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<RewardFormData> }) => {
      return apiRequest("PATCH", `/api/admin/rewards/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rewards"] });
      toast({
        title: "Reward updated",
        description: "Reward has been updated successfully.",
      });
      setShowEditDialog(false);
      setSelectedReward(null);
      setFormData(defaultFormData);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/rewards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rewards"] });
      toast({
        title: "Reward deleted",
        description: "Reward has been deleted successfully.",
      });
      setShowDeleteDialog(false);
      setSelectedReward(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: number; isAvailable: boolean }) => {
      return apiRequest("PATCH", `/api/admin/rewards/${id}`, { isAvailable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rewards"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredRewards = rewards.filter((reward) =>
    reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reward.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (selectedReward) {
      updateMutation.mutate({ id: selectedReward.id, data: formData });
    }
  };

  const handleDelete = () => {
    if (selectedReward) {
      deleteMutation.mutate(selectedReward.id);
    }
  };

  const openEditDialog = (reward: Reward) => {
    setSelectedReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description || "",
      points: reward.points,
      collectionInfo: reward.collectionInfo,
      isAvailable: reward.isAvailable,
    });
    setShowEditDialog(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Rewards Management</h1>
            <p className="text-muted-foreground">Create and manage reward offerings</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2" data-testid="button-create-reward">
            <Plus className="h-4 w-4" />
            Create Reward
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rewards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-rewards"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRewards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">No rewards found</p>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try a different search term" : "Create your first reward to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Reward
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => (
              <Card key={reward.id} className="hover-elevate transition-all duration-300" data-testid={`card-reward-${reward.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Gift className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={reward.isAvailable ? "default" : "secondary"}
                        className={reward.isAvailable ? "bg-primary/10 text-primary border-primary/20" : ""}
                      >
                        {reward.isAvailable ? (
                          <><Check className="h-3 w-3 mr-1" />Available</>
                        ) : (
                          <><X className="h-3 w-3 mr-1" />Unavailable</>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">{reward.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {reward.description || "No description provided"}
                  </p>

                  <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                    <Coins className="h-5 w-5" />
                    <span>{reward.points} points</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={reward.isAvailable}
                        onCheckedChange={(checked) => {
                          toggleAvailabilityMutation.mutate({ id: reward.id, isAvailable: checked });
                        }}
                        data-testid={`switch-availability-${reward.id}`}
                      />
                      <span className="text-sm text-muted-foreground">Active</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditDialog(reward)}
                        data-testid={`button-edit-reward-${reward.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedReward(reward);
                          setShowDeleteDialog(true);
                        }}
                        data-testid={`button-delete-reward-${reward.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Reward</DialogTitle>
            <DialogDescription>
              Add a new reward that users can redeem with their tokens
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Eco-Friendly Water Bottle"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-reward-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the reward..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-reward-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Points Required</Label>
              <Input
                id="points"
                type="number"
                placeholder="100"
                value={formData.points || ""}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                data-testid="input-reward-points"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collectionInfo">Collection Information</Label>
              <Textarea
                id="collectionInfo"
                placeholder="How to collect this reward..."
                value={formData.collectionInfo}
                onChange={(e) => setFormData({ ...formData, collectionInfo: e.target.value })}
                data-testid="input-reward-collection"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isAvailable}
                onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                data-testid="switch-reward-available"
              />
              <Label>Available for redemption</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!formData.name || !formData.points || createMutation.isPending}
              data-testid="button-confirm-create"
            >
              {createMutation.isPending ? "Creating..." : "Create Reward"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reward</DialogTitle>
            <DialogDescription>
              Update the reward details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-edit-reward-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-edit-reward-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-points">Points Required</Label>
              <Input
                id="edit-points"
                type="number"
                value={formData.points || ""}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                data-testid="input-edit-reward-points"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-collectionInfo">Collection Information</Label>
              <Textarea
                id="edit-collectionInfo"
                value={formData.collectionInfo}
                onChange={(e) => setFormData({ ...formData, collectionInfo: e.target.value })}
                data-testid="input-edit-reward-collection"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isAvailable}
                onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                data-testid="switch-edit-reward-available"
              />
              <Label>Available for redemption</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEdit}
              disabled={!formData.name || !formData.points || updateMutation.isPending}
              data-testid="button-confirm-edit"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reward</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedReward?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
