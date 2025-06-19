
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
import { ProjudiIcon, formatProcessNumber } from "@/components/ui/projudi-icon";

interface ProcessNumberFieldProps {
  form: UseFormReturn<any>;
  readonly?: boolean;
}

const ProcessNumberField: React.FC<ProcessNumberFieldProps> = ({ form, readonly = false }) => {
  const processNumber = form.watch("process_number");

  const handleInputChange = (value: string, onChange: (value: string) => void) => {
    // Permitir apenas números e alguns caracteres de formatação
    const cleaned = value.replace(/[^\d.-]/g, '');
    onChange(cleaned);
  };

  return (
    <FormField
      control={form.control}
      name="process_number"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Número do Processo *</FormLabel>
          <FormControl>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Digite o número do processo"
                {...field}
                readOnly={readonly}
                onChange={(e) => handleInputChange(e.target.value, field.onChange)}
              />
              <ProjudiIcon 
                processNumber={processNumber} 
                size="sm" 
                variant="outline"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProcessNumberField;
