
import { useState } from "react";
import { Calendar, Plus, Search, Filter, ExternalLink, MapPin, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AudienciaModal from "@/components/Audiencias/AudienciaModal";
import DateFilter from "@/components/Audiencias/DateFilter";
import { ProjudiIcon } from "@/components/ui/projudi-icon";
import { Database } from "@/integrations/supabase/types";
import { addDays, subDays, startOfDay, endOfDay, isAfter, isBefore, isWithinInterval } from "date-fns";
import { parseLocalDate, formatLocalDate } from "@/lib/dateUtils";

type AudienceStatus = Database["public"]["Enums"]["audience_status"];

const Audiencias = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [custodyCenterFilter, setCustodyCenterFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("futuras");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAudienciaId, setEditingAudienciaId] = useState<string | undefined>();
  const [deletingAudienceId, setDeletingAudienceId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch custody centers for the filter
  const { data: custodyCenters = [] } = useQuery({
    queryKey: ['custody-centers'],
    queryFn: async () => {
      console.log("Buscando centrais de custódia...");
      
      const { data, error } = await supabase
        .from('serventias')
        .select('id, name')
        .eq('type', 'central_custodia')
        .order('name');
      
      if (error) {
        console.error("Erro ao buscar centrais de custódia:", error);
        return [];
      }
      
      console.log("Centrais de custódia encontradas:", data);
      return data || [];
    },
  });

  // Fixed audiences query
  const { data: audiencesData, isLoading } = useQuery({
    queryKey: ['audiences'],
    queryFn: async () => {
      console.log("Buscando audiências...");
      
      const { data: audiences, error: audiencesError } = await supabase
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
            phone,
            judicial_assistant_id,
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
            phone,
            type
          )
        `)
        .order('scheduled_date', { ascending: true });
      
      if (audiencesError) {
        console.error("Erro ao buscar audiências:", audiencesError);
        throw audiencesError;
      }
      
      console.log("Audiências encontradas:", audiences);
      return audiences || [];
    },
  });

  // Mutation para atualizar status da audiência
  const updateStatusMutation = useMutation({
    mutationFn: async ({ audienceId, newStatus }: { audienceId: string; newStatus: AudienceStatus }) => {
      const { error } = await supabase
        .from('audiences')
        .update({ status: newStatus })
        .eq('id', audienceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] });
      toast({
        title: "Status atualizado",
        description: "O status da audiência foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da audiência.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUpdatingStatusId(null);
    }
  });

  const getDateRange = () => {
    const today = new Date();
    
    switch (dateFilter) {
      case 'futuras':
        return { start: startOfDay(today), end: null };
      case 'ultimos-7':
        return { start: startOfDay(subDays(today, 7)), end: endOfDay(today) };
      case 'ultimos-30':
        return { start: startOfDay(subDays(today, 30)), end: endOfDay(today) };
      case 'personalizado':
        if (customStartDate && customEndDate) {
          return { 
            start: startOfDay(customStartDate), 
            end: endOfDay(customEndDate) 
          };
        }
        return { start: null, end: null };
      default:
        return { start: null, end: null };
    }
  };

  const filterAudiences = (audiences: any[]) => {
    return audiences.filter(audience => {
      const matchesSearch = 
        audience.defendant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audience.process_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audience.prison_units_extended?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "todos" || audience.status === statusFilter;
      
      const matchesCustodyCenter = custodyCenterFilter === "todos" || audience.serventia_id === custodyCenterFilter;
      
      const { start, end } = getDateRange();
      let matchesDate = true;
      
      if (start || end) {
        // Usar parseLocalDate para evitar problemas de timezone
        const audienceDate = parseLocalDate(audience.scheduled_date);
        
        if (start && end) {
          matchesDate = isWithinInterval(audienceDate, { start, end });
        } else if (start && !end) {
          matchesDate = isAfter(audienceDate, start) || audienceDate.toDateString() === start.toDateString();
        } else if (!start && end) {
          matchesDate = isBefore(audienceDate, end) || audienceDate.toDateString() === end.toDateString();
        }
      }
      
      return matchesSearch && matchesStatus && matchesCustodyCenter && matchesDate;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendada":
        return <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>;
      case "realizada":
        return <Badge className="bg-green-100 text-green-800">Realizada</Badge>;
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case "nao_compareceu":
        return <Badge className="bg-yellow-100 text-yellow-800">Não Compareceu</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUnitAcknowledgmentBadge = (acknowledgment: string) => {
    switch (acknowledgment) {
      case "confirmado":
        return <Badge className="bg-green-100 text-green-800">Confirmado pela UP</Badge>;
      case "negado":
        return <Badge className="bg-red-100 text-red-800">Negado pela UP</Badge>;
      default:
        return <Badge variant="outline" className="border-yellow-300 text-yellow-700">Pendente Confirmação</Badge>;
    }
  };

  const getRegionIcon = (serventiaType: string) => {
    return serventiaType === 'macrorregiao' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
  };

  const getRegionIconColor = (serventiaType: string) => {
    return serventiaType === 'macrorregiao' ? 'text-blue-600' : 'text-green-600';
  };

  // Função para formatar data de forma segura
  const formatAudienceDate = (dateString: string) => {
    console.log("Formatando data da audiência:", dateString);
    const date = parseLocalDate(dateString);
    const formattedDate = date.toLocaleDateString('pt-BR');
    console.log("Data formatada:", formattedDate);
    return formattedDate;
  };

  const handleNewAudiencia = () => {
    console.log("Abrindo modal para nova audiência");
    setEditingAudienciaId(undefined);
    setIsFormOpen(true);
  };

  const handleEditAudiencia = (audienciaId: string) => {
    console.log("Editando audiência com ID:", audienciaId);
    setEditingAudienciaId(audienciaId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    console.log("Fechando modal");
    setIsFormOpen(false);
    setEditingAudienciaId(undefined);
  };

  const handleStatusChange = (audienceId: string, newStatus: AudienceStatus) => {
    setUpdatingStatusId(audienceId);
    updateStatusMutation.mutate({ audienceId, newStatus });
  };

  const handleDeleteAudience = async (audienceId: string) => {
    try {
      console.log("Deletando audiência com ID:", audienceId);
      setDeletingAudienceId(audienceId);

      const { error } = await supabase
        .from('audiences')
        .delete()
        .eq('id', audienceId);

      if (error) {
        console.error("Erro ao deletar audiência:", error);
        toast({
          title: "Erro ao deletar audiência",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Audiência deletada",
        description: "A audiência foi removida com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ['audiences'] });
    } catch (error) {
      console.error("Erro inesperado ao deletar audiência:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar deletar a audiência.",
        variant: "destructive",
      });
    } finally {
      setDeletingAudienceId(null);
    }
  };

  const handleWhatsApp = (phone: string, name: string) => {
    if (phone) {
      const message = encodeURIComponent(`Olá, entrando em contato com ${name} através do SisJud.`);
      window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando audiências...</div>
      </div>
    );
  }

  const filteredAudiences = audiencesData ? filterAudiences(audiencesData) : [];

  // Group audiences by serventia with proper typing
  const audiencesByServentia = filteredAudiences.reduce((acc: Record<string, { serventia: any; audiences: any[] }>, audience) => {
    const serventiaId = audience.serventia_id || 'sem-serventia';
    if (!acc[serventiaId]) {
      acc[serventiaId] = {
        serventia: audience.serventias || { name: 'Sem Serventia', type: 'serventia' },
        audiences: []
      };
    }
    acc[serventiaId].audiences.push(audience);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audiências de Custódia</h1>
          <p className="text-gray-600">Gerencie todas as audiências do sistema por região</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNewAudiencia}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Audiência
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome, processo ou unidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={custodyCenterFilter} onValueChange={setCustodyCenterFilter}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Central de Custódia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Centrais</SelectItem>
                  {custodyCenters.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="realizada">Realizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="nao_compareceu">Não Compareceu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DateFilter
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onCustomStartDateChange={setCustomStartDate}
              onCustomEndDateChange={setCustomEndDate}
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredAudiences.length} de {audiencesData?.length || 0} audiências
          </div>
        </CardContent>
      </Card>

      {/* Audiências Agrupadas por Serventia */}
      <div className="space-y-6">
        {Object.entries(audiencesByServentia).map(([serventiaId, groupData]: [string, { serventia: any; audiences: any[] }]) => (
          <Card key={serventiaId} className={`${getRegionIcon(groupData.serventia?.type)} border-2`}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3">
                <MapPin className={`h-6 w-6 ${getRegionIconColor(groupData.serventia?.type)}`} />
                <span className={getRegionIconColor(groupData.serventia?.type)}>{groupData.serventia?.name}</span>
                <Badge variant="outline" className="ml-auto">
                  {groupData.audiences.length} audiência{groupData.audiences.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupData.audiences.map((audience) => (
                <Card key={audience.id} className="bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {formatAudienceDate(audience.scheduled_date)} - {audience.scheduled_time}
                            </span>
                          </div>
                          {getStatusBadge(audience.status)}
                          {getUnitAcknowledgmentBadge(audience.unit_acknowledgment)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{audience.defendant_name}</h3>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-600">Processo: {audience.process_number}</p>
                              <ProjudiIcon 
                                processNumber={audience.process_number} 
                                size="sm" 
                                variant="ghost"
                              />
                            </div>
                            <p className="text-sm text-gray-600">Unidade: {audience.prison_units_extended?.name}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Magistrado:</span> {audience.magistrates?.name || 'Não definido'}
                            </p>
                            {audience.magistrates?.judicial_assistant && (
                              <div className="text-sm">
                                <span className="font-medium">Assessor:</span> {audience.magistrates.judicial_assistant.name}
                                {audience.magistrates.judicial_assistant.phone && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="ml-2 h-6 px-2 text-xs text-green-600"
                                    onClick={() => handleWhatsApp(audience.magistrates.judicial_assistant.phone, audience.magistrates.judicial_assistant.name)}
                                  >
                                    WhatsApp
                                  </Button>
                                )}
                              </div>
                            )}
                            <p className="text-sm">
                              <span className="font-medium">Promotor:</span> {audience.prosecutors?.name || 'Não definido'}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Defensor:</span> {audience.defenders?.name || 'Não definido'}
                              {audience.defenders?.type && (
                                <span className="text-xs text-gray-500 ml-1">({audience.defenders.type})</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Mostrar observações se a unidade negou */}
                        {audience.unit_acknowledgment === "negado" && audience.observations && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm font-medium text-red-800 mb-1">Motivo da Negação:</p>
                            <p className="text-sm text-red-700">{audience.observations}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 lg:ml-6">
                        {/* Botão para marcar como realizada */}
                        {audience.status === "agendada" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange(audience.id, "realizada")}
                            disabled={updatingStatusId === audience.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {updatingStatusId === audience.id ? "Atualizando..." : "Marcar Realizada"}
                          </Button>
                        )}
                        
                        {audience.virtual_room_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(audience.virtual_room_url, '_blank')}
                            className="flex items-center space-x-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Sala Virtual</span>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditAudiencia(audience.id)}
                        >
                          Editar
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={deletingAudienceId === audience.id}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {deletingAudienceId === audience.id ? "Deletando..." : "Excluir"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a audiência de {audience.defendant_name}? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAudience(audience.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAudiences.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma audiência encontrada</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou adicione uma nova audiência.</p>
          </CardContent>
        </Card>
      )}

      <AudienciaModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        audienciaId={editingAudienciaId}
      />
    </div>
  );
};

export default Audiencias;
