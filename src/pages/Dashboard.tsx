
import { Calendar, Clock, Users, Building, CheckCircle, AlertCircle, MapPin } from "lucide-react";
import StatsCard from "@/components/Dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  
  const todayDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Buscar escalas ativas com suas centrais de custódia
  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules-with-custody-centers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          id,
          title,
          description,
          status,
          start_date,
          end_date,
          schedule_assignments!inner(
            serventia_id,
            serventias!inner(
              id,
              name,
              type
            )
          )
        `)
        .eq("status", "ativo")
        .eq("schedule_assignments.serventias.type", "central_custodia");
      
      if (error) {
        console.error("Erro ao buscar escalas:", error);
        return [];
      }
      
      return data || [];
    },
  });

  const recentAudiences = [
    {
      id: 1,
      time: "09:00",
      process: "0001234-56.2024.8.09.0000",
      defendant: "João Silva Santos",
      unit: "CDP Aparecida de Goiânia",
      status: "agendada"
    },
    {
      id: 2,
      time: "10:30",
      process: "0001235-56.2024.8.09.0000",
      defendant: "Maria Oliveira Costa",
      unit: "Presídio Feminino",
      status: "realizada"
    },
    {
      id: 3,
      time: "14:00",
      process: "0001236-56.2024.8.09.0000",
      defendant: "Carlos Eduardo Lima",
      unit: "CPP Goiânia",
      status: "cancelada"
    }
  ];

  const macrorregioes = [
    {
      id: 1,
      nome: "Macrorregião 02",
      responsavel: "Fernanda Braz",
      telefone: "556299953335",
      whatsapp: "556299953335",
      status: "ativa"
    },
    {
      id: 2,
      nome: "Macrorregião 03",
      responsavel: "Lana Nunes",
      telefone: "556296039999",
      whatsapp: "556296039999",
      status: "ativa"
    },
    {
      id: 3,
      nome: "Macrorregião 04",
      responsavel: "Alessandro",
      telefone: "556284153627",
      whatsapp: "556284153627",
      status: "ativa"
    },
    {
      id: 4,
      nome: "Macrorregião 05",
      responsavel: "Suelem Mendonça",
      telefone: "556285376555",
      whatsapp: "556285376555",
      status: "ativa"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendada":
        return <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>;
      case "realizada":
        return <Badge className="bg-green-100 text-green-800">Realizada</Badge>;
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewScheduleAudiences = (scheduleId: string, scheduleTitle: string) => {
    // Navegar para a página de audiências com filtro da escala
    navigate(`/audiencias?schedule=${scheduleId}&title=${encodeURIComponent(scheduleTitle)}`);
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 capitalize text-sm md:text-base">{todayDate}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          title="Audiências Hoje"
          value={12}
          icon={Calendar}
          description="3 pendentes, 9 realizadas"
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Macrorregiões Ativas"
          value={20}
          icon={MapPin}
          description="Todas as regiões operacionais"
        />
        <StatsCard
          title="Centrais de Custódia"
          value={20}
          icon={Building}
          description="Unidades em funcionamento"
        />
        <StatsCard
          title="Operadores Ativos"
          value={156}
          icon={Users}
          description="Judiciário, MP e Defensoria"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Audiências do Dia */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Audiências de Hoje</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAudiences.map((audience) => (
                <div key={audience.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{audience.time}</span>
                      {getStatusBadge(audience.status)}
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{audience.defendant}</p>
                    <p className="text-xs text-gray-500 truncate">{audience.process}</p>
                    <p className="text-xs text-gray-500 truncate">{audience.unit}</p>
                  </div>
                  <div className="flex items-center ml-4">
                    {audience.status === "realizada" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Centrais de Custódia por Escala */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Centrais de Custódia - Escalas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Macrorregiões */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Macrorregiões</h4>
                {macrorregioes.map((macro) => (
                  <div key={macro.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-blue-800 truncate">{macro.nome}</span>
                      <Badge className="bg-blue-100 text-blue-800 flex-shrink-0">Ativa</Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{macro.responsavel}</p>
                    <p className="text-xs text-blue-600 truncate">Tel: {macro.telefone}</p>
                  </div>
                ))}
              </div>

              {/* Centrais de Custódia por Escala */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Centrais de Custódia por Escala</h4>
                {schedules.length > 0 ? (
                  schedules.map((schedule) => {
                    // Agrupar centrais de custódia por escala
                    const custodyCenters = schedule.schedule_assignments
                      ?.filter(assignment => assignment.serventias?.type === "central_custodia")
                      ?.map(assignment => assignment.serventias) || [];

                    return (
                      <div key={schedule.id} className="p-3 bg-green-50 rounded-lg border border-green-200 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm text-green-800 truncate">{schedule.title}</span>
                              <Badge className="bg-green-100 text-green-800 flex-shrink-0">Ativa</Badge>
                            </div>
                            {schedule.description && (
                              <p className="text-xs text-green-600 truncate mt-1">{schedule.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Centrais associadas */}
                        {custodyCenters.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-green-700">Centrais:</p>
                            {custodyCenters.map((center) => (
                              <div key={center.id} className="text-xs text-green-600 pl-2">
                                • {center.name}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-2 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2 border-green-300 text-green-700 hover:bg-green-100"
                            onClick={() => handleViewScheduleAudiences(schedule.id, schedule.title)}
                          >
                            Ver Audiências
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Nenhuma escala ativa encontrada</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Notificações */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600 text-lg">
            <AlertCircle className="h-5 w-5" />
            <span>Alertas e Notificações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  3 audiências pendentes de confirmação pela unidade prisional
                </p>
                <p className="text-xs text-yellow-600 truncate">CDP Aparecida, Presídio Feminino, CPP Goiânia</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-blue-800">
                  Sistema atualizado com sucesso
                </p>
                <p className="text-xs text-blue-600">Última sincronização há 5 minutos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
