import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, CheckCircle, XCircle, Clock, Eye, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RedemptionRequest, User } from "@shared/schema";

interface RedemptionWithUser extends RedemptionRequest {
  user?: User;
}

export default function AdminRedemptions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<RedemptionWithUser | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  const { data: requests = [], isLoading } = useQuery<RedemptionWithUser[]>({
    queryKey: ["/api/admin/redemption-requests"],
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return apiRequest("PATCH", `/api/admin/redemption-requests/${requestId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/redemption-requests"] });
      toast({ title: "Success", description: "Redemption approved and coins transferred" });
      setShowDetailsDialog(false);
      setSelectedRequest(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve redemption", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return apiRequest("PATCH", `/api/admin/redemption-requests/${requestId}/reject`, { rejectionReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/redemption-requests"] });
      toast({ title: "Success", description: "Redemption request rejected" });
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectionReason("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject redemption", variant: "destructive" });
    },
  });

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.accountHolder?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "";
    }
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-title">Redemption Requests</h1>
          <p className="text-muted-foreground">Manage user coin redemption requests</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold" data-testid="text-pending-count">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-green-600" data-testid="text-approved-count">{approvedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold text-red-600" data-testid="text-rejected-count">{rejectedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by user name, email, or account holder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No redemption requests found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((req) => (
                      <TableRow key={req.id} data-testid={`row-request-${req.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{req.user?.name}</p>
                            <p className="text-sm text-muted-foreground">{req.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{req.points}</TableCell>
                        <TableCell>{req.bankName}</TableCell>
                        <TableCell className="text-sm">
                          <div>
                            <p>{req.accountNumber}</p>
                            <p className="text-muted-foreground">{req.accountHolder ?? "N/A"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(req.status)} data-testid={`status-${req.id}`}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" data-testid={`button-menu-${req.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedRequest(req);
                                setShowDetailsDialog(true);
                              }} data-testid={`option-view-${req.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {req.status === "pending" && (
                                <>
                                  <DropdownMenuItem onClick={() => approveMutation.mutate(req.id)} data-testid={`option-approve-${req.id}`}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedRequest(req);
                                    setShowRejectDialog(true);
                                  }} data-testid={`option-reject-${req.id}`}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redemption Request Details</DialogTitle>
            <DialogDescription>Review the complete information</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4" data-testid="details-dialog">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">User</label>
                  <p className="font-semibold">{selectedRequest.user?.name}</p>
                  <p className="text-sm">{selectedRequest.user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Points</label>
                  <p className="font-semibold text-lg">{selectedRequest.points}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Bank</label>
                  <p className="font-semibold">{selectedRequest.bankName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Account Number</label>
                  <p className="font-semibold">{selectedRequest.accountNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Account Holder</label>
                  <p className="font-semibold">{selectedRequest.accountHolder}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>
              {selectedRequest.reason && (
                <div>
                  <label className="text-sm text-muted-foreground">Reason</label>
                  <p>{selectedRequest.reason}</p>
                </div>
              )}
              {selectedRequest.rejectionReason && (
                <div>
                  <label className="text-sm text-muted-foreground">Rejection Reason</label>
                  <p>{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)} data-testid="button-close">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Redemption Request</DialogTitle>
            <DialogDescription>Provide a reason for rejection</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            data-testid="input-rejection-reason"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequest && rejectMutation.mutate(selectedRequest.id)}
              disabled={rejectMutation.isPending}
              data-testid="button-reject"
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
