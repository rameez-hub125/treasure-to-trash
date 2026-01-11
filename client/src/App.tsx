import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { UserAuthProvider } from "@/lib/user-auth";
import Home from "@/pages/home";
import UserLogin from "@/pages/user-login";
import UserDashboard from "@/pages/user/dashboard";
import ReportWaste from "@/pages/user/report";
import MyReports from "@/pages/user/reports";
import NearbyBins from "@/pages/user/nearby-bins";
import RewardsHistory from "@/pages/user/rewards-history";
import RedeemCoins from "@/pages/user/redeem-coins";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminReports from "@/pages/admin/reports";
import AdminRewards from "@/pages/admin/rewards";
import AdminTransactions from "@/pages/admin/transactions";
import AdminNotifications from "@/pages/admin/notifications";
import AdminBins from "@/pages/admin/bins";
import AdminRedemptions from "@/pages/admin/redemptions";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/user/login" component={UserLogin} />
      <Route path="/user/dashboard" component={UserDashboard} />
      <Route path="/user/report" component={ReportWaste} />
      <Route path="/user/reports" component={MyReports} />
      <Route path="/user/nearby-bins" component={NearbyBins} />
      <Route path="/user/rewards-history" component={RewardsHistory} />
      <Route path="/user/redeem-coins" component={RedeemCoins} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/rewards" component={AdminRewards} />
      <Route path="/admin/transactions" component={AdminTransactions} />
      <Route path="/admin/notifications" component={AdminNotifications} />
      <Route path="/admin/bins" component={AdminBins} />
      <Route path="/admin/redemptions" component={AdminRedemptions} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserAuthProvider>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </UserAuthProvider>
    </QueryClientProvider>
  );
}
