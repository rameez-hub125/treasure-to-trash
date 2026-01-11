import { useUserAuth } from "@/lib/user-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Leaf, Loader2, AlertCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Reward, RedemptionRequest } from "@shared/schema";

const redeemSchema = z.object({
  points: z.coerce.number().min(100, "Minimum 100 points required"),
  bankName: z.string().min(2, "Bank name required"),
  accountNumber: z.string().min(8, "Valid account number required"),
  accountHolder: z.string().min(2, "Account holder name required"),
  reason: z.string().optional(),
});

type RedeemForm = z.infer<typeof redeemSchema>;

export default function RedeemCoins() {
  const { user } = useUserAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) setLocation("/user/login");
  }, [user, setLocation]);

  const { data: rewards } = useQuery<Reward>({
    queryKey: ["/api/users", user?.id, "rewards"],
    enabled: !!user,
  });

  const { data: requests = [] } = useQuery<RedemptionRequest[]>({
    queryKey: ["/api/users", user?.id, "redemption-requests"],
    enabled: !!user,
  });

  const form = useForm<RedeemForm>({
    resolver: zodResolver(redeemSchema),
    defaultValues: { points: 100, bankName: "", accountNumber: "", accountHolder: "", reason: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: RedeemForm) => {
      return apiRequest("POST", `/api/users/${user?.id}/redemption-requests`, data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Redemption request submitted for admin approval" });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "redemption-requests"] });
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit redemption request", variant: "destructive" });
    },
  });

  if (!user) return null;

  const pendingRequests = requests.filter(r => r.status === "pending");
  const approvedRequests = requests.filter(r => r.status === "approved");
  const rejectedRequests = requests.filter(r => r.status === "rejected");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button size="sm" variant="ghost" onClick={() => setLocation("/user/dashboard")} data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Leaf className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold">Redeem Coins</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Current Balance */}
        <Card className="mb-8 hover-elevate">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Available Points</p>
              <p className="text-5xl font-bold text-primary" data-testid="text-available-points">
                {rewards?.points ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Alert */}
        {pendingRequests.length > 0 && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-900 dark:text-yellow-200">Pending Redemptions</p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">You have {pendingRequests.length} request(s) awaiting admin approval</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Redemption Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Redeem Your Coins</CardTitle>
                <CardDescription>Request to transfer your coins to your bank account</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => {
                    setIsSubmitting(true);
                    mutation.mutate(data);
                    setIsSubmitting(false);
                  })} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points to Redeem (min. 100)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              max={rewards?.points ?? 0}
                              data-testid="input-points"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., HBL, UBL, NBP" {...field} data-testid="input-bank-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your bank account number" {...field} data-testid="input-account-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountHolder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Name on the account" {...field} data-testid="input-account-holder" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Why are you redeeming these coins?" {...field} data-testid="input-reason" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting || mutation.isPending || !rewards || rewards.points < 100}
                      className="w-full gap-2"
                      data-testid="button-submit-redemption"
                    >
                      {isSubmitting || mutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Redemption Request"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Request History */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Redemption History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3" data-testid="redemption-history">
                {requests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No redemption requests yet</p>
                ) : (
                  requests.map((req) => (
                    <div key={req.id} className="p-3 rounded-lg bg-muted/50" data-testid={`request-${req.id}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{req.points} coins</p>
                          <p className="text-xs text-muted-foreground">{req.bankName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(req.status)}`} data-testid={`status-${req.id}`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
