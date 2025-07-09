import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, Building2, Bell, Shield, CreditCard, Upload, 
  Save, Loader2, Eye, EyeOff, AlertTriangle 
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: company } = useQuery({
    queryKey: ["/api/company"],
  });

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema.omit({ companyId: true, password: true })),
    defaultValues: {
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      jobTitle: user?.jobTitle || "",
      role: user?.role || "member",
      isActive: user?.isActive || true,
    },
  });

  // Update form when user data changes
  React.useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        jobTitle: user.jobTitle || "",
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<InsertUser>) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUser) => {
    updateProfileMutation.mutate(data);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Feature coming soon",
        description: "Photo upload functionality will be available in the next update.",
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Sidebar />
        <main className="ml-64">
          <TopBar title="Settings" subtitle="Manage your account and application preferences" />
          <div className="p-6">
            <Skeleton className="h-96" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      
      <main className="ml-64">
        <TopBar title="Settings" subtitle="Manage your account and application preferences" />

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                <TabsList className="flex flex-col h-auto w-full p-1">
                  <TabsTrigger value="profile" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="company" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    Company
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="security" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="billing" className="w-full justify-start">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                {/* Profile Settings */}
                <TabsContent value="profile">
                  <Card className="shadow-sm border border-neutral-200">
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          {/* Profile Photo */}
                          <div className="space-y-2">
                            <Label>Profile Photo</Label>
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-20 w-20">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                  {getUserInitials()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoUpload}
                                  className="hidden"
                                  id="photo-upload"
                                />
                                <Label htmlFor="photo-upload" className="cursor-pointer">
                                  <Button type="button" variant="outline" asChild>
                                    <span>
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload Photo
                                    </span>
                                  </Button>
                                </Label>
                                <p className="text-xs text-neutral-500 mt-1">
                                  JPG, PNG up to 5MB
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Name Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Email and Job Title */}
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="jobTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="CEO, Manager, Developer..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end">
                            <Button type="submit" disabled={updateProfileMutation.isPending}>
                              {updateProfileMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Company Settings */}
                <TabsContent value="company">
                  <Card className="shadow-sm border border-neutral-200">
                    <CardHeader>
                      <CardTitle>Company Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <Label>Company Name</Label>
                          <Input value={company?.name || ""} disabled className="mt-2" />
                          <p className="text-xs text-neutral-500 mt-1">
                            Contact support to change company name
                          </p>
                        </div>

                        <div>
                          <Label>Industry</Label>
                          <Input value={company?.industry || ""} disabled className="mt-2" />
                        </div>

                        <div>
                          <Label>Website</Label>
                          <Input value={company?.website || ""} disabled className="mt-2" />
                        </div>

                        <Button variant="outline" asChild>
                          <a href="/company">
                            <Building2 className="mr-2 h-4 w-4" />
                            Manage Company Profile
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                  <Card className="shadow-sm border border-neutral-200">
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-neutral-500">
                              Receive notifications via email
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Push Notifications</Label>
                            <p className="text-sm text-neutral-500">
                              Receive browser push notifications
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Integration Alerts</Label>
                            <p className="text-sm text-neutral-500">
                              Notifications about integration status changes
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Weekly Reports</Label>
                            <p className="text-sm text-neutral-500">
                              Weekly summary of your business metrics
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Security Alerts</Label>
                            <p className="text-sm text-neutral-500">
                              Important security-related notifications
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <Button>Save Notification Preferences</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                  <div className="space-y-6">
                    <Card className="shadow-sm border border-neutral-200">
                      <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label>Current Password</Label>
                            <div className="relative mt-2">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter current password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label>New Password</Label>
                            <Input
                              type="password"
                              placeholder="Enter new password"
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label>Confirm New Password</Label>
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              className="mt-2"
                            />
                          </div>

                          <Button>Update Password</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-neutral-200">
                      <CardHeader>
                        <CardTitle>Account Security</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Two-Factor Authentication</Label>
                              <p className="text-sm text-neutral-500">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <Switch />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Login Notifications</Label>
                              <p className="text-sm text-neutral-500">
                                Get notified when someone signs into your account
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <Button variant="outline">View Login History</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-red-200">
                      <CardHeader>
                        <CardTitle className="text-red-600 flex items-center">
                          <AlertTriangle className="mr-2 h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-neutral-900">Delete Account</h4>
                            <p className="text-sm text-neutral-500 mt-1">
                              Once you delete your account, there is no going back. Please be certain.
                            </p>
                          </div>
                          <Button variant="destructive">Delete Account</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Billing Settings */}
                <TabsContent value="billing">
                  <div className="space-y-6">
                    <Card className="shadow-sm border border-neutral-200">
                      <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border border-neutral-200 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-neutral-900">Professional Plan</h4>
                                <p className="text-sm text-neutral-500">
                                  Full access to all features and integrations
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-neutral-900">$99</p>
                                <p className="text-sm text-neutral-500">per month</p>
                              </div>
                            </div>
                            <div className="mt-4 flex space-x-2">
                              <Button variant="outline">Change Plan</Button>
                              <Button variant="outline">Cancel Subscription</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-neutral-200">
                      <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border border-neutral-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center mr-3">
                                  VISA
                                </div>
                                <div>
                                  <p className="font-medium">•••• •••• •••• 4242</p>
                                  <p className="text-sm text-neutral-500">Expires 12/25</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">Edit</Button>
                            </div>
                          </div>
                          <Button variant="outline">Add Payment Method</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-neutral-200">
                      <CardHeader>
                        <CardTitle>Billing History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-lg">
                            <div>
                              <p className="font-medium">December 2024</p>
                              <p className="text-sm text-neutral-500">Professional Plan</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">$99.00</p>
                              <Button variant="ghost" size="sm">Download</Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-lg">
                            <div>
                              <p className="font-medium">November 2024</p>
                              <p className="text-sm text-neutral-500">Professional Plan</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">$99.00</p>
                              <Button variant="ghost" size="sm">Download</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
