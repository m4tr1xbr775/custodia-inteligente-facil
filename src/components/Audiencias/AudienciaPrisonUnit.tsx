
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

interface AudienciaPrisonUnitProps {
  form: UseFormReturn<any>;
}

const AudienciaPrisonUnit = ({ form }: AudienciaPrisonUnitProps) => {
  // Buscar unidades prisionais
  const { data: prisonUnits = [] } = useQuery({
    queryKey: ['prison-units'],
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

  return (
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
                  <div className="flex flex-col">
                    <span>{unit.name}</span>
                    {unit.short_name && (
                      <span className="text-xs text-muted-foreground">
                        {unit.short_name}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AudienciaPrisonUnit;
