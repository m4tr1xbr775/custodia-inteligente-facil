
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

interface ScheduleAssignmentSelectorProps {
  form: UseFormReturn<any>;
  selectedDate: string;
  onAssignmentSelect: (assignment: any) => void;
}

const ScheduleAssignmentSelector = ({ form, selectedDate, onAssignmentSelect }: ScheduleAssignmentSelectorProps) => {
  // Buscar schedule_assignments para a data selecionada
  const { data: scheduleAssignments = [] } = useQuery({
    queryKey: ['schedule-assignments-for-date', selectedDate],
    queryFn: async () => {
      if (!selectedDate) {
        console.log("Data não selecionada ainda");
        return [];
      }
      
      console.log("Buscando schedule_assignments para data:", selectedDate);
      
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          *,
          schedules!schedule_id(id, title, description),
          serventias!serventia_id(id, name, type),
          magistrates!magistrate_id(id, name, virtual_room_url, judicial_assistant_id),
          prosecutors!prosecutor_id(id, name),
          defenders!defender_id(id, name)
        `)
        .eq('date', selectedDate)
        .order('shift');
      
      if (error) {
        console.error("Erro ao buscar schedule_assignments:", error);
        return [];
      }
      
      console.log("Schedule assignments encontrados:", data);
      return data || [];
    },
    enabled: !!selectedDate,
  });

  const handleAssignmentChange = (assignmentId: string) => {
    const selectedAssignment = scheduleAssignments.find(a => a.id === assignmentId);
    if (selectedAssignment) {
      console.log("Assignment selecionado:", selectedAssignment);
      
      // Preencher todos os campos automaticamente
      form.setValue("schedule_assignment_id", assignmentId);
      form.setValue("serventia_id", selectedAssignment.serventia_id);
      form.setValue("magistrate_id", selectedAssignment.magistrate_id);
      form.setValue("prosecutor_id", selectedAssignment.prosecutor_id);
      form.setValue("defender_id", selectedAssignment.defender_id);
      
      // Preencher judicial_assistant_id do magistrate
      if (selectedAssignment.magistrates?.judicial_assistant_id) {
        form.setValue("judicial_assistant_id", selectedAssignment.magistrates.judicial_assistant_id);
      }
      
      // Preencher virtual_room_url do magistrate
      if (selectedAssignment.magistrates?.virtual_room_url) {
        form.setValue("virtual_room_url", selectedAssignment.magistrates.virtual_room_url);
      }
      
      // Notificar componente pai sobre a seleção
      onAssignmentSelect(selectedAssignment);
    }
  };

  const formatAssignmentLabel = (assignment: any) => {
    const schedule = assignment.schedules;
    const serventia = assignment.serventias;
    const magistrate = assignment.magistrates;
    const prosecutor = assignment.prosecutors;
    const defender = assignment.defenders;
    
    return `${schedule?.title} - ${serventia?.name} - ${assignment.shift} | 
            Juiz: ${magistrate?.name || 'N/A'} | 
            Promotor: ${prosecutor?.name || 'N/A'} | 
            Defensor: ${defender?.name || 'N/A'}`;
  };

  return (
    <FormField
      control={form.control}
      name="schedule_assignment_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Plantão (Escala + Profissionais) *</FormLabel>
          <Select onValueChange={handleAssignmentChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plantão para a data escolhida" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {scheduleAssignments.length > 0 ? (
                scheduleAssignments.map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {formatAssignmentLabel(assignment)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-assignments" disabled>
                  Nenhum plantão encontrado para esta data
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

export default ScheduleAssignmentSelector;
