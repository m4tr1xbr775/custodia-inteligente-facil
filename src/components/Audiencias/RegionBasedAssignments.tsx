
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

interface RegionBasedAssignmentsProps {
  form: UseFormReturn<any>;
  selectedScheduleId?: string;
  selectedDate?: string;
}

const RegionBasedAssignments = ({ form, selectedScheduleId, selectedDate }: RegionBasedAssignmentsProps) => {
  // Fetch active schedules
  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('status', 'ativa')
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch prison units
  const { data: prisonUnits, isLoading: prisonUnitsLoading } = useQuery({
    queryKey: ['prison-units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prison_units_extended')
        .select('id, name, short_name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch schedule assignments based on selected schedule and date
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['schedule-assignments', selectedScheduleId, selectedDate],
    queryFn: async () => {
      if (!selectedScheduleId || !selectedDate) return [];
      
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          *,
          magistrates(id, name),
          prosecutors(id, name),
          defenders(id, name),
          serventias(id, name)
        `)
        .eq('schedule_id', selectedScheduleId)
        .eq('date', selectedDate);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedScheduleId && !!selectedDate,
  });

  const formatScheduleLabel = (schedule: any) => {
    const startDate = new Date(schedule.start_date).toLocaleDateString('pt-BR');
    const endDate = new Date(schedule.end_date).toLocaleDateString('pt-BR');
    return `${schedule.title} (${startDate} - ${endDate})`;
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="schedule_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Escala *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma escala" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {schedulesLoading ? (
                  <SelectItem value="loading" disabled>Carregando escalas...</SelectItem>
                ) : (
                  schedules?.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {formatScheduleLabel(schedule)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

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
                {prisonUnitsLoading ? (
                  <SelectItem value="loading" disabled>Carregando unidades...</SelectItem>
                ) : (
                  prisonUnits?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.short_name})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {assignments && assignments.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Plantonistas Disponíveis</h4>
          
          <FormField
            control={form.control}
            name="magistrate_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Magistrado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um magistrado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {assignments
                      .filter(a => a.magistrates && a.magistrates.id)
                      .map((assignment) => (
                        <SelectItem key={assignment.magistrates.id} value={assignment.magistrates.id}>
                          {assignment.magistrates.name} - {assignment.serventias?.name}
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
            name="prosecutor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promotor</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um promotor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {assignments
                      .filter(a => a.prosecutors && a.prosecutors.id)
                      .map((assignment) => (
                        <SelectItem key={assignment.prosecutors.id} value={assignment.prosecutors.id}>
                          {assignment.prosecutors.name} - {assignment.serventias?.name}
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
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um defensor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {assignments
                      .filter(a => a.defenders && a.defenders.id)
                      .map((assignment) => (
                        <SelectItem key={assignment.defenders.id} value={assignment.defenders.id}>
                          {assignment.defenders.name} - {assignment.serventias?.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default RegionBasedAssignments;
