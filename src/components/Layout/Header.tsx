
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  // Buscar notificações/alertas
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Audiências pendentes de confirmação
      const { data: pendingAudiences } = await supabase
        .from('audiences')
        .select(`
          id,
          defendant_name,
          unit_acknowledgment,
          prison_units_extended (name)
        `)
        .eq('unit_acknowledgment', 'pendente')
        .eq('scheduled_date', today);
      
      // Audiências sem magistrado definido
      const { data: audiencesWithoutMagistrate } = await supabase
        .from('audiences')
        .select('id, defendant_name')
        .is('magistrate_id', null)
        .gte('scheduled_date', today);

      const alerts = [];
      
      if (pendingAudiences && pendingAudiences.length > 0) {
        alerts.push({
          id: 'pending-confirmations',
          type: 'warning',
          title: `${pendingAudiences.length} audiências pendentes de confirmação`,
          description: 'Unidades prisionais não confirmaram presença',
          action: () => navigate('/unidades-prisionais')
        });
      }
      
      if (audiencesWithoutMagistrate && audiencesWithoutMagistrate.length > 0) {
        alerts.push({
          id: 'missing-magistrates',
          type: 'error',
          title: `${audiencesWithoutMagistrate.length} audiências sem magistrado`,
          description: 'Defina magistrados para estas audiências',
          action: () => navigate('/audiencias')
        });
      }

      return alerts;
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  const totalNotifications = notifications?.length || 0;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SJ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SisJud</h1>
              <p className="text-xs text-gray-500">Sistema de Gestão Judiciária</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {totalNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0">
                    {totalNotifications}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Notificações</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                      onClick={notification.action}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="hidden md:inline">Administrador</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
