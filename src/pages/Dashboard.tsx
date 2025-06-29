import { Calendar, Clock, Users, Building, CheckCircle, AlertCircle, MapPin, Phone, MessageCircle, Filter } from "lucide-react";
import StatsCard from "@/components/Dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Database } from "@/integrations/supabase/types";

type ServentiaType = Database["public"]["Enums"]["serventia_type"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [scheduleFilter, setScheduleFilter] = useState<"todos" | ServentiaType>("macrorregiao");
  const [audienceServentiaFilter, setAudienceServentiaFilter] = useState<string>("central_custodia");
  
  const todayDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Buscar estatísticas gerais
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Audiências de hoje
      const { data: todayAudiences } = await supabase
        .from('audiences')
        .select('*')
        .eq('scheduled_date', today);
      
      // Total de unidades prisionais
      const { data: prisonUnits } = await supabase
        .from('prison_units_extended')
        .select('id');
      
      // Total de magistrados ativos
      const { data: magistrates } = await supabase
        .from('magistrates')
        .select('id')
        .eq('active', true);
      
      // Total de promotores ativos
      const { data: prosecutors } = await supabase
        .from('prosecutors')
        .select('id')
        .eq('active', true);
      
      // Total de defensores ativos
      const { data: defenders } = await supabase
        .from('defenders')
        .select('id')
        .eq('active', true);

      return {
        todayAudiences: todayAudiences?.length || 0,
        prisonUnits: prisonUnits?.length || 0,
        totalOperators: (magistrates?.length || 0) + (prosecutors?.length || 0) + (defenders?.length || 0),
        todayAudiencesData: todayAudiences || []
      };
    },
  });

  // Buscar apenas serventias de Central de Custódia para o filtro de audiências
  const { data: serventias = [] } = useQuery({
    queryKey: ["serventias-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('serventias')
        .select('id, name, type')
        .eq('type', 'central_custodia')
        .order('name');
      
      if (error) {
        console.error("Erro ao buscar serventias:", error);
        return [];
      }
      
      return data || [];
    },
  });

  // Buscar audiências de hoje com detalhes - filtro apenas por Central de Custódia
  const { data: todayAudiences = [] } = useQuery({
    queryKey: ["today-audiences", audienceServentiaFilter],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      console.log("Buscando audiências para data:", today);
      
      let query = supabase
        .from('audiences')
        .select(`
          *,
          prison_units_extended (
            id,
            name,
            short_name
          ),
          serventias (
            id,
            name,
            type
          ),
          magistrates (
            id,
            name,
            phone
          ),
          prosecutors (
            id,
            name,
            phone
          ),
          defenders (
            id,
            name,
            phone
          )
        `)
        .eq('scheduled_date', today)
        .order('scheduled_time');

      // Aplicar filtro de serventia - apenas Central de Custódia
      if (audienceServentiaFilter !== "central_custodia") {
        // Se não for "central_custodia", então é um ID específico de serventia
        query = query.eq('serventia_id', audienceServentiaFilter);
      } else {
        // Se for "central_custodia", filtrar por tipo
        query = query.eq('serventias.type', 'central_custodia');
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Erro ao buscar audiências de hoje:", error);
        return [];
      }
      
      console.log("Audiências encontradas:", data);
      return data || [];
    },
  });

  // Buscar escalas ativas com suas serventias - com filtro
  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules-with-serventias", scheduleFilter],
    queryFn: async () => {
      let query = supabase
        .from("schedules")
        .select(`
          id,
          title,
          description,
          status,
          start_date,
          end_date,
          schedule_assignments!inner(
            id,
            serventia_id,
            magistrate_id,
            prosecutor_id,
            defender_id,
            judicial_assistant_id,
            serventias!inner(
              id,
              name,
              type,
              phone,
              responsible
            ),
            magistrates (
              id,
              name,
              phone,
              judicial_assistant:judicial_assistant_id (
                id,
                name,
                phone
              )
            ),
            prosecutors (
              id,
              name,
              phone
            ),
            defenders (
              id,
              name,
              phone
            )
          )
        `)
        .eq("status", "ativa");
      
      // Aplicar filtro se não for "todos"
      if (scheduleFilter !== "todos") {
        query = query.eq("schedule_assignments.serventias.type", scheduleFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Erro ao buscar escalas:", error);
        return [];
      }
      
      return data || [];
    },
  });

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
    navigate(`/audiencias?schedule=${scheduleId}&title=${encodeURIComponent(scheduleTitle)}`);
  };

  const handleViewAudienceDetails = (audienceId: string) => {
    navigate(`/audiencias?id=${audienceId}`);
  };

  const handleCall = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleWhatsApp = (phone: string, name: string) => {
    if (phone) {
      const message = encodeURIComponent(`Olá, entrando em contato com ${name} através do SisJud.`);
      window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  const pendingAudiences = todayAudiences.filter(a => a.status === 'agendada').length;
  const completedAudiences = todayAudiences.filter(a => a.status === 'realizada').length;

  const handleScheduleFilterChange = (value: string) => {
    if (value === "todos") {
      setScheduleFilter("todos");
    } else if (value === "central_custodia" || value === "macrorregiao") {
      setScheduleFilter(value as ServentiaType);
    }
  };

  const handleAudienceServentiaFilterChange = (value: string) => {
    setAudienceServentiaFilter(value);
  };

  // Função para obter cor do perfil
  const getProfileColor = (profileType: string) => {
    switch (profileType) {
      case 'magistrado':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'promotor':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'defensor':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'assessor':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
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
          value={stats?.todayAudiences || 0}
          icon={Calendar}
          description={`${pendingAudiences} pendentes, ${completedAudiences} realizadas`}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Unidades Prisionais"
          value={stats?.prisonUnits || 0}
          icon={Building}
          description="Unidades cadastradas"
        />
        <StatsCard
          title="Operadores Ativos"
          value={stats?.totalOperators || 0}
          icon={Users}
          description="Judiciário, MP e Defensoria"
        />
        <StatsCard
          title="Escalas Ativas"
          value={schedules.length}
          icon={MapPin}
          description="Plantões em funcionamento"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/*Audiências do Dia */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Audiências de Hoje</span>
              </div>
              {/* Filtro para Audiências por Central de Custódia */}
              <Select value={audienceServentiaFilter} onValueChange={handleAudienceServentiaFilterChange}>
                <SelectTrigger className="w-[220px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por central" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="central_custodia">Todas as Centrais</SelectItem>
                  {serventias.map((serventia) => (
                    <SelectItem key={serventia.id} value={serventia.id}>
                      {serventia.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAudiences.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma audiência agendada para hoje</p>
                </div>
              ) : (
                todayAudiences.map((audience) => {
                  // Safely extract prison unit name
                  const prisonUnitName = audience.prison_units_extended?.name || 'Unidade não definida';

                  return (
                    <div 
                      key={audience.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => handleViewAudienceDetails(audience.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{audience.scheduled_time}</span>
                          {getStatusBadge(audience.status)}
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">{audience.defendant_name}</p>
                        <p className="text-xs text-gray-500 truncate">{audience.process_number}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {prisonUnitName}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          <span>Mag: {audience.magistrates?.name || 'Não definido'}</span>
                          {audience.prosecutors?.name && <span className="ml-2">Prom: {audience.prosecutors.name}</span>}
                          {audience.defenders?.name && <span className="ml-2">Def: {audience.defenders.name}</span>}
                        </div>
                      </div>
                      <div className="flex items-center ml-4">
                        {audience.status === "realizada" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Escalas e Plantões */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span>Escalas e Plantões</span>
              </div>
              {/* Filtro para Escalas */}
              <Select value={scheduleFilter} onValueChange={handleScheduleFilterChange}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por região" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Regiões</SelectItem>
                  <SelectItem value="central_custodia">Centrais de Custódia</SelectItem>
                  <SelectItem value="macrorregiao">Macrorregiões</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <div key={schedule.id} className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-lg text-black truncate">{schedule.title}</span>
                          <Badge className="bg-green-100 text-green-800 flex-shrink-0">Ativa</Badge>
                        </div>
                        {schedule.description && (
                          <p className="text-sm text-blue-600 truncate mt-1">{schedule.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Informações dos profissionais */}
                    {schedule.schedule_assignments.map((assignment) => (
                      <div key={assignment.id} className="mt-4 space-y-3">
                        <div className="text-sm font-medium text-blue-700 border-b border-blue-200 pb-2">
                          {assignment.serventias.name}
                          {assignment.serventias.phone && (
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-blue-600 mr-2">Tel: {assignment.serventias.phone}</span>
                              <Button
                                size="sm"
                                className="h-6 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleWhatsApp(assignment.serventias.phone, assignment.serventias.name)}
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {assignment.magistrates && (
                          <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${getProfileColor('magistrado')}`}>
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                Magistrado: {assignment.magistrates.name}
                              </span>
                              {assignment.magistrates.phone && (
                                <div className="text-xs mt-1">Tel: {assignment.magistrates.phone}</div>
                              )}
                            </div>
                            {assignment.magistrates.phone && (
                              <Button
                                size="sm"
                                className="h-6 px-3 text-xs bg-green-600 hover:bg-green-700 text-white ml-2"
                                onClick={() => handleWhatsApp(assignment.magistrates.phone, assignment.magistrates.name)}
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {assignment.prosecutors && (
                          <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${getProfileColor('promotor')}`}>
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                Promotor: {assignment.prosecutors.name}
                              </span>
                              {assignment.prosecutors.phone && (
                                <div className="text-xs mt-1">Tel: {assignment.prosecutors.phone}</div>
                              )}
                            </div>
                            {assignment.prosecutors.phone && (
                              <Button
                                size="sm"
                                className="h-6 px-3 text-xs bg-green-600 hover:bg-green-700 text-white ml-2"
                                onClick={() => handleWhatsApp(assignment.prosecutors.phone, assignment.prosecutors.name)}
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {assignment.defenders && (
                          <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${getProfileColor('defensor')}`}>
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                Defensor: {assignment.defenders.name}
                              </span>
                              {assignment.defenders.phone && (
                                <div className="text-xs mt-1">Tel: {assignment.defenders.phone}</div>
                              )}
                            </div>
                            {assignment.defenders.phone && (
                              <Button
                                size="sm"
                                className="h-6 px-3 text-xs bg-green-600 hover:bg-green-700 text-white ml-2"
                                onClick={() => handleWhatsApp(assignment.defenders.phone, assignment.defenders.name)}
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {assignment.magistrates?.judicial_assistant && (
                          <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${getProfileColor('assessor')}`}>
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                Assessor: {assignment.magistrates.judicial_assistant.name}
                              </span>
                              {assignment.magistrates.judicial_assistant.phone && (
                                <div className="text-xs mt-1">Tel: {assignment.magistrates.judicial_assistant.phone}</div>
                              )}
                            </div>
                            {assignment.magistrates.judicial_assistant.phone && (
                              <Button
                                size="sm"
                                className="h-6 px-3 text-xs bg-green-600 hover:bg-green-700 text-white ml-2"
                                onClick={() => handleWhatsApp(assignment.magistrates.judicial_assistant.phone, assignment.magistrates.judicial_assistant.name)}
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="mt-4 pt-3 border-t border-blue-200 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-sm h-8 px-4 border-blue-300 text-blue-700 hover:bg-blue-100"
                        onClick={() => handleViewScheduleAudiences(schedule.id, schedule.title)}
                      >
                        Ver Audiências
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Nenhuma escala ativa encontrada</p>
                </div>
              )}
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
            {pendingAudiences > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    {pendingAudiences} audiências pendentes para hoje
                  </p>
                  <p className="text-xs text-yellow-600 truncate">Verifique o status das audiências agendadas</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  onClick={() => navigate('/audiencias')}
                >
                  Ver Todas
                </Button>
              </div>
            )}
            
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
