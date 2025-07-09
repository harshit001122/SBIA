import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, Plug, Building2, Users, Bell, Settings, LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "API Integrations", href: "/integrations", icon: Plug },
  { name: "Company Profile", href: "/company", icon: Building2 },
  { name: "Team Management", href: "/team", icon: Users },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const { data: unreadCount } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-neutral-200 z-40">
      <div className="flex items-center px-6 py-4 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900">SBIA Platform</h1>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-medium",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-neutral-600 hover:text-primary hover:bg-neutral-100"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.name}
                    {item.name === "Notifications" && unreadCount?.count > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {unreadCount.count}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center p-3 bg-neutral-100 rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-neutral-600 truncate">
              {user?.role === "admin" ? "Administrator" : "Member"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="text-neutral-400 hover:text-neutral-600 p-1"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
