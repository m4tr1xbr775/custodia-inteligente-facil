
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PrisonUnitSlotSelectorProps {
  form: UseFormReturn<any>;
  selectedDate: string;
  selectedPrisonUnitId: string;
}

const PrisonUnitSlotSelector = ({ form, selectedDate, selectedPrisonUnitId }: PrisonUnitSlotSelectorProps) => {
  // Buscar slots disponíveis para a unidade prisional e data selecionadas
  const { data: availableSlots = [] } = useQuery({
    queryKey: ['available-slots', selectedPrisonUnitId, selectedDate],
    queryFn: async () => {
      if (!selectedPrisonUnitId || !selectedDate) {
        console.log("Unidade prisional ou data não selecionadas ainda");
        return [];
      }
      
      console.log("Buscando slots disponíveis para unidade:", selectedPrisonUnitId, "e data:", selectedDate);
      
      const { data, error } = await supabase
        .from('prison_unit_slots')
        .select('*')
        .eq('prison_unit_id', selectedPrisonUnitId)
        .eq('date', selectedDate)
        .eq('is_available', true)
        .order('time');
      
      if (error) {
        console.error("Erro ao buscar slots disponíveis:", error);
        return [];
      }
      
      console.log("Slots disponíveis encontrados:", data);
      return data || [];
    },
    enabled: !!selectedPrisonUnitId && !!selectedDate,
  });

  const handleSlotChange = (slotId: string) => {
    const selectedSlot = availableSlots.find(s => s.id === slotId);
    if (selectedSlot) {
      console.log("Slot selecionado:", selectedSlot);
      
      // Preencher os campos de horário
      form.setValue("scheduled_time", selectedSlot.time);
      form.setValue("prison_unit_slot_id", slotId);
    }
  };

  const formatSlotLabel = (slot: any) => {
    return `${slot.time} - Disponível`;
  };

  return (
    <FormField
      control={form.control}
      name="prison_unit_slot_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Horário Disponível *</FormLabel>
          <Select onValueChange={handleSlotChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário disponível" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availableSlots.length > 0 ? (
                availableSlots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {formatSlotLabel(slot)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-slots" disabled>
                  Nenhum horário disponível para esta data e unidade
                </SelectItem>
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
