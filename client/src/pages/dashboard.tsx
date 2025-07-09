import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import KpiCard from "@/components/dashboard/kpi-card";
import RevenueChart from "@/components/dashboard/revenue-chart";
import UserChart from "@/components/dashboard/user-chart";
import AIRecommendations from "@/components/dashboard/ai-recommendations";
import RecentActivity from "@/components/dashboard/recent-activity";
import QuickActions from "@/components/dashboard/quick-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, Users, TrendingUp, Activity 
} from "lucide-react";

export default function Dashboard() {
  const { data: kpiMetrics, isLoading: kpiLoading } = useQuery({
    queryKey: ["/api/dashboard/kpi-metrics"],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const renderKpiCards = () => {
    if (kpiLoading) {
      return (
        <>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </>
      );
    }

    if (!kpiMetrics || kpiMetrics.length === 0) {
      // Default KPI structure when no data exists
      const defaultKpis = [
        {
          id: 1,
          name: "Total Revenue",
          value: "$0",
          changePercentage: "+0%",
          period: "vs last month",
          icon: "DollarSign",
          color: "bg-primary/10 text-primary",
        },
        {
          id: 2,
          name: "Active Users",
          value: "0",
          changePercentage: "+0%",
          period: "vs last month",
          icon: "Users",
          color: "bg-blue-100 text-blue-600",
        },
        {
          id: 3,
          name: "Conversion Rate",
          value: "0%",
          changePercentage: "+0%",
          period: "vs last month",
          icon: "TrendingUp",
          color: "bg-green-100 text-green-600",
        },
        {
          id: 4,
          name: "API Requests",
          value: "0",
          changePercentage: "+0%",
          period: "vs last month",
          icon: "Activity",
          color: "bg-purple-100 text-purple-600",
        },
      ];

      return defaultKpis.map((kpi) => {
        const getIcon = (iconName: string) => {
          switch (iconName) {
            case "DollarSign":
              return DollarSign;
            case "Users":
              return Users;
            case "TrendingUp":
              return TrendingUp;
            case "Activity":
              return Activity;
            default:
              return DollarSign;
          }
        };

        return (
          <KpiCard
            key={kpi.id}
            title={kpi.name}
            value={kpi.value}
            change={kpi.changePercentage}
            period={kpi.period}
            icon={getIcon(kpi.icon)}
            color={kpi.color}
          />
        );
      });
    }

    return kpiMetrics.map((metric: any) => {
      const getIcon = (iconName: string) => {
        switch (iconName) {
          case "dollar-sign":
          case "DollarSign":
            return DollarSign;
          case "users":
          case "Users":
            return Users;
          case "trending-up":
          case "TrendingUp":
            return TrendingUp;
          case "activity":
          case "Activity":
            return Activity;
          default:
            return DollarSign;
        }
      };

      return (
        <KpiCard
          key={metric.id}
          title={metric.name}
          value={metric.value}
          change={metric.changePercentage}
          period={metric.period}
          icon={getIcon(metric.icon)}
          color={metric.color || "bg-primary/10 text-primary"}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      
      <main className="ml-64">
        <TopBar 
          title="Dashboard" 
          subtitle="Welcome back! Here's what's happening with your business." 
        />

        <div className="p-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {renderKpiCards()}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RevenueChart />
            <UserChart />
          </div>

          {/* AI Recommendations */}
          <div className="mb-8">
            <AIRecommendations />
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentActivity />
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
}
