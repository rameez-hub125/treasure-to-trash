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
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminReports from "@/pages/admin/reports";
import AdminRewards from "@/pages/admin/rewards";
import AdminTransactions from "@/pages/admin/transactions";
import AdminNotifications from "@/pages/admin/notifications";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/user/login" component={UserLogin} />
      <Route path="/user/dashboard" component={UserDashboard} />
      <Route path="/user/report" component={ReportWaste} />
      <Route path="/user/reports" component={MyReports} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/rewards" component={AdminRewards} />
      <Route path="/admin/transactions" component={AdminTransactions} />
      <Route path="/admin/notifications" component={AdminNotifications} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </UserAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
