import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderSync, UserPlus, AlertTriangle, Building, Settings } from "lucide-react";
import type { Activity } from "@shared/schema";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "integration_sync":
    case "data_sync":
      return FolderSync;
    case "user_registered":
    case "team_member_added":
      return UserPlus;
    case "integration_error":
    case "rate_limit_warning":
      return AlertTriangle;
    case "company_updated":
      return Building;
    case "settings_updated":
      return Settings;
    default:
      return FolderSync;
  }
};

const getActivityIconColor = (type: string) => {
  switch (type) {
    case "integration_sync":
    case "data_sync":
      return "bg-blue-100 text-blue-600";
    case "user_registered":
    case "team_member_added":
      return "bg-green-100 text-green-600";
    case "integration_error":
    case "rate_limit_warning":
      return "bg-yellow-100 text-yellow-600";
    case "company_updated":
      return "bg-purple-100 text-purple-600";
    case "settings_updated":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-blue-100 text-blue-600";
  }
};

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activities", { limit: 10 }],
    refetchInterval: 60000, // Refetch every minute
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2 shadow-sm border border-neutral-200">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 shadow-sm border border-neutral-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:underline">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!activities || activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-600">No recent activity</p>
            <p className="text-sm text-neutral-500 mt-1">
              Activity will appear here as you use the platform.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: Activity) => {
              const Icon = getActivityIcon(activity.type);
              const iconColor = getActivityIconColor(activity.type);
              
              return (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-4 p-4 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-900 text-sm">{activity.description}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-neutral-500">
                        {formatTime(activity.createdAt!)}
                      </span>
                      {activity.source && (
                        <>
                          <span className="mx-2 text-neutral-300">•</span>
                          <span className="text-xs text-neutral-500">{activity.source}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
