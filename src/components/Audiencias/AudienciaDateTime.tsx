
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
    </div>
  );
};

export default AudienciaDateTime;
