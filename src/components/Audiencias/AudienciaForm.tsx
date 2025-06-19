
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
import PrisonUnitSlotSelector from "./PrisonUnitSlotSelector";

const audienciaSchema = z.object({
  defendant_name: z.string().min(1, "Nome do réu é obrigatório"),
  process_number: z.string().min(1, "Número do processo é obrigatório"),
  scheduled_date: z.string().min(1, "Data é obrigatória"),
  scheduled_time: z.string().min(1, "Horário é obrigatório"),
  schedule_assignment_id: z.string().min(1, "Plantão é obrigatório"),
  prison_unit_id: z.string().min(1, "Unidade prisional é obrigatório"),
  prison_unit_slot_id: z.string().min(1, "Horário disponível é obrigatório"),
  serventia_id: z.string().optional(),
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
      schedule_assignment_id: initialData?.schedule_assignment_id || "",
      prison_unit_id: initialData?.prison_unit_id || "",
      prison_unit_slot_id: initialData?.prison_unit_slot_id || "",
      serventia_id: initialData?.serventia_id || "",
      magistrate_id: initialData?.magistrate_id || "",
      prosecutor_id: initialData?.prosecutor_id || "",
      defender_id: initialData?.defender_id || "",
      judicial_assistant_id: initialData?.judicial_assistant_id || "",
      virtual_room_url: initialData?.virtual_room_url || "",
      observations: initialData?.observations || "",
    },
  });

  // Resetar o formulário quando initialData mudar
  React.useEffect(() => {
    if (initialData) {
      console.log("Populando formulário com dados:", initialData);
      form.reset({
        defendant_name: initialData.defendant_name || "",
        process_number: initialData.process_number || "",
        scheduled_date: initialData.scheduled_date || "",
        scheduled_time: initialData.scheduled_time || "",
        schedule_assignment_id: initialData.schedule_assignment_id || "",
        prison_unit_id: initialData.prison_unit_id || "",
        prison_unit_slot_id: initialData.prison_unit_slot_id || "",
        serventia_id: initialData.serventia_id || "",
        magistrate_id: initialData.magistrate_id || "",
        prosecutor_id: initialData.prosecutor_id || "",
        defender_id: initialData.defender_id || "",
        judicial_assistant_id: initialData.judicial_assistant_id || "",
        virtual_room_url: initialData.virtual_room_url || "",
        observations: initialData.observations || "",
      });
    } else {
      console.log("Resetando formulário para criação");
      form.reset({
        defendant_name: "",
        process_number: "",
        scheduled_date: "",
        scheduled_time: "",
        schedule_assignment_id: "",
        prison_unit_id: "",
        prison_unit_slot_id: "",
        serventia_id: "",
        magistrate_id: "",
        prosecutor_id: "",
        defender_id: "",
        judicial_assistant_id: "",
        virtual_room_url: "",
        observations: "",
      });
    }
  }, [initialData, form]);

  // Watch dos campos necessários para os componentes
  const selectedDate = form.watch("scheduled_date");
  const selectedPrisonUnitId = form.watch("prison_unit_id");

  const mutation = useMutation({
    mutationFn: async (data: AudienciaFormData) => {
      console.log("=== INÍCIO DO PROCESSO DE SALVAMENTO ===");
      console.log("Dados recebidos do formulário:", data);
      console.log("Modo edição:", isEditing);
      console.log("ID da audiência (se editando):", initialData?.id);
      
      // Validar dados obrigatórios
      if (!data.defendant_name?.trim()) {
        throw new Error("Nome do réu é obrigatório");
      }
      if (!data.process_number?.trim()) {
        throw new Error("Número do processo é obrigatório");
      }
      if (!data.scheduled_date) {
        throw new Error("Data é obrigatória");
      }
      if (!data.scheduled_time) {
        throw new Error("Horário é obrigatório");
      }
      if (!data.prison_unit_id) {
        throw new Error("Unidade prisional é obrigatória");
      }
      if (!data.prison_unit_slot_id) {
        throw new Error("Slot de horário é obrigatório");
      }

      // Verificar se já existe uma audiência no mesmo slot (apenas para criação)
      if (!isEditing) {
        console.log("Verificando conflitos de slot para slot ID:", data.prison_unit_slot_id);
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
          console.log("Conflito encontrado:", existingAudiences);
          throw new Error("Já existe uma audiência agendada para este horário e unidade prisional. Por favor, escolha outro horário.");
        }
        
        console.log("Nenhum conflito encontrado, prosseguindo...");
      }
      
      // Preparar os dados para inserção/atualização
      const audienceData = {
        defendant_name: data.defendant_name.trim(),
        process_number: data.process_number.trim(),
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        serventia_id: data.serventia_id || null,
        prison_unit_id: data.prison_unit_id,
        magistrate_id: data.magistrate_id || null,
        prosecutor_id: data.prosecutor_id || null,
        defender_id: data.defender_id || null,
        judicial_assistant_id: data.judicial_assistant_id || null,
        virtual_room_url: data.virtual_room_url?.trim() || null,
        observations: data.observations?.trim() || null,
      };
      
      console.log("Dados preparados para salvamento:", audienceData);
      
      let result;
      
      if (isEditing && initialData?.id) {
        console.log("=== EXECUTANDO ATUALIZAÇÃO ===");
        console.log("Atualizando audiência com ID:", initialData.id);
        
        const { data: updateResult, error } = await supabase
          .from("audiences")
          .update(audienceData)
          .eq("id", initialData.id)
          .select()
          .single();
        
        if (error) {
          console.error("Erro na atualização:", error);
          throw new Error(`Erro ao atualizar audiência: ${error.message}`);
        }
        
        console.log("Atualização bem-sucedida:", updateResult);
        result = updateResult;
      } else {
        console.log("=== EXECUTANDO CRIAÇÃO ===");
        console.log("Criando nova audiência");
        
        const { data: insertResult, error } = await supabase
          .from("audiences")
          .insert([audienceData])
          .select()
          .single();
        
        if (error) {
          console.error("Erro na inserção:", error);
          throw new Error(`Erro ao criar audiência: ${error.message}`);
        }
        
        console.log("Inserção bem-sucedida:", insertResult);
        result = insertResult;
        
        // Marcar o slot como ocupado apenas para criação
        console.log("Marcando slot como ocupado:", data.prison_unit_slot_id);
        const { error: slotError } = await supabase
          .from('prison_unit_slots')
          .update({ 
            is_available: false, 
            audience_id: result.id 
          })
          .eq('id', data.prison_unit_slot_id);
        
        if (slotError) {
          console.error("Erro ao marcar slot como ocupado:", slotError);
          // Não vamos falhar a criação da audiência por isso
          console.log("Continuando apesar do erro no slot...");
        } else {
          console.log("Slot marcado como ocupado com sucesso");
        }
      }
      
      console.log("=== PROCESSO CONCLUÍDO COM SUCESSO ===");
      return result;
    },
    onSuccess: () => {
      console.log("Mutation bem-sucedida, invalidando queries...");
      queryClient.invalidateQueries({ queryKey: ["audiences"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
      if (initialData?.id) {
        queryClient.invalidateQueries({ queryKey: ["audiencia", initialData.id] });
      }
      toast({
        title: "Sucesso",
        description: isEditing ? "Audiência atualizada com sucesso!" : "Audiência criada com sucesso!",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error("=== ERRO NA MUTATION ===");
      console.error("Erro completo:", error);
      console.error("Mensagem:", error.message);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar audiência",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AudienciaFormData) => {
    console.log("=== FORMULÁRIO SUBMETIDO ===");
    console.log("Dados do formulário:", data);
    console.log("Validação passou, iniciando mutation...");
    mutation.mutate(data);
  };

  const handleCancel = () => {
    console.log("Cancelando operação e fechando modal");
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.log("Erros de validação:", errors);
        toast({
          title: "Erro de validação",
          description: "Por favor, verifique os campos obrigatórios.",
          variant: "destructive",
        });
      })} className="space-y-6">
        <div className="space-y-6">
          {/* 1. Plantão e Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Plantão e Profissionais</h3>
            <ServentiaBasedAssignments 
              form={form} 
              selectedScheduleId="" 
              selectedDate={selectedDate}
              selectedPrisonUnitId={selectedPrisonUnitId}
              showPrisonUnitSelector={true}
              showSlotSelector={false}
            />
          </div>
          
          {/* 2. Data da Audiência */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Data da Audiência</h3>
            <div className="grid grid-cols-1 gap-4">
              <AudienciaDateTime form={form} />
            </div>
          </div>
          
          {/* 3. Slot Disponível */}
          {selectedPrisonUnitId && selectedDate && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Slot Disponível</h3>
              <PrisonUnitSlotSelector
                form={form}
                selectedDate={selectedDate}
                selectedPrisonUnitId={selectedPrisonUnitId}
              />
            </div>
          )}
          
          {/* 4. Informações do Processo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações do Processo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AudienciaBasicInfo form={form} />
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
