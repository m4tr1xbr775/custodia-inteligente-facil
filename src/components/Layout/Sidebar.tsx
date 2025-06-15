
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Users, 
  Building, 
  FileText, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: BarChart3, label: "Dashboard", path: "/" },
  { icon: Calendar, label: "Audiências", path: "/audiencias" },
  { icon: Clock, label: "Plantões", path: "/plantoes" },
  { icon: Users, label: "Contatos", path: "/contatos" },
  { icon: Building, label: "Unidades Prisionais", path: "/unidades" },
  { icon: FileText, label: "Relatórios", path: "/relatorios" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "bg-gray-900 text-white transition-all duration-300 h-screen sticky top-0",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-end text-white hover:bg-gray-800"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-800",
                isActive ? "bg-blue-600 text-white" : "text-gray-300"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
