import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UnitSelector from "@/components/UnidadesPrisionais/UnitSelector";
import AudienceList from "@/components/UnidadesPrisionais/AudienceList";
import DateFilter from "@/components/Audiencias/DateFilter";
import { Card, CardContent } from "@/components/ui/card";

const UnidadesPrisionais = () => {
  const [selectedUnit, setSelectedUnit] = useState("");
  const [dateFilter, setDateFilter] = useState("futuras");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [observationsChanges, setObservationsChanges] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation to update acknowledgment status
  const updateAcknowledgmentMutation = useMutation({
    mutationFn: async ({ audienceId, status }: { audienceId: string, status: string }) => {
      console.log("Atualizando status de confirmação:", { audienceId, status });
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
      console.log("Atualizando observações:", { audienceId, observations });
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

      <div className="flex flex-col sm:flex-row gap-4">
        <UnitSelector 
          selectedUnit={selectedUnit} 
          onUnitChange={setSelectedUnit} 
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <DateFilter
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomStartDateChange={setCustomStartDate}
            onCustomEndDateChange={setCustomEndDate}
          />
        </CardContent>
      </Card>

      <AudienceList
        selectedUnit={selectedUnit}
        dateFilter={dateFilter}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        observationsChanges={observationsChanges}
        onAcknowledgmentChange={handleAcknowledgmentChange}
        onObservationsChange={handleObservationsChange}
        onSaveObservations={handleSaveObservations}
        hasObservationsChanged={hasObservationsChanged}
        isUpdatingAcknowledgment={updateAcknowledgmentMutation.isPending}
        isUpdatingObservations={updateObservationsMutation.isPending}
      />
    </div>
  );
};

export default UnidadesPrisionais;
