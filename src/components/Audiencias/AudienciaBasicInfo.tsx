
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
import { Textarea } from "@/components/ui/textarea";

interface AudienciaBasicInfoProps {
  form: UseFormReturn<any>;
}

const AudienciaBasicInfo = ({ form }: AudienciaBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="process_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número do Processo *</FormLabel>
            <FormControl>
              <Input placeholder="Digite o número do processo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="defendant_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Réu *</FormLabel>
            <FormControl>
              <Input placeholder="Digite o nome do réu" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="defendant_document"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Documento do Réu</FormLabel>
            <FormControl>
              <Input placeholder="CPF ou RG" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="virtual_room_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL da Sala Virtual</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="observations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Observações adicionais..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AudienciaBasicInfo;
