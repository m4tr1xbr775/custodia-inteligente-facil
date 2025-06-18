import { useState } from "react";
import { Calendar, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch prison units from the new table
  const { data: prisonUnits } = useQuery({
    queryKey: ['prison_units_extended'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prison_units_extended')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch audiences for selected unit
  const { data: audiences, isLoading } = useQuery({
    queryKey: ['unit_audiences', selectedUnit],
    queryFn: async () => {
      if (!selectedUnit) return [];
      const { data, error } = await supabase
        .from('audiences')
        .select(`
          *,
          regions(name),
          prison_units_extended(name)
        `)
        .eq('prison_unit_id', selectedUnit)
        .order('scheduled_date', { ascending: true });
      
      if (error) throw error;
      return data;
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
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
      case "negado":
        return <Badge className="bg-red-100 text-red-800">Negado</Badge>;
      default:
        return <Badge variant="outline" className="border-yellow-300 text-yellow-700">Pendente</Badge>;
    }
  };

  const handleAcknowledgmentChange = (audienceId: string, status: string) => {
    updateAcknowledgmentMutation.mutate({ audienceId, status });
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
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-lg">
                              {new Date(audience.scheduled_date).toLocaleDateString('pt-BR')} às {audience.scheduled_time}
                            </span>
                          </div>
                          {getStatusBadge(audience.status)}
                          {getAcknowledgmentBadge(audience.unit_acknowledgment)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-xl text-gray-900">{audience.defendant_name}</h3>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Processo:</span> {audience.process_number}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Central:</span> {audience.regions?.name}
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

                        {audience.observations && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium">Observações:</span> {audience.observations}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="lg:ml-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Status da Confirmação:</label>
                          <Select
                            value={audience.unit_acknowledgment}
                            onValueChange={(value) => handleAcknowledgmentChange(audience.id, value)}
                            disabled={updateAcknowledgmentMutation.isPending}
                          >
                            <SelectTrigger className="w-[180px]">
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
