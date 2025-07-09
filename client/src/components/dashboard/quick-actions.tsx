import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FolderSync, BarChart3, Plus, UserPlus, ChevronRight } from "lucide-react";

export default function QuickActions() {
  const { toast } = useToast();

  const syncMutation = useMutation({
    mutationFn: async () => {
      // Create a sync activity
      const res = await apiRequest("POST", "/api/activities", {
        type: "data_sync",
        description: "Manual data synchronization initiated",
        source: "Quick Actions",
        metadata: { manual: true },
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "FolderSync started",
        description: "Data synchronization has been initiated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "FolderSync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSyncAllData = () => {
    syncMutation.mutate();
  };

  const handleGenerateReport = () => {
    toast({
      title: "Feature coming soon",
      description: "Report generation will be available in the next update.",
    });
  };

  const handleAddIntegration = () => {
    // In a real app, this would navigate to integrations page
    window.location.href = "/integrations";
  };

  const handleInviteTeamMember = () => {
    // In a real app, this would open an invite modal or navigate to team page
    window.location.href = "/team";
  };

  const actions = [
    {
      id: "sync",
      title: "FolderSync All Data",
      icon: FolderSync,
      onClick: handleSyncAllData,
      disabled: syncMutation.isPending,
    },
    {
      id: "report",
      title: "Generate Report",
      icon: BarChart3,
      onClick: handleGenerateReport,
      disabled: false,
    },
    {
      id: "integration",
      title: "Add Integration",
      icon: Plus,
      onClick: handleAddIntegration,
      disabled: false,
    },
    {
      id: "invite",
      title: "Invite Team Member",
      icon: UserPlus,
      onClick: handleInviteTeamMember,
      disabled: false,
    },
  ];

  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="w-full justify-between h-auto p-4 hover:border-primary hover:bg-primary/5"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                <div className="flex items-center">
                  <Icon className="h-4 w-4 text-primary mr-3" />
                  <span className="text-neutral-900 font-medium">{action.title}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
