import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Bell, 
  Send, 
  Search, 
  Calendar, 
  User,
  CheckCircle,
  Circle,
  Megaphone,
  AlertCircle,
  Info,
  Gift
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Notification, User as UserType } from "@shared/schema";

interface NotificationWithUser extends Notification {
  user?: UserType;
}

const notificationTypes = [
  { value: "announcement", label: "Announcement", icon: Megaphone },
  { value: "alert", label: "Alert", icon: AlertCircle },
  { value: "info", label: "Information", icon: Info },
  { value: "reward", label: "Reward", icon: Gift },
];

export default function AdminNotifications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [notificationType, setNotificationType] = useState("announcement");
  const [targetUser, setTargetUser] = useState("all");
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery<NotificationWithUser[]>({
    queryKey: ["/api/admin/notifications"],
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (data: { message: string; type: string; userId?: number }) => {
      return apiRequest("POST", "/api/admin/notifications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      toast({
        title: "Notification sent",
        description: targetUser === "all" 
          ? "Notification has been sent to all users." 
          : "Notification has been sent to the selected user.",
      });
      setMessage("");
      setNotificationType("announcement");
      setTargetUser("all");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredNotifications = notifications.filter((notification) =>
    notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendNotification = () => {
    if (!message.trim()) return;

    const data: { message: string; type: string; userId?: number } = {
      message,
      type: notificationType,
    };

    if (targetUser !== "all") {
      data.userId = parseInt(targetUser);
    }

    sendNotificationMutation.mutate(data);
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    const Icon = typeConfig?.icon || Bell;
    return <Icon className="h-4 w-4" />;
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'alert':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'reward':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
          <p className="text-muted-foreground">Send announcements and manage user notifications</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Send Notification
            </CardTitle>
            <CardDescription>Compose and send a notification to users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Notification Type</Label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger id="type" data-testid="select-notification-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Send To</Label>
                  <Select value={targetUser} onValueChange={setTargetUser}>
                    <SelectTrigger id="target" data-testid="select-target-user">
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your notification message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  data-testid="input-notification-message"
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleSendNotification}
                  disabled={!message.trim() || sendNotificationMutation.isPending}
                  className="gap-2"
                  data-testid="button-send-notification"
                >
                  {sendNotificationMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Notification
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-notifications"
          />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Sent Notifications</CardTitle>
            </div>
            <CardDescription>
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground mb-1">No notifications found</p>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Sent notifications will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.map((notification) => (
                      <TableRow key={notification.id} data-testid={`row-notification-${notification.id}`}>
                        <TableCell>
                          <Badge variant="outline" className={getTypeBadgeColor(notification.type)}>
                            {getTypeIcon(notification.type)}
                            <span className="ml-1 capitalize">{notification.type}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium truncate max-w-32">
                              {notification.user?.name || `User #${notification.userId}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground line-clamp-2 max-w-64">
                            {notification.message}
                          </span>
                        </TableCell>
                        <TableCell>
                          {notification.isRead ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Read
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Circle className="h-3 w-3 mr-1" />
                              Unread
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
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
