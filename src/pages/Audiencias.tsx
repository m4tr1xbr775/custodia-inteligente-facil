
import { useState } from "react";
import { Calendar, Plus, Search, Filter, ExternalLink, MapPin } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AudienciaModal from "@/components/Audiencias/AudienciaModal";

const Audiencias = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAudienciaId, setEditingAudienciaId] = useState<string | undefined>();

  // Fetch audiences with related data using manual joins
  const { data: audiencesData, isLoading } = useQuery({
    queryKey: ['audiences'],
    queryFn: async () => {
      console.log("Buscando audiências...");
      
      // Primeiro, buscar as audiências
      const { data: audiences, error: audiencesError } = await supabase
        .from('audiences')
        .select('*')
        .order('scheduled_date', { ascending: true });
      
      if (audiencesError) {
        console.error("Erro ao buscar audiências:", audiencesError);
        throw audiencesError;
      }
      
      if (!audiences || audiences.length === 0) {
        console.log("Nenhuma audiência encontrada");
        return [];
      }
      
      // Buscar as unidades prisionais
      const prisonUnitIds = [...new Set(audiences.map(a => a.prison_unit_id))];
      const { data: prisonUnits, error: prisonUnitsError } = await supabase
        .from('prison_units_extended')
        .select('id, name, short_name')
        .in('id', prisonUnitIds);
      
      if (prisonUnitsError) {
        console.error("Erro ao buscar unidades prisionais:", prisonUnitsError);
      }
      
      // Buscar as regiões
      const regionIds = [...new Set(audiences.map(a => a.region_id).filter(Boolean))];
      const { data: regions, error: regionsError } = await supabase
        .from('regions')
        .select('id, name, type')
        .in('id', regionIds);
      
      if (regionsError) {
        console.error("Erro ao buscar regiões:", regionsError);
      }
      
      // Combinar os dados
      const audiencesWithRelations = audiences.map(audience => {
        const prisonUnit = prisonUnits?.find(pu => pu.id === audience.prison_unit_id);
        const region = regions?.find(r => r.id === audience.region_id);
        
        return {
          ...audience,
          prison_units_extended: prisonUnit,
          regions: region
        };
      });
      
      console.log("Audiências encontradas:", audiencesWithRelations);
      return audiencesWithRelations;
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

  const filterAudiences = (audiences: any[]) => {
    return audiences.filter(audience => {
      const matchesSearch = 
        audience.defendant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audience.process_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audience.prison_units_extended?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "todos" || audience.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const getRegionIcon = (regionType: string) => {
    return regionType === 'macrorregiao' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
  };

  const getRegionIconColor = (regionType: string) => {
    return regionType === 'macrorregiao' ? 'text-blue-600' : 'text-green-600';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando audiências...</div>
      </div>
    );
  }

  const filteredAudiences = audiencesData ? filterAudiences(audiencesData) : [];

  // Group audiences by region with proper typing
  const audiencesByRegion = filteredAudiences.reduce((acc: Record<string, { region: any; audiences: any[] }>, audience) => {
    const regionId = audience.region_id || 'sem-regiao';
    if (!acc[regionId]) {
      acc[regionId] = {
        region: audience.regions || { name: 'Sem Região', type: 'regiao' },
        audiences: []
      };
    }
    acc[regionId].audiences.push(audience);
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
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredAudiences.length} de {audiencesData?.length || 0} audiências
          </div>
        </CardContent>
      </Card>

      {/* Audiências Agrupadas por Região */}
      <div className="space-y-6">
        {Object.entries(audiencesByRegion).map(([regionId, groupData]: [string, { region: any; audiences: any[] }]) => (
          <Card key={regionId} className={`${getRegionIcon(groupData.region?.type)} border-2`}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3">
                <MapPin className={`h-6 w-6 ${getRegionIconColor(groupData.region?.type)}`} />
                <span className={getRegionIconColor(groupData.region?.type)}>{groupData.region?.name}</span>
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
                              {new Date(audience.scheduled_date).toLocaleDateString('pt-BR')} - {audience.scheduled_time}
                            </span>
                          </div>
                          {getStatusBadge(audience.status)}
                          {getUnitAcknowledgmentBadge(audience.unit_acknowledgment)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{audience.defendant_name}</h3>
                            <p className="text-sm text-gray-600">Processo: {audience.process_number}</p>
                            <p className="text-sm text-gray-600">Unidade: {audience.prison_units_extended?.name}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Magistrado:</span> {audience.magistrate_id ? 'Definido' : 'Não definido'}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Promotor:</span> {audience.prosecutor_id ? 'Definido' : 'Não definido'}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Defensor:</span> {audience.defender_id ? 'Definido' : 'Não definido'}
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
