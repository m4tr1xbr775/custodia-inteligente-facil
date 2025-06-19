
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
import ServentiaBasedAssignments from "./ServentiaBasedAssignments";
import AudienciaPrisonUnit from "./AudienciaPrisonUnit";

const audienciaSchema = z.object({
  defendant_name: z.string().min(1, "Nome do réu é obrigatório"),
  process_number: z.string().min(1, "Número do processo é obrigatório"),
  scheduled_date: z.string().min(1, "Data é obrigatória"),
  scheduled_time: z.string().min(1, "Horário é obrigatório"),
  schedule_id: z.string().min(1, "Central de Custódia é obrigatória"),
  prison_unit_id: z.string().min(1, "Unidade prisional é obrigatória"),
  magistrate_id: z.string().optional(),
  prosecutor_id: z.string().optional(),
  defender_id: z.string().optional(),
  judicial_assistant_id: z.string().optional(),
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
      process_number: initialData?.process_number || "",
      scheduled_date: initialData?.scheduled_date || "",
      scheduled_time: initialData?.scheduled_time || "",
      schedule_id: initialData?.schedule_id || "",
      prison_unit_id: initialData?.prison_unit_id || "",
      magistrate_id: initialData?.magistrate_id || "",
      prosecutor_id: initialData?.prosecutor_id || "",
      defender_id: initialData?.defender_id || "",
      judicial_assistant_id: initialData?.judicial_assistant_id || "",
      virtual_room_url: initialData?.virtual_room_url || "",
      observations: initialData?.observations || "",
    },
  });

  // Watch dos campos de serventia e data para filtrar plantonistas
  const selectedScheduleId = form.watch("schedule_id");
  const selectedDate = form.watch("scheduled_date");

  const mutation = useMutation({
    mutationFn: async (data: AudienciaFormData) => {
      console.log("Dados sendo enviados:", data);
      
      // Verificar se já existe uma audiência no mesmo horário e unidade (apenas para criação)
      if (!isEditing) {
        console.log("Verificando conflitos de horário...");
        const { data: existingAudiences, error: conflictError } = await supabase
          .from('audiences')
          .select('id')
          .eq('prison_unit_id', data.prison_unit_id)
          .eq('scheduled_date', data.scheduled_date)
          .eq('scheduled_time', data.scheduled_time);
        
        if (conflictError) {
          console.error("Erro ao verificar conflitos:", conflictError);
          throw new Error("Erro ao verificar conflitos de horário");
        }
        
        if (existingAudiences && existingAudiences.length > 0) {
          throw new Error("Já existe uma audiência agendada para este horário e unidade prisional. Por favor, escolha outro horário.");
        }
      }
      
      // Buscar a serventia baseada na escala selecionada e data
      let serventiaId = null;
      if (data.schedule_id && data.scheduled_date) {
        console.log("Buscando serventia_id para schedule_id:", data.schedule_id, "e data:", data.scheduled_date);
        
        const { data: assignments, error: assignmentError } = await supabase
          .from('schedule_assignments')
          .select('serventia_id')
          .eq('schedule_id', data.schedule_id)
          .eq('date', data.scheduled_date)
          .limit(1);
        
        if (assignmentError) {
          console.error("Erro ao buscar assignment:", assignmentError);
        } else {
          console.log("Assignments encontrados:", assignments);
          if (assignments && assignments.length > 0) {
            serventiaId = assignments[0].serventia_id;
            console.log("Serventia ID encontrado:", serventiaId);
          }
        }
      }
      
      // Se não encontrou serventia_id através dos assignments, tentar uma abordagem alternativa
      if (!serventiaId && data.schedule_id) {
        console.log("Tentando buscar serventia através de qualquer assignment da escala");
        const { data: fallbackAssignments, error: fallbackError } = await supabase
          .from('schedule_assignments')
          .select('serventia_id')
          .eq('schedule_id', data.schedule_id)
          .limit(1);
        
        if (!fallbackError && fallbackAssignments && fallbackAssignments.length > 0) {
          serventiaId = fallbackAssignments[0].serventia_id;
          console.log("Serventia ID encontrado via fallback:", serventiaId);
        }
      }
      
      // Se ainda não encontrou serventia_id, usar uma serventia padrão ou criar erro
      if (!serventiaId) {
        console.log("Buscando uma serventia padrão");
        const { data: defaultServentia, error: serventiaError } = await supabase
          .from('serventias')
          .select('id')
          .limit(1);
        
        if (!serventiaError && defaultServentia && defaultServentia.length > 0) {
          serventiaId = defaultServentia[0].id;
          console.log("Usando serventia padrão:", serventiaId);
        } else {
          throw new Error("Não foi possível determinar a serventia para esta audiência. Verifique se a escala tem assignments configurados.");
        }
      }
      
      // Helper function to handle "none" values
      const handleNoneValue = (value?: string) => {
        return value === "none" || !value ? null : value;
      };
      
      // Preparar os dados para inserção/atualização
      const audienceData = {
        defendant_name: data.defendant_name,
        process_number: data.process_number,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        serventia_id: serventiaId,
        prison_unit_id: data.prison_unit_id,
        magistrate_id: handleNoneValue(data.magistrate_id),
        prosecutor_id: handleNoneValue(data.prosecutor_id),
        defender_id: handleNoneValue(data.defender_id),
        judicial_assistant_id: handleNoneValue(data.judicial_assistant_id),
        virtual_room_url: data.virtual_room_url || null,
        observations: data.observations || null,
      };
      
      console.log("Dados finais para inserção:", audienceData);
      
      if (isEditing && initialData?.id) {
        console.log("Atualizando audiência com ID:", initialData.id);
        const { data: result, error } = await supabase
          .from("audiences")
          .update(audienceData)
          .eq("id", initialData.id)
          .select()
          .single();
        
        if (error) {
          console.error("Erro ao atualizar audiência:", error);
          throw error;
        }
        console.log("Audiência atualizada com sucesso:", result);
        return result;
      } else {
        console.log("Criando nova audiência");
        const { data: result, error } = await supabase
          .from("audiences")
          .insert([audienceData])
          .select()
          .single();
        
        if (error) {
          console.error("Erro ao criar audiência:", error);
          throw error;
        }
        console.log("Audiência criada com sucesso:", result);
        return result;
      }
    },
    onSuccess: () => {
      console.log("Operação bem-sucedida, invalidando queries");
      queryClient.invalidateQueries({ queryKey: ["audiences"] });
      queryClient.invalidateQueries({ queryKey: ["audiencia", initialData?.id] });
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

  const handleCancel = () => {
    console.log("Cancelando operação");
    onSuccess(); // Fecha o modal
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Central de Custódia e Plantonistas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Central de Custódia e Plantonistas</h3>
            <ServentiaBasedAssignments 
              form={form} 
              selectedScheduleId={selectedScheduleId} 
              selectedDate={selectedDate} 
            />
          </div>
          
          {/* Informações do Processo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações do Processo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AudienciaBasicInfo form={form} />
            </div>
          </div>
          
          {/* Unidade Prisional e Agendamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Unidade Prisional e Agendamento</h3>
            <AudienciaPrisonUnit form={form} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AudienciaDateTime form={form} />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Salvando..." : isEditing ? "Atualizar" : "Criar Audiência"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AudienciaForm;
