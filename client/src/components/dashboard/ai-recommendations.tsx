import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import type { AiRecommendation } from "@shared/schema";

export default function AIRecommendations() {
  const { toast } = useToast();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["/api/ai-recommendations"],
    refetchInterval: 600000, // Refetch every 10 minutes
  });

  const implementMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/ai-recommendations/${id}`, {
        isImplemented: true,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-recommendations"] });
      toast({
        title: "Recommendation implemented",
        description: "The recommendation has been marked as implemented.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to implement",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "revenue":
        return "bg-purple-100 text-purple-700";
      case "user experience":
        return "bg-blue-100 text-blue-700";
      case "content":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
        <CardHeader>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>AI-Powered Insights</CardTitle>
              <p className="text-neutral-600">Smart recommendations based on your data</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 bg-white" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeRecommendations = recommendations?.filter((rec: AiRecommendation) => !rec.isImplemented) || [];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
      <CardHeader>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>AI-Powered Insights</CardTitle>
            <p className="text-neutral-600">Smart recommendations based on your data</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-600">No active recommendations at this time.</p>
            <p className="text-sm text-neutral-500 mt-1">
              Check back later for AI-generated insights.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRecommendations.map((recommendation: AiRecommendation) => (
              <Card key={recommendation.id} className="bg-white border border-neutral-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={getCategoryColor(recommendation.category)}>
                      {recommendation.category}
                    </Badge>
                    <span className="text-xs text-neutral-500">
                      {recommendation.confidence}% confidence
                    </span>
                  </div>
                  <h4 className="font-medium text-neutral-900 mb-2">
                    {recommendation.title}
                  </h4>
                  <p className="text-sm text-neutral-600 mb-3">
                    {recommendation.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 font-medium">
                      {recommendation.impact}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:underline p-0 h-auto"
                      onClick={() => implementMutation.mutate(recommendation.id)}
                      disabled={implementMutation.isPending}
                    >
                      Implement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
