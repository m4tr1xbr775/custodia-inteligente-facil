
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const colorVariants = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
};

type Color = keyof typeof colorVariants;

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: Color;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon: Icon, color, description, trend }: StatsCardProps) => {
  const variants = colorVariants[color] || colorVariants.blue;
  
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
          <div className={`p-3 rounded-lg ${variants.bg}`}>
            <Icon className={`h-6 w-6 ${variants.text}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
