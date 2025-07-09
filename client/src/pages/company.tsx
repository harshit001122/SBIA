import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompanySchema, type InsertCompany, type Company } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, Users, Calendar, Globe, Upload, Save, 
  Loader2, Edit, MapPin, Phone, Mail 
} from "lucide-react";

export default function CompanyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/company"],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const { data: teamMembers } = useQuery({
    queryKey: ["/api/team"],
    refetchInterval: 300000,
  });

  const form = useForm<InsertCompany>({
    resolver: zodResolver(insertCompanySchema),
    defaultValues: {
      name: "",
      industry: "",
      website: "",
      description: "",
      logo: "",
      settings: {},
    },
  });

  // Update form when company data loads
  React.useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || "",
        industry: company.industry || "",
        website: company.website || "",
        description: company.description || "",
        logo: company.logo || "",
        settings: company.settings || {},
      });
    }
  }, [company, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertCompany>) => {
      const res = await apiRequest("PATCH", "/api/company", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company"] });
      setIsEditing(false);
      toast({
        title: "Company updated",
        description: "Company profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update company",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCompany) => {
    updateMutation.mutate(data);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, this would upload to a file storage service
      toast({
        title: "Feature coming soon",
        description: "Logo upload functionality will be available in the next update.",
      });
    }
  };

  const getCompanyInitial = (name: string) => {
    return name?.charAt(0).toUpperCase() || "C";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Sidebar />
        <main className="ml-64">
          <TopBar title="Company Profile" subtitle="Manage your company information and settings" />
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Skeleton className="h-96" />
              </div>
              <div>
                <Skeleton className="h-64 mb-6" />
                <Skeleton className="h-32" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Sidebar />
        <main className="ml-64">
          <TopBar title="Company Profile" subtitle="Manage your company information and settings" />
          <div className="p-6">
            <Card className="shadow-sm border border-neutral-200">
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600">Company profile not found</p>
                <p className="text-sm text-neutral-500 mt-1">
                  There seems to be an issue loading your company profile.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      
      <main className="ml-64">
        <TopBar title="Company Profile" subtitle="Manage your company information and settings" />

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Company Info */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm border border-neutral-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Company Information</CardTitle>
                    <Button
                      variant={isEditing ? "outline" : "default"}
                      onClick={() => setIsEditing(!isEditing)}
                      disabled={updateMutation.isPending}
                    >
                      {isEditing ? (
                        <>Cancel</>
                      ) : (
                        <>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Logo Upload */}
                        <div className="space-y-2">
                          <Label>Company Logo</Label>
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                {getCompanyInitial(form.watch("name"))}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                              />
                              <Label htmlFor="logo-upload" className="cursor-pointer">
                                <Button type="button" variant="outline" asChild>
                                  <span>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Logo
                                  </span>
                                </Button>
                              </Label>
                              <p className="text-xs text-neutral-500 mt-1">
                                JPG, PNG up to 5MB
                              </p>
                            </div>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Company Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Technology, Healthcare, Finance" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input placeholder="https://yourcompany.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us about your company..."
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <div className="space-y-6">
                      {/* Company Header */}
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                            {getCompanyInitial(company.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-2xl font-bold text-neutral-900">{company.name}</h3>
                          {company.industry && (
                            <p className="text-neutral-600">{company.industry}</p>
                          )}
                        </div>
                      </div>

                      {/* Company Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {company.website && (
                          <div className="flex items-center space-x-3">
                            <Globe className="h-5 w-5 text-neutral-400" />
                            <div>
                              <p className="text-sm font-medium text-neutral-700">Website</p>
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {company.website}
                              </a>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-neutral-400" />
                          <div>
                            <p className="text-sm font-medium text-neutral-700">Created</p>
                            <p className="text-neutral-600">{formatDate(company.createdAt!)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {company.description && (
                        <div>
                          <h4 className="text-lg font-semibold text-neutral-900 mb-2">About</h4>
                          <p className="text-neutral-600 leading-relaxed">{company.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Team Overview */}
              <Card className="shadow-sm border border-neutral-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Team Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Total Members</span>
                      <span className="font-semibold">{teamMembers?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Administrators</span>
                      <span className="font-semibold">
                        {teamMembers?.filter((m: any) => m.role === "admin").length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Active Members</span>
                      <span className="font-semibold">
                        {teamMembers?.filter((m: any) => m.isActive).length || 0}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <a href="/team">Manage Team</a>
                  </Button>
                </CardContent>
              </Card>

              {/* Company Stats */}
              <Card className="shadow-sm border border-neutral-200">
                <CardHeader>
                  <CardTitle>Company Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {new Date().getFullYear() - new Date(company.createdAt!).getFullYear() || "New"}
                      </p>
                      <p className="text-sm text-blue-600">Years Active</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">
                          {teamMembers?.length || 0}
                        </p>
                        <p className="text-xs text-green-600">Team Size</p>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-lg font-bold text-purple-600">Active</p>
                        <p className="text-xs text-purple-600">Status</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-sm border border-neutral-200">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/team">
                        <Users className="mr-2 h-4 w-4" />
                        Manage Team
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/integrations">
                        <Building2 className="mr-2 h-4 w-4" />
                        View Integrations
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/settings">
                        <Edit className="mr-2 h-4 w-4" />
                        Company Settings
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
