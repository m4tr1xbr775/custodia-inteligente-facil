
import { useState } from "react";
import { Calendar, CheckCircle, XCircle, Clock, ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const UnidadesPrisionais = () => {
  const [selectedUnit, setSelectedUnit] = useState("");
  const [observationsChanges, setObservationsChanges] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch prison units from the new table
  const { data: prisonUnits } = useQuery({
    queryKey: ['prison_units_extended'],
    queryFn: async () => {
      console.log("Buscando unidades prisionais...");
      const { data, error } = await supabase
        .from('prison_units_extended')
        .select('*')
        .order('name');
      if (error) {
        console.error("Erro ao buscar unidades prisionais:", error);
        throw error;
      }
      console.log("Unidades prisionais encontradas:", data);
      return data;
    },
  });

  // Fetch audiences for selected unit using manual joins
  const { data: audiences, isLoading } = useQuery({
    queryKey: ['unit_audiences', selectedUnit],
    queryFn: async () => {
      if (!selectedUnit) return [];
      
      console.log("Buscando audiências para unidade:", selectedUnit);
      
      // Primeiro, buscar as audiências da unidade
      const { data: audiences, error: audiencesError } = await supabase
        .from('audiences')
        .select('*')
        .eq('prison_unit_id', selectedUnit)
        .order('scheduled_date', { ascending: true });
      
      if (audiencesError) {
        console.error("Erro ao buscar audiências:", audiencesError);
        throw audiencesError;
      }
      
      if (!audiences || audiences.length === 0) {
        console.log("Nenhuma audiência encontrada para esta unidade");
        return [];
      }
      
      // Buscar as serventias relacionadas
      const serventiaIds = [...new Set(audiences.map(a => a.serventia_id).filter(Boolean))];
      let serventias = [];
      if (serventiaIds.length > 0) {
        const { data: serventiasData, error: serventiasError } = await supabase
          .from('serventias')
          .select('id, name, type')
          .in('id', serventiaIds);
        
        if (serventiasError) {
          console.error("Erro ao buscar serventias:", serventiasError);
        } else {
          serventias = serventiasData || [];
        }
      }
      
      // Buscar a unidade prisional
      const { data: prisonUnit, error: prisonUnitError } = await supabase
        .from('prison_units_extended')
        .select('id, name, short_name')
        .eq('id', selectedUnit)
        .single();
      
      if (prisonUnitError) {
        console.error("Erro ao buscar unidade prisional:", prisonUnitError);
      }
      
      // Combinar os dados
      const audiencesWithRelations = audiences.map(audience => {
        const serventia = serventias.find(s => s.id === audience.serventia_id);
        
        return {
          ...audience,
          serventias: serventia,
          prison_units_extended: prisonUnit
        };
      });
      
      console.log("Audiências com relações encontradas:", audiencesWithRelations);
      return audiencesWithRelations;
    },
    enabled: !!selectedUnit,
  });

  // Mutation to update acknowledgment status
  const updateAcknowledgmentMutation = useMutation({
    mutationFn: async ({ audienceId, status }: { audienceId: string, status: string }) => {
      const { data, error } = await supabase
        .from('audiences')
        .update({ unit_acknowledgment: status })
        .eq('id', audienceId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit_audiences'] });
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error updating acknowledgment:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive",
      });
    },
  });

  // Mutation to update observations
  const updateObservationsMutation = useMutation({
    mutationFn: async ({ audienceId, observations }: { audienceId: string, observations: string }) => {
      const { data, error } = await supabase
        .from('audiences')
        .update({ observations })
        .eq('id', audienceId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit_audiences'] });
      setObservationsChanges({});
      toast({
        title: "Sucesso",
        description: "Observações atualizadas com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error updating observations:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar observações",
        variant: "destructive",
      });
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

  const getAcknowledgmentBadge = (acknowledgment: string) => {
    switch (acknowledgment) {
      case "confirmado":
        return <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-semibold">✓ CONFIRMADO</Badge>;
      case "negado":
        return <Badge className="bg-red-500 text-white text-xs px-2 py-1 font-semibold">✗ NEGADO</Badge>;
      default:
        return <Badge className="bg-yellow-500 text-white text-xs px-2 py-1 font-semibold">⏳ PENDENTE</Badge>;
    }
  };

  const handleAcknowledgmentChange = (audienceId: string, status: string) => {
    updateAcknowledgmentMutation.mutate({ audienceId, status });
  };

  const handleObservationsChange = (audienceId: string, observations: string) => {
    setObservationsChanges(prev => ({
      ...prev,
      [audienceId]: observations
    }));
  };

  const handleSaveObservations = (audienceId: string) => {
    const newObservations = observationsChanges[audienceId];
    if (newObservations !== undefined) {
      updateObservationsMutation.mutate({ audienceId, observations: newObservations });
    }
  };

  const hasObservationsChanged = (audienceId: string, currentObservations: string) => {
    return observationsChanges[audienceId] !== undefined && 
           observationsChanges[audienceId] !== (currentObservations || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel das Unidades Prisionais</h1>
          <p className="text-gray-600">Visualize e confirme as audiências dos custodiados de sua unidade</p>
        </div>
      </div>

      {/* Seleção da Unidade */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione sua Unidade Prisional</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma unidade prisional" />
            </SelectTrigger>
            <SelectContent>
              {prisonUnits?.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de Audiências */}
      {selectedUnit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Audiências Agendadas</span>
              {audiences && (
                <Badge variant="outline" className="ml-auto">
                  {audiences.length} audiência{audiences.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="text-center py-8">
                <div className="text-lg">Carregando audiências...</div>
              </div>
            )}

            {audiences && audiences.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma audiência agendada</h3>
                <p className="text-gray-600">Não há audiências agendadas para esta unidade no momento.</p>
              </div>
            )}

            <div className="space-y-4">
              {audiences?.map((audience) => (
                <Card key={audience.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                          {/* Status de confirmação em posição destacada */}
                          {getAcknowledgmentBadge(audience.unit_acknowledgment)}
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-lg">
                              {new Date(audience.scheduled_date).toLocaleDateString('pt-BR')} às {audience.scheduled_time}
                            </span>
                          </div>
                          {getStatusBadge(audience.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-xl text-gray-900">{audience.defendant_name}</h3>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Processo:</span> {audience.process_number}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Central:</span> {audience.serventias?.name || 'Não informado'}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium">Magistrado:</span> {audience.magistrate_id || 'Não definido'}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Promotor:</span> {audience.prosecutor_id || 'Não definido'}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Defensor:</span> {audience.defender_id || 'Não definido'}
                            </p>
                          </div>
                        </div>

                        {audience.virtual_room_url && (
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(audience.virtual_room_url, '_blank')}
                              className="flex items-center space-x-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>Acessar Sala Virtual</span>
                            </Button>
                          </div>
                        )}

                        {/* Campo de observações com botão de atualização */}
                        <div className="mt-4">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Observações:
                          </label>
                          <div className="flex gap-2">
                            <Textarea
                              placeholder="Adicione observações ou motivo da negação..."
                              value={observationsChanges[audience.id] !== undefined 
                                ? observationsChanges[audience.id] 
                                : (audience.observations || '')}
                              onChange={(e) => handleObservationsChange(audience.id, e.target.value)}
                              className="flex-1 min-h-[80px] text-sm"
                              disabled={updateObservationsMutation.isPending}
                            />
                            {hasObservationsChanged(audience.id, audience.observations) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSaveObservations(audience.id)}
                                disabled={updateObservationsMutation.isPending}
                                className="flex items-center space-x-2 self-start"
                              >
                                <Save className="h-4 w-4" />
                                <span>Salvar</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="lg:ml-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Status da Confirmação:</label>
                            <Select
                              value={audience.unit_acknowledgment}
                              onValueChange={(value) => handleAcknowledgmentChange(audience.id, value)}
                              disabled={updateAcknowledgmentMutation.isPending}
                            >
                              <SelectTrigger className="w-[180px] mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendente">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                    <span>Pendente</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="confirmado">
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Confirmado</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="negado">
                                  <div className="flex items-center space-x-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span>Negado</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnidadesPrisionais;
