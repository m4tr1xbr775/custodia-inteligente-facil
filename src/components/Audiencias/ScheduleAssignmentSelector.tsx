
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
  // Buscar schedule_assignments disponíveis
  const { data: scheduleAssignments = [] } = useQuery({
    queryKey: ['schedule-assignments-available'],
    queryFn: async () => {
      console.log("Buscando schedule_assignments disponíveis...");
      
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          *,
          schedules!schedule_id(
            id, 
            title, 
            description, 
            status, 
            start_date, 
            end_date
          ),
          serventias!serventia_id(id, name, type),
          magistrates!magistrate_id(
            id, 
            name, 
            virtual_room_url, 
            judicial_assistant_id
          ),
          prosecutors!prosecutor_id(id, name),
          defenders!defender_id(id, name),
          judicial_assistant:contacts!judicial_assistant_id(id, name, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error("Erro ao buscar schedule_assignments:", error);
        return [];
      }
      
      console.log("Schedule assignments encontrados:", data);
      
      // Filtrar apenas escalas ativas e dentro do período válido
      const now = new Date();
      const filteredAssignments = data?.filter(assignment => {
        const schedule = assignment.schedules;
        if (!schedule) return false;
        
        // Verificar se a escala está ativa
        if (schedule.status !== 'ativa') return false;
        
        // Verificar se estamos dentro do período da escala
        const startDate = new Date(schedule.start_date);
        const endDate = new Date(schedule.end_date);
        
        return now >= startDate && now <= endDate;
      }) || [];
      
      console.log("Schedule assignments filtrados (ativos):", filteredAssignments);
      return filteredAssignments;
    },
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
      
      // Preencher assessor judicial automaticamente
      if (selectedAssignment.judicial_assistant_id) {
        console.log("Preenchendo assessor judicial automaticamente:", selectedAssignment.judicial_assistant_id);
        form.setValue("judicial_assistant_id", selectedAssignment.judicial_assistant_id);
      } else if (selectedAssignment.magistrates?.judicial_assistant_id) {
        console.log("Preenchendo assessor judicial do magistrado:", selectedAssignment.magistrates.judicial_assistant_id);
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
    
    return `${schedule?.title} - ${assignment.shift} | 
            Juiz: ${magistrate?.name || 'N/A'}`;
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
                <SelectValue placeholder="Selecione um plantão" />
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
                  Nenhum plantão ativo encontrado
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
