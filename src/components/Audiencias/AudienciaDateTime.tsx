
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AudienciaDateTimeProps {
  form: UseFormReturn<any>;
}

const AudienciaDateTime = ({ form }: AudienciaDateTimeProps) => {
  // Buscar regiões
  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Buscar unidades prisionais baseadas na região selecionada
  const selectedRegionId = form.watch("region_id");
  const { data: prisonUnits } = useQuery({
    queryKey: ["prison-units", selectedRegionId],
    queryFn: async () => {
      if (!selectedRegionId) return [];
      
      const { data, error } = await supabase
        .from("prison_units_extended")
        .select("*")
        .eq("region_id", selectedRegionId)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedRegionId,
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="scheduled_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data da Audiência *</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="scheduled_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Horário *</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="region_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Região *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma região" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {regions?.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name} ({region.type})
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
        name="prison_unit_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unidade Prisional *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {prisonUnits?.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            {!selectedRegionId && (
              <p className="text-sm text-gray-500">
                Selecione uma região primeiro
              </p>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};

export default AudienciaDateTime;
