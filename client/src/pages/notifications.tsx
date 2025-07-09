import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bell, CheckCircle, AlertCircle, Info, AlertTriangle, 
  Check, Bookmark, Trash2, Settings as SettingsIcon 
} from "lucide-react";
import type { Notification } from "@shared/schema";

export default function Notifications() {
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkMarkAsReadMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map(id => apiRequest("PATCH", `/api/notifications/${id}/read`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      setSelectedNotifications([]);
      toast({
        title: "Notifications marked as read",
        description: `${selectedNotifications.length} notifications marked as read.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark notifications as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "error":
        return AlertCircle;
      case "info":
      default:
        return Info;
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      case "info":
      default:
        return "text-blue-600";
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "info":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications?.filter((notification: Notification) => {
    if (activeTab === "unread") return !notification.isRead;
    if (activeTab === "read") return notification.isRead;
    return true; // all
  }) || [];

  const handleSelectNotification = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedNotifications([...selectedNotifications, id]);
    } else {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredNotifications.map((n: Notification) => n.id);
      setSelectedNotifications(allIds);
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleBulkMarkAsRead = () => {
    const unreadSelectedIds = selectedNotifications.filter(id => {
      const notification = notifications?.find((n: Notification) => n.id === id);
      return notification && !notification.isRead;
    });
    
    if (unreadSelectedIds.length > 0) {
      bulkMarkAsReadMutation.mutate(unreadSelectedIds);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Sidebar />
        <main className="ml-64">
          <TopBar title="Notifications" subtitle="Stay updated with your business alerts and updates" />
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      
      <main className="ml-64">
        <TopBar title="Notifications" subtitle="Stay updated with your business alerts and updates" />

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-neutral-900">Notifications</h2>
              {unreadCount?.count > 0 && (
                <Badge variant="destructive">
                  {unreadCount.count} unread
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {selectedNotifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkMarkAsRead}
                  disabled={bulkMarkAsReadMutation.isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark Selected as Read
                </Button>
              )}
              <Button variant="outline" size="sm">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          <Card className="shadow-sm border border-neutral-200">
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="read">Read</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">
                    {activeTab === "unread" 
                      ? "No unread notifications" 
                      : activeTab === "read" 
                        ? "No read notifications"
                        : "No notifications yet"
                    }
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {activeTab === "unread" 
                      ? "You're all caught up!"
                      : "Notifications will appear here when you receive them."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Select All Header */}
                  <div className="flex items-center p-3 border-b border-neutral-200">
                    <Checkbox
                      checked={selectedNotifications.length === filteredNotifications.length}
                      onCheckedChange={handleSelectAll}
                      className="mr-3"
                    />
                    <span className="text-sm text-neutral-600">
                      {selectedNotifications.length > 0 
                        ? `${selectedNotifications.length} selected`
                        : "Select all"
                      }
                    </span>
                  </div>

                  {/* Notifications List */}
                  {filteredNotifications.map((notification: Notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const iconColor = getNotificationIconColor(notification.type);
                    const isSelected = selectedNotifications.includes(notification.id);

                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start p-4 hover:bg-neutral-50 transition-colors border-l-4 ${
                          notification.isRead 
                            ? "border-l-transparent bg-neutral-25" 
                            : "border-l-primary bg-blue-50/50"
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleSelectNotification(notification.id, checked as boolean)
                          }
                          className="mr-3 mt-1"
                        />
                        
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 ${
                          notification.type === "success" ? "bg-green-100" :
                          notification.type === "warning" ? "bg-yellow-100" :
                          notification.type === "error" ? "bg-red-100" :
                          "bg-blue-100"
                        }`}>
                          <Icon className={`h-4 w-4 ${iconColor}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${
                                notification.isRead ? "text-neutral-700" : "text-neutral-900"
                              }`}>
                                {notification.title}
                              </h4>
                              <p className={`text-sm mt-1 ${
                                notification.isRead ? "text-neutral-500" : "text-neutral-600"
                              }`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center mt-2 space-x-2">
                                <Badge className={getNotificationBadgeColor(notification.type)}>
                                  {notification.type}
                                </Badge>
                                <span className="text-xs text-neutral-500">
                                  {formatTime(notification.createdAt!)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsReadMutation.mutate(notification.id)}
                                  disabled={markAsReadMutation.isPending}
                                  className="text-xs"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Mark as read
                                </Button>
                              )}
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
