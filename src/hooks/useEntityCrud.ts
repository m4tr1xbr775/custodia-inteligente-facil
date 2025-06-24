
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EntityCrudConfig {
  tableName: string;
  queryKey: string[];
  entityName: string;
  entityNamePlural: string;
}

export const useEntityCrud = (config: EntityCrudConfig) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tableName, queryKey, entityName, entityNamePlural } = config;

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log(`Creating new ${entityName}:`, data);
      
      // Remove empty strings to avoid inserting empty values
      const cleanData = { ...data };
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === "") {
          delete cleanData[key];
        }
      });
      
      const { data: result, error } = await supabase
        .from(tableName as any)
        .insert([cleanData])
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating ${entityName}:`, error);
        throw error;
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Sucesso",
        description: `${entityName} criado com sucesso!`,
      });
    },
    onError: (error: any) => {
      console.error(`Error creating ${entityName}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao criar ${entityName.toLowerCase()}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log(`Updating ${entityName} with id:`, id, data);
      
      // Remove empty strings to avoid inserting empty values
      const cleanData = { ...data };
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === "") {
          delete cleanData[key];
        }
      });
      
      const { data: result, error } = await supabase
        .from(tableName as any)
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating ${entityName}:`, error);
        throw error;
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Sucesso",
        description: `${entityName} atualizado com sucesso!`,
      });
    },
    onError: (error: any) => {
      console.error(`Error updating ${entityName}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar ${entityName.toLowerCase()}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`Deleting ${entityName} with id:`, id);
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting ${entityName}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Sucesso",
        description: `${entityName} removido com sucesso!`,
      });
    },
    onError: (error: any) => {
      console.error(`Error deleting ${entityName}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao remover ${entityName.toLowerCase()}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
