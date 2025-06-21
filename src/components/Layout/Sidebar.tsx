
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav-items";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { userProfile, hasPermission } = useAuth();

  const getResourceFromHref = (href: string) => {
    const resourceMap: Record<string, string> = {
      '/': 'dashboard',
      '/audiencias': 'audiencias',
      '/plantoes': 'plantoes',
      '/unidades': 'unidades',
      '/unidades-prisionais': 'unidades-prisionais',
      '/contatos': 'contatos',
      '/configuracoes-slots': 'configuracoes-slots',
      '/configuracoes': 'configuracoes'
    };
    return resourceMap[href] || href.substring(1);
  };

  const canAccessPage = (href: string) => {
    if (!userProfile) return false;
    
    const resource = getResourceFromHref(href);
    
    // Verificar permissões usando o sistema de permissões
    return hasPermission(resource, 'read');
  };

  const filteredNavItems = navItems.filter(item => canAccessPage(item.href));

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {filteredNavItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-gray-100",
                  location.pathname === item.href
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-700"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
