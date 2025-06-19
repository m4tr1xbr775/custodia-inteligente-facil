
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

interface ServentiaBasedAssignmentsProps {
  form: UseFormReturn<any>;
  selectedScheduleId: string;
  selectedDate: string;
}

const ServentiaBasedAssignments = ({ form, selectedScheduleId, selectedDate }: ServentiaBasedAssignmentsProps) => {
  // Buscar apenas escalas ativas (mesmo critério da aba Configurações - Atribuições)
  const { data: schedules = [] } = useQuery({
    queryKey: ['active-schedules'],
    queryFn: async () => {
      console.log("Buscando escalas ativas...");
      
      const { data: activeSchedules, error: schedulesError } = await supabase
        .from('schedules')
        .select('id, title, description')
        .eq('status', 'ativa')
        .order('title');
      
      if (schedulesError) {
        console.error("Erro ao buscar escalas ativas:", schedulesError);
        return [];
      }
      
      console.log("Escalas ativas encontradas:", activeSchedules);
      return activeSchedules || [];
    },
  });

  // Buscar atribuições baseado na escala e data selecionados
  const { data: assignments } = useQuery({
    queryKey: ['schedule-assignments', selectedScheduleId, selectedDate],
    queryFn: async () => {
      if (!selectedScheduleId || !selectedDate) {
        console.log("Schedule ID ou data não selecionados ainda");
        return null;
      }
      
      console.log("Buscando assignments para schedule_id:", selectedScheduleId, "e data:", selectedDate);
      
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          *,
          magistrates!magistrate_id(id, name, virtual_room_url),
          prosecutors!prosecutor_id(id, name),
          defenders!defender_id(id, name)
        `)
        .eq('schedule_id', selectedScheduleId)
        .eq('date', selectedDate);
      
      if (error) {
        console.error("Erro ao buscar assignments:", error);
        return null;
      }
      
      console.log("Assignments encontrados:", data);
      return data && data.length > 0 ? data[0] : null;
    },
    enabled: !!selectedScheduleId && !!selectedDate,
  });

  // Buscar magistrados atribuídos à central selecionada
  const { data: assignedMagistrates = [] } = useQuery({
    queryKey: ['assigned-magistrates', selectedScheduleId, selectedDate],
    queryFn: async () => {
      if (!selectedScheduleId || !selectedDate) return [];
      
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          magistrates!magistrate_id(id, name, virtual_room_url)
        `)
        .eq('schedule_id', selectedScheduleId)
        .eq('date', selectedDate)
        .not('magistrate_id', 'is', null);
      
      if (error) {
        console.error("Erro ao buscar magistrados atribuídos:", error);
        return [];
      }
      
      return data?.map(item => item.magistrates).filter(Boolean) || [];
    },
    enabled: !!selectedScheduleId && !!selectedDate,
  });

  // Buscar promotores atribuídos à central selecionada
  const { data: assignedProsecutors = [] } = useQuery({
    queryKey: ['assigned-prosecutors', selectedScheduleId, selectedDate],
    queryFn: async () => {
      if (!selectedScheduleId || !selectedDate) return [];
      
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          prosecutors!prosecutor_id(id, name)
        `)
        .eq('schedule_id', selectedScheduleId)
        .eq('date', selectedDate)
        .not('prosecutor_id', 'is', null);
      
      if (error) {
        console.error("Erro ao buscar promotores atribuídos:", error);
        return [];
      }
      
      return data?.map(item => item.prosecutors).filter(Boolean) || [];
    },
    enabled: !!selectedScheduleId && !!selectedDate,
  });

  // Buscar defensores atribuídos à central selecionada
  const { data: assignedDefenders = [] } = useQuery({
    queryKey: ['assigned-defenders', selectedScheduleId, selectedDate],
    queryFn: async () => {
      if (!selectedScheduleId || !selectedDate) return [];
      
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          defenders!defender_id(id, name)
        `)
        .eq('schedule_id', selectedScheduleId)
        .eq('date', selectedDate)
        .not('defender_id', 'is', null);
      
      if (error) {
        console.error("Erro ao buscar defensores atribuídos:", error);
        return [];
      }
      
      return data?.map(item => item.defenders).filter(Boolean) || [];
    },
    enabled: !!selectedScheduleId && !!selectedDate,
  });

  // Buscar assistentes judiciais (contatos com perfil "Assessor de Juiz")
  const { data: judicialAssistants = [] } = useQuery({
    queryKey: ['judicial-assistants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name')
        .eq('profile', 'Assessor de Juiz')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error("Erro ao buscar assistentes judiciais:", error);
        return [];
      }
      
      return data || [];
    },
  });

  // Auto-preencher campos quando os assignments são carregados
  React.useEffect(() => {
    if (assignments) {
      console.log("Auto-preenchendo campos com assignments:", assignments);
      
      if (assignments.magistrate_id) {
        form.setValue("magistrate_id", assignments.magistrate_id);
        // Auto-preencher URL da sala virtual se disponível
        if (assignments.magistrates?.virtual_room_url) {
          form.setValue("virtual_room_url", assignments.magistrates.virtual_room_url);
        }
      }
      if (assignments.prosecutor_id) {
        form.setValue("prosecutor_id", assignments.prosecutor_id);
      }
      if (assignments.defender_id) {
        form.setValue("defender_id", assignments.defender_id);
      }
      // Note: judicial_assistant_id não existe na tabela schedule_assignments
      // então não podemos auto-preencher este campo baseado nas atribuições
    }
  }, [assignments, form]);

  // Auto-preencher URL da sala virtual quando magistrado é selecionado
  const handleMagistrateChange = (magistrateId: string) => {
    form.setValue("magistrate_id", magistrateId);
    
    const selectedMagistrate = assignedMagistrates.find(m => m.id === magistrateId);
    if (selectedMagistrate?.virtual_room_url) {
      form.setValue("virtual_room_url", selectedMagistrate.virtual_room_url);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="schedule_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Central de Custódia *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma escala ativa" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {schedules.length > 0 ? (
                  schedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.title}
                      {schedule.description && ` - ${schedule.description}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-schedules" disabled>
                    Nenhuma escala ativa encontrada
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="magistrate_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Juiz/Magistrado</FormLabel>
              <Select onValueChange={handleMagistrateChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um magistrado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {assignedMagistrates.map((magistrate) => (
                    <SelectItem key={magistrate.id} value={magistrate.id}>
                      {magistrate.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="judicial_assistant_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assistente de Juiz</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um assistente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {judicialAssistants.map((assistant) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      {assistant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="prosecutor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promotor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um promotor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {assignedProsecutors.map((prosecutor) => (
                    <SelectItem key={prosecutor.id} value={prosecutor.id}>
                      {prosecutor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defender_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Defensor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um defensor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {assignedDefenders.map((defender) => (
                    <SelectItem key={defender.id} value={defender.id}>
                      {defender.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ServentiaBasedAssignments;
