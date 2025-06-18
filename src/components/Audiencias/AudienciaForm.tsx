
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AudienciaBasicInfo from "./AudienciaBasicInfo";
import AudienciaDateTime from "./AudienciaDateTime";
import RegionBasedAssignments from "./RegionBasedAssignments";

const audienciaSchema = z.object({
  defendant_name: z.string().min(1, "Nome do réu é obrigatório"),
  defendant_document: z.string().optional(),
  process_number: z.string().min(1, "Número do processo é obrigatório"),
  scheduled_date: z.string().min(1, "Data é obrigatória"),
  scheduled_time: z.string().min(1, "Horário é obrigatório"),
  schedule_id: z.string().min(1, "Escala é obrigatória"),
  prison_unit_id: z.string().min(1, "Unidade prisional é obrigatória"),
  magistrate_id: z.string().optional(),
  prosecutor_id: z.string().optional(),
  defender_id: z.string().optional(),
  virtual_room_url: z.string().url().optional().or(z.literal("")),
  observations: z.string().optional(),
});

type AudienciaFormData = z.infer<typeof audienciaSchema>;

interface AudienciaFormProps {
  onSuccess: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const AudienciaForm = ({ onSuccess, initialData, isEditing = false }: AudienciaFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AudienciaFormData>({
    resolver: zodResolver(audienciaSchema),
    defaultValues: {
      defendant_name: initialData?.defendant_name || "",
      defendant_document: initialData?.defendant_document || "",
      process_number: initialData?.process_number || "",
      scheduled_date: initialData?.scheduled_date || "",
      scheduled_time: initialData?.scheduled_time || "",
      schedule_id: initialData?.schedule_id || "",
      prison_unit_id: initialData?.prison_unit_id || "",
      magistrate_id: initialData?.magistrate_id || "",
      prosecutor_id: initialData?.prosecutor_id || "",
      defender_id: initialData?.defender_id || "",
      virtual_room_url: initialData?.virtual_room_url || "",
      observations: initialData?.observations || "",
    },
  });

  // Watch dos campos de escala e data para filtrar plantonistas
  const selectedScheduleId = form.watch("schedule_id");
  const selectedDate = form.watch("scheduled_date");

  const mutation = useMutation({
    mutationFn: async (data: AudienciaFormData) => {
      console.log("Dados sendo enviados:", data);
      
      // Buscar a região baseada na escala selecionada
      let regionId = null;
      if (data.schedule_id && data.scheduled_date) {
        const { data: assignment } = await supabase
          .from('schedule_assignments')
          .select('region_id')
          .eq('schedule_id', data.schedule_id)
          .eq('date', data.scheduled_date)
          .limit(1)
          .single();
        
        if (assignment) {
          regionId = assignment.region_id;
        }
      }
      
      // Preparar os dados para inserção/atualização
      const audienceData = {
        defendant_name: data.defendant_name,
        defendant_document: data.defendant_document || null,
        process_number: data.process_number,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        region_id: regionId,
        prison_unit_id: data.prison_unit_id,
        magistrate_id: data.magistrate_id || null,
        prosecutor_id: data.prosecutor_id || null,
        defender_id: data.defender_id || null,
        virtual_room_url: data.virtual_room_url || null,
        observations: data.observations || null,
      };
      
      if (isEditing && initialData?.id) {
        const { data: result, error } = await supabase
          .from("audiences")
          .update(audienceData)
          .eq("id", initialData.id)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from("audiences")
          .insert([audienceData])
          .select()
          .single();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audiences"] });
      toast({
        title: "Sucesso",
        description: isEditing ? "Audiência atualizada com sucesso!" : "Audiência criada com sucesso!",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Erro ao salvar audiência:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar audiência",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AudienciaFormData) => {
    console.log("Formulário submetido com dados:", data);
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            <AudienciaBasicInfo form={form} />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Data e Horário</h3>
            <AudienciaDateTime form={form} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Escala e Plantonistas</h3>
          <RegionBasedAssignments 
            form={form} 
            selectedScheduleId={selectedScheduleId} 
            selectedDate={selectedDate} 
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando..." : isEditing ? "Atualizar" : "Criar Audiência"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AudienciaForm;
