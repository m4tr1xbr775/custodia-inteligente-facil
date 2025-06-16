
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon, description, color = "blue", trend }: StatsCardProps) => {
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-50 text-blue-600",
      yellow: "bg-yellow-50 text-yellow-600",
      green: "bg-green-50 text-green-600",
      purple: "bg-purple-50 text-purple-600",
      indigo: "bg-indigo-50 text-indigo-600",
      pink: "bg-pink-50 text-pink-600",
      orange: "bg-orange-50 text-orange-600",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
            {trend && (
              <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}% em relação ao mês anterior
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
