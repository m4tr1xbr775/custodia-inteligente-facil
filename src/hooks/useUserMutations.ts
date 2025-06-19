
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type TableName = "magistrates" | "prosecutors" | "defenders";

export const useUserMutations = (type: TableName, title: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (userData: any) => {
      console.log(`Creating new ${type}:`, userData);
      
      // Remove the type field for magistrates and prosecutors as they don't have this column
      const cleanUserData = { ...userData };
      if (type === "magistrates" || type === "prosecutors") {
        delete cleanUserData.type;
      }
      
      // For magistrates, handle judicial_assistant_id
      if (type === "magistrates") {
        if (cleanUserData.judicial_assistant_id === "") {
          delete cleanUserData.judicial_assistant_id;
        }
      } else {
        // Remove magistrate-specific fields for other types
        delete cleanUserData.judicial_assistant_id;
        delete cleanUserData.virtual_room_url;
      }
      
      // Remove empty strings to avoid inserting empty values
      Object.keys(cleanUserData).forEach(key => {
        if (cleanUserData[key] === "") {
          delete cleanUserData[key];
        }
      });
      
      const { data, error } = await supabase
        .from(type)
        .insert([cleanUserData])
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating ${type}:`, error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] });
      toast({
        title: "Sucesso",
        description: `${title.slice(0, -1)} criado com sucesso!`,
      });
    },
    onError: (error: any) => {
      console.error(`Error creating ${type}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao criar ${title.slice(0, -1).toLowerCase()}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: any }) => {
      console.log(`Updating ${type} with id:`, id, userData);
      
      // Remove the type field for magistrates and prosecutors as they don't have this column
      const cleanUserData = { ...userData };
      if (type === "magistrates" || type === "prosecutors") {
        delete cleanUserData.type;
      }
      
      // For magistrates, handle judicial_assistant_id
      if (type === "magistrates") {
        if (cleanUserData.judicial_assistant_id === "") {
          cleanUserData.judicial_assistant_id = null;
        }
      } else {
        // Remove magistrate-specific fields for other types
        delete cleanUserData.judicial_assistant_id;
        delete cleanUserData.virtual_room_url;
      }
      
      // Remove empty strings to avoid inserting empty values
      Object.keys(cleanUserData).forEach(key => {
        if (cleanUserData[key] === "") {
          delete cleanUserData[key];
        }
      });
      
      const { data, error } = await supabase
        .from(type)
        .update(cleanUserData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating ${type}:`, error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] });
      toast({
        title: "Sucesso",
        description: `${title.slice(0, -1)} atualizado com sucesso!`,
      });
    },
    onError: (error: any) => {
      console.error(`Error updating ${type}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar ${title.slice(0, -1).toLowerCase()}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`Deleting ${type} with id:`, id);
      const { error } = await supabase
        .from(type)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting ${type}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] });
      toast({
        title: "Sucesso",
        description: `${title.slice(0, -1)} removido com sucesso!`,
      });
    },
    onError: (error: any) => {
      console.error(`Error deleting ${type}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao remover ${title.slice(0, -1).toLowerCase()}: ${error.message}`,
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
