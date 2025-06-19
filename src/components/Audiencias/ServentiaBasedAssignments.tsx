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
  // Buscar apenas escalas que têm atribuições completas (magistrado, promotor, defensor)
  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules-with-assignments'],
    queryFn: async () => {
      console.log("Buscando escalas com atribuições...");
      
      // Primeiro buscar todas as escalas ativas
      const { data: allSchedules, error: schedulesError } = await supabase
        .from('schedules')
        .select('id, title, description')
        .eq('status', 'ativa')
        .order('title');
      
      if (schedulesError) {
        console.error("Erro ao buscar escalas:", schedulesError);
        return [];
      }
      
      if (!allSchedules || allSchedules.length === 0) {
        console.log("Nenhuma escala ativa encontrada");
        return [];
      }
      
      // Para cada escala, verificar se tem assignments com atribuições
      const schedulesWithAssignments = [];
      
      for (const schedule of allSchedules) {
        const { data: assignments, error: assignmentsError } = await supabase
          .from('schedule_assignments')
          .select('magistrate_id, prosecutor_id, defender_id, judicial_assistant_id')
          .eq('schedule_id', schedule.id)
          .not('magistrate_id', 'is', null)
          .not('prosecutor_id', 'is', null)
          .not('defender_id', 'is', null);
        
        if (assignmentsError) {
          console.error("Erro ao buscar assignments para escala:", schedule.id, assignmentsError);
          continue;
        }
        
        // Se encontrou pelo menos um assignment com magistrado, promotor e defensor
        if (assignments && assignments.length > 0) {
          schedulesWithAssignments.push(schedule);
        }
      }
      
      console.log("Escalas com atribuições encontradas:", schedulesWithAssignments);
      return schedulesWithAssignments;
    },
  });

  // Buscar plantonistas baseado na serventia e data selecionados
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

  // Buscar todos os magistrados, promotores e defensores para fallback
  const { data: magistrates = [] } = useQuery({
    queryKey: ['magistrates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('magistrates')
        .select('id, name, virtual_room_url')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error("Erro ao buscar magistrados:", error);
        return [];
      }
      
      return data || [];
    },
  });

  const { data: prosecutors = [] } = useQuery({
    queryKey: ['prosecutors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prosecutors')
        .select('id, name')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error("Erro ao buscar promotores:", error);
        return [];
      }
      
      return data || [];
    },
  });

  const { data: defenders = [] } = useQuery({
    queryKey: ['defenders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('defenders')
        .select('id, name')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error("Erro ao buscar defensores:", error);
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
    }
  }, [assignments, form]);

  // Auto-preencher URL da sala virtual quando magistrado é selecionado
  const handleMagistrateChange = (magistrateId: string) => {
    form.setValue("magistrate_id", magistrateId);
    
    const selectedMagistrate = magistrates.find(m => m.id === magistrateId);
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
                  <SelectValue placeholder="Selecione uma escala" />
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
                    Nenhuma escala com atribuições encontrada
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
                  {magistrates.map((magistrate) => (
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
                  {magistrates.map((magistrate) => (
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
                  {prosecutors.map((prosecutor) => (
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
                  {defenders.map((defender) => (
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
