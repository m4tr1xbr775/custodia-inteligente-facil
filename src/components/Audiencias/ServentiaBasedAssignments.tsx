
import React, { useState } from "react";
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
import ScheduleAssignmentSelector from "./ScheduleAssignmentSelector";

interface ServentiaBasedAssignmentsProps {
  form: UseFormReturn<any>;
  selectedScheduleId: string;
  selectedDate: string;
  selectedPrisonUnitId: string;
  showPrisonUnitSelector?: boolean;
  showSlotSelector?: boolean;
}

const ServentiaBasedAssignments = ({ 
  form, 
  selectedScheduleId, 
  selectedDate, 
  selectedPrisonUnitId,
  showPrisonUnitSelector = true,
  showSlotSelector = true
}: ServentiaBasedAssignmentsProps) => {
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  // Buscar unidades prisionais
  const { data: prisonUnits = [] } = useQuery({
    queryKey: ['prison-units-for-assignment'],
    queryFn: async () => {
      console.log("Buscando unidades prisionais...");
      
      const { data, error } = await supabase
        .from('prison_units_extended')
        .select('id, name, short_name')
        .order('name');
      
      if (error) {
        console.error("Erro ao buscar unidades prisionais:", error);
        return [];
      }
      
      console.log("Unidades prisionais encontradas:", data);
      return data || [];
    },
  });

  const handleAssignmentSelect = (assignment: any) => {
    setSelectedAssignment(assignment);
  };

  return (
    <div className="space-y-4">
      {/* 1. Seletor de Plantão (Schedule Assignment) */}
      <ScheduleAssignmentSelector
        form={form}
        selectedDate={selectedDate}
        onAssignmentSelect={handleAssignmentSelect}
      />

      {/* Informações do Plantão Selecionado */}
      {selectedAssignment && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">Plantão Selecionado:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div><strong>Escala:</strong> {selectedAssignment.schedules?.title}</div>
            <div><strong>Central:</strong> {selectedAssignment.serventias?.name}</div>
            <div><strong>Turno:</strong> {selectedAssignment.shift}</div>
            <div><strong>Juiz:</strong> {selectedAssignment.magistrates?.name || 'N/A'}</div>
            <div><strong>Promotor:</strong> {selectedAssignment.prosecutors?.name || 'N/A'}</div>
            <div><strong>Defensor:</strong> {selectedAssignment.defenders?.name || 'N/A'}</div>
            <div><strong>Assessor:</strong> {selectedAssignment.judicial_assistant?.name || 'N/A'}</div>
            <div><strong>Telefone Assessor:</strong> {selectedAssignment.judicial_assistant?.phone || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* 2. Seletor de Unidade Prisional */}
      {showPrisonUnitSelector && (
        <FormField
          control={form.control}
          name="prison_unit_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade Prisional *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma unidade prisional" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {prisonUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.short_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default ServentiaBasedAssignments;
