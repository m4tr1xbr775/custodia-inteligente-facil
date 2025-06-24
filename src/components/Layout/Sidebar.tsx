
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav-items";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { userProfile, hasPermission } = useAuth();

  const getResourceFromHref = (href: string) => {
    const resourceMap: Record<string, string> = {
      '/dashboard': 'dashboard',
      '/audiencias': 'audiencias',
      '/plantoes': 'plantoes',
      '/unidades': 'unidades',
      '/unidades-prisionais': 'unidades-prisionais',
      '/contatos': 'contatos',
      '/historico': 'historico',
      '/configuracoes': 'configuracoes'
    };
    return resourceMap[href] || href.substring(1);
  };

  const canAccessPage = (href: string) => {
    if (!userProfile) return false;
    
    const resource = getResourceFromHref(href);
    return hasPermission(resource, 'read');
  };

  const filteredNavItems = navItems.filter(item => canAccessPage(item.href));

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">SisJud</h1>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {filteredNavItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location.pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-6 w-6",
                    location.pathname === item.href
                      ? "text-gray-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Informações do usuário */}
        {userProfile && (
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {userProfile.name}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    {userProfile.profile}
                  </p>
                  {!userProfile.active && (
                    <p className="text-xs text-red-500">
                      Aguardando aprovação
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
