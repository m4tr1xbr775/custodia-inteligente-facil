
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Loader2 } from "lucide-react";

interface PrisonUnitSlotSelectorProps {
  form: UseFormReturn<any>;
  selectedDate: string;
  selectedPrisonUnitId: string;
}

const PrisonUnitSlotSelector = ({ form, selectedDate, selectedPrisonUnitId }: PrisonUnitSlotSelectorProps) => {
  // Gerar horários potenciais (09:00 às 17:45, intervalos de 15 minutos)
  const generatePotentialTimes = () => {
    const times = [];
    const startHour = 9; // 09:00
    const endHour = 18; // 18:00 (mas vamos até 17:45)
    const intervalMinutes = 15;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        // Para a última hora (17h), só incluir até 17:45
        if (hour === 17 && minute > 45) break;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const { data: availableTimes = [], isLoading } = useQuery({
    queryKey: ['available-slots', selectedPrisonUnitId, selectedDate],
    queryFn: async () => {
      if (!selectedPrisonUnitId || !selectedDate) return [];

      console.log("Calculando horários disponíveis para:", { selectedPrisonUnitId, selectedDate });

      // 1. Buscar o número de salas da unidade prisional
      const { data: unitData, error: unitError } = await supabase
        .from('prison_units_extended')
        .select('number_of_rooms')
        .eq('id', selectedPrisonUnitId)
        .single();

      if (unitError) {
        console.error("Erro ao buscar dados da unidade:", unitError);
        throw unitError;
      }

      const numberOfRooms = unitData?.number_of_rooms || 1;
      console.log("Número de salas da unidade:", numberOfRooms);

      // 2. Buscar audiências agendadas para a data e unidade
      const { data: scheduledAudiences, error: audiencesError } = await supabase
        .from('audiences')
        .select('scheduled_time')
        .eq('prison_unit_id', selectedPrisonUnitId)
        .eq('scheduled_date', selectedDate);

      if (audiencesError) {
        console.error("Erro ao buscar audiências agendadas:", audiencesError);
        throw audiencesError;
      }

      console.log("Audiências agendadas:", scheduledAudiences);

      // 3. Contar ocupação por horário
      const occupancyByTime: Record<string, number> = {};
      scheduledAudiences?.forEach(audience => {
        const timeStr = audience.scheduled_time.substring(0, 5); // "HH:MM"
        occupancyByTime[timeStr] = (occupancyByTime[timeStr] || 0) + 1;
      });

      console.log("Ocupação por horário:", occupancyByTime);

      // 4. Gerar horários potenciais e filtrar os disponíveis
      const potentialTimes = generatePotentialTimes();
      const availableTimes = potentialTimes.filter(time => {
        const currentOccupancy = occupancyByTime[time] || 0;
        return currentOccupancy < numberOfRooms;
      });

      console.log("Horários disponíveis:", availableTimes);
      return availableTimes;
    },
    enabled: !!selectedPrisonUnitId && !!selectedDate,
  });

  return (
    <FormField
      control={form.control}
      name="prison_unit_slot_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horário Disponível
          </FormLabel>
          <Select 
            onValueChange={(value) => {
              // Para compatibilidade, usamos o horário como "slot_id"
              // mas na verdade estamos armazenando o horário selecionado
              field.onChange(value);
              // Também atualizar o campo scheduled_time
              form.setValue("scheduled_time", value);
            }} 
            value={field.value}
            disabled={isLoading || !selectedPrisonUnitId || !selectedDate}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={
                  isLoading 
                    ? "Carregando horários..." 
                    : !selectedPrisonUnitId || !selectedDate 
                      ? "Selecione uma unidade e data primeiro"
                      : "Selecione um horário"
                } />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando...
                </div>
              ) : availableTimes.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhum horário disponível para esta data
                </div>
              ) : (
                availableTimes.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PrisonUnitSlotSelector;
