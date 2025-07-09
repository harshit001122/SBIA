import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  period?: string;
  icon: LucideIcon;
  color: string;
}

export default function KpiCard({ 
  title, 
  value, 
  change, 
  period, 
  icon: Icon, 
  color 
}: KpiCardProps) {
  const isPositive = change?.startsWith("+");
  const isNegative = change?.startsWith("-");

  return (
    <Card className="shadow-sm border border-neutral-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            {change && period && (
              <div className="flex items-center mt-1">
                <span 
                  className={cn(
                    "text-sm font-medium",
                    isPositive && "text-green-600",
                    isNegative && "text-red-500",
                    !isPositive && !isNegative && "text-neutral-500"
                  )}
                >
                  {change}
                </span>
                <span className="text-sm text-neutral-500 ml-1">{period}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
