
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatLocalDate, getTodayLocalString, isValidDateString } from "@/lib/dateUtils";

interface AudienciaDateTimeProps {
  form: UseFormReturn<any>;
}

const AudienciaDateTime = ({ form }: AudienciaDateTimeProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="scheduled_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data da Audiência *</FormLabel>
            <FormControl>
              <Input 
                type="date" 
                {...field}
                min={getTodayLocalString()}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  console.log("Data selecionada pelo usuário:", dateValue);
                  
                  // Validar formato antes de aceitar
                  if (dateValue && isValidDateString(dateValue)) {
                    console.log("Data válida, atualizando field:", dateValue);
                    field.onChange(dateValue);
                  } else if (dateValue === '') {
                    // Permitir campo vazio
                    field.onChange('');
                  } else {
                    console.warn("Formato de data inválido:", dateValue);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AudienciaDateTime;
