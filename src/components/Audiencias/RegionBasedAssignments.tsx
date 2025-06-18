
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

interface RegionBasedAssignmentsProps {
  form: UseFormReturn<any>;
  selectedRegionId: string | null;
  selectedDate: string | null;
}

const RegionBasedAssignments = ({ form, selectedRegionId, selectedDate }: RegionBasedAssignmentsProps) => {
  // Buscar assignments baseados na região e data selecionadas
  const { data: assignments } = useQuery({
    queryKey: ["schedule-assignments", selectedRegionId, selectedDate],
    queryFn: async () => {
      if (!selectedRegionId || !selectedDate) return [];
      
      const { data, error } = await supabase
        .from("schedule_assignments")
        .select(`
          *,
          magistrates(id, name),
          prosecutors(id, name),
          defenders(id, name)
        `)
        .eq("region_id", selectedRegionId)
        .eq("date", selectedDate);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedRegionId && !!selectedDate,
  });

  // Extrair listas únicas de cada tipo de profissional
  const magistrates = assignments?.filter(a => a.magistrates).map(a => a.magistrates).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) || [];
  const prosecutors = assignments?.filter(a => a.prosecutors).map(a => a.prosecutors).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) || [];
  const defenders = assignments?.filter(a => a.defenders).map(a => a.defenders).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) || [];

  if (!selectedRegionId || !selectedDate) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Selecione uma região e data para visualizar os plantonistas disponíveis.
        </p>
      </div>
    );
  }

  if (assignments?.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-yellow-600">
          Nenhum plantonista encontrado para esta região e data. Verifique se existem escalas cadastradas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="magistrate_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Magistrado</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um magistrado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
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
  );
};

export default RegionBasedAssignments;
