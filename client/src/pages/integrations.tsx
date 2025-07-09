import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIntegrationSchema, type InsertIntegration } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, FolderSync, Settings as SettingsIcon, Trash2,
  Activity, TrendingUp, ShoppingCart, Users,
  Loader2
} from "lucide-react";

const integrationCategories = [
  {
    name: "Analytics",
    icon: TrendingUp,
    providers: [
      { name: "Google Analytics", provider: "google", type: "analytics", icon: "fab fa-google" },
      { name: "Adobe Analytics", provider: "adobe", type: "analytics", icon: "fab fa-adobe" },
      { name: "Mixpanel", provider: "mixpanel", type: "analytics", icon: "fas fa-chart-line" },
    ],
  },
  {
    name: "CRM & Sales",
    icon: Users,
    providers: [
      { name: "Salesforce", provider: "salesforce", type: "crm", icon: "fab fa-salesforce" },
      { name: "HubSpot", provider: "hubspot", type: "crm", icon: "fas fa-h-square" },
      { name: "Pipedrive", provider: "pipedrive", type: "crm", icon: "fas fa-pipe" },
    ],
  },
  {
    name: "E-commerce",
    icon: ShoppingCart,
    providers: [
      { name: "Shopify", provider: "shopify", type: "ecommerce", icon: "fab fa-shopify" },
      { name: "WooCommerce", provider: "woocommerce", type: "ecommerce", icon: "fab fa-wordpress" },
      { name: "Stripe", provider: "stripe", type: "payment", icon: "fab fa-stripe" },
    ],
  },
  {
    name: "Marketing",
    icon: Activity,
    providers: [
      { name: "Meta Ads", provider: "meta", type: "advertising", icon: "fab fa-facebook" },
      { name: "Google Ads", provider: "google_ads", type: "advertising", icon: "fab fa-google" },
      { name: "Mailchimp", provider: "mailchimp", type: "email", icon: "fab fa-mailchimp" },
    ],
  },
];

export default function Integrations() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["/api/integrations"],
    refetchInterval: 60000,
  });

  const form = useForm<InsertIntegration>({
    resolver: zodResolver(insertIntegrationSchema.omit({ companyId: true })),
    defaultValues: {
      name: "",
      type: "",
      provider: "",
      status: "disconnected",
      config: {},
      credentials: {},
      dataPoints: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertIntegration) => {
      const res = await apiRequest("POST", "/api/integrations", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Integration added",
        description: "The integration has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/integrations/${id}`, {
        lastSyncAt: new Date().toISOString(),
        status: "connected",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "FolderSync completed",
        description: "Integration data has been synchronized.",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integration removed",
        description: "The integration has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertIntegration) => {
    createMutation.mutate(data);
  };

  const getConnectedCount = (categoryProviders: any[]) => {
    if (!integrations) return 0;
    return integrations.filter((integration: any) => 
      categoryProviders.some(p => p.provider === integration.provider) && 
      integration.status === "connected"
    ).length;
  };

  const isProviderConnected = (provider: string) => {
    if (!integrations) return false;
    return integrations.some((integration: any) => 
      integration.provider === provider && integration.status === "connected"
    );
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Sidebar />
        <main className="ml-64">
          <TopBar title="API Integrations" subtitle="Connect your business tools and data sources" />
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64" />
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
        <TopBar title="API Integrations" subtitle="Connect your business tools and data sources" />

        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Integration Categories</h2>
              <p className="text-neutral-600">Choose from our available integrations</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Integration</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Integration Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Google Analytics" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select integration type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="analytics">Analytics</SelectItem>
                              <SelectItem value="crm">CRM</SelectItem>
                              <SelectItem value="ecommerce">E-commerce</SelectItem>
                              <SelectItem value="advertising">Advertising</SelectItem>
                              <SelectItem value="email">Email Marketing</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., google, salesforce" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Add Integration
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Integration Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {integrationCategories.map((category) => {
              const CategoryIcon = category.icon;
              const connectedCount = getConnectedCount(category.providers);
              
              return (
                <Card key={category.name} className="shadow-sm border border-neutral-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CategoryIcon className="h-5 w-5 text-primary mr-2" />
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                      <span className="text-sm text-neutral-500">
                        {connectedCount} connected
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.providers.map((provider) => (
                        <div
                          key={provider.provider}
                          className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center mr-3">
                              <i className={`${provider.icon} text-neutral-600`} />
                            </div>
                            <span className="font-medium text-neutral-900">
                              {provider.name}
                            </span>
                          </div>
                          {isProviderConnected(provider.provider) ? (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                              <span className="text-xs text-neutral-500">Connected</span>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:underline"
                              onClick={() => {
                                form.setValue("name", provider.name);
                                form.setValue("type", provider.type);
                                form.setValue("provider", provider.provider);
                                setIsAddDialogOpen(true);
                              }}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Integration Management Table */}
          <Card className="shadow-sm border border-neutral-200">
            <CardHeader>
              <CardTitle>Manage Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              {!integrations || integrations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-600">No integrations configured yet</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Add your first integration to start collecting data.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Last FolderSync
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Data Points
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {integrations.map((integration: any) => (
                        <tr key={integration.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center mr-3">
                                <i className="fas fa-plug text-neutral-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-neutral-900">
                                  {integration.name}
                                </div>
                                <div className="text-sm text-neutral-500">
                                  {integration.type}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={integration.status === "connected" ? "default" : "secondary"}
                              className={
                                integration.status === "connected"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {integration.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            {formatLastSync(integration.lastSyncAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            {integration.dataPoints?.toLocaleString() || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => syncMutation.mutate(integration.id)}
                              disabled={syncMutation.isPending}
                              className="text-primary hover:text-blue-700"
                            >
                              <FolderSync className="h-4 w-4 mr-1" />
                              FolderSync
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-neutral-600 hover:text-neutral-900"
                            >
                              <SettingsIcon className="h-4 w-4 mr-1" />
                              Configure
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(integration.id)}
                              disabled={deleteMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
