
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon: Icon, description, trend }: StatsCardProps) => {
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow w-full">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{title}</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1 md:mt-2">{value}</p>
            {description && (
              <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">{description}</p>
            )}
            {trend && (
              <p className={`text-xs md:text-sm mt-1 md:mt-2 truncate ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}% em relação ao mês anterior
              </p>
            )}
          </div>
          <div className="bg-blue-50 p-2 md:p-3 rounded-lg flex-shrink-0 ml-2">
            <Icon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
