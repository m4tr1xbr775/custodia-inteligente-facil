
import { useEntityCrud } from "./useEntityCrud";
import { supabase } from "@/integrations/supabase/client";

type TableName = "magistrates" | "prosecutors" | "defenders";

export const useUserMutations = (type: TableName, title: string) => {
  const config = {
    tableName: type,
    queryKey: [type],
    entityName: title.slice(0, -1), // Remove 's' do final
    entityNamePlural: title,
  };

  const { createMutation, updateMutation, deleteMutation } = useEntityCrud(config);

  // Função para atualizar o vínculo na tabela contacts
  const updateAssistantLink = async (magistrateId: string, judicialAssistantId?: string) => {
    if (type !== "magistrates") return;

    try {
      if (judicialAssistantId) {
        // Atualizar o assessor específico com o vínculo
        const { error } = await supabase
          .from('contacts')
          .update({ linked_magistrate_id: magistrateId })
          .eq('id', judicialAssistantId);
        
        if (error) {
          console.error("Erro ao vincular assessor:", error);
          throw error;
        }
        
        console.log(`Assessor ${judicialAssistantId} vinculado ao magistrado ${magistrateId}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar vínculo assessor-magistrado:", error);
      throw error;
    }
  };

  // Customize create mutation para lidar com campos específicos de cada tipo
  const customCreateMutation = {
    ...createMutation,
    mutate: async (userData: any, options?: any) => {
      console.log(`Creating ${type} with data:`, userData);
      
      // Remove the type field for magistrates and prosecutors as they don't have this column
      const cleanUserData = { ...userData };
      if (type === "magistrates" || type === "prosecutors") {
        delete cleanUserData.type;
      }
      
      // For magistrates, handle judicial_assistant_id
      let judicialAssistantId: string | undefined;
      if (type === "magistrates") {
        judicialAssistantId = cleanUserData.judicial_assistant_id;
        if (cleanUserData.judicial_assistant_id === "" || cleanUserData.judicial_assistant_id === "none") {
          delete cleanUserData.judicial_assistant_id;
          judicialAssistantId = undefined;
        }
      } else {
        // Remove magistrate-specific fields for other types
        delete cleanUserData.judicial_assistant_id;
        delete cleanUserData.virtual_room_url;
      }

      console.log(`Cleaned data for ${type}:`, cleanUserData);
      
      // Executar a criação original
      return createMutation.mutate(cleanUserData, {
        ...options,
        onSuccess: async (data: any) => {
          console.log(`${type} created successfully:`, data);
          
          // Se for magistrado, atualizar vínculo com assessor
          if (type === "magistrates" && data.id && judicialAssistantId) {
            try {
              await updateAssistantLink(data.id, judicialAssistantId);
            } catch (error) {
              console.error("Erro ao vincular assessor após criação:", error);
              // Não falhar a operação principal por causa do vínculo
            }
          }
          
          // Chamar callback original se existir
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
      });
    },
  };

  // Customize update mutation
  const customUpdateMutation = {
    ...updateMutation,
    mutate: async ({ id, userData }: { id: string; userData: any }, options?: any) => {
      console.log(`Updating ${type} ${id} with data:`, userData);
      
      // Remove the type field for magistrates and prosecutors as they don't have this column
      const cleanUserData = { ...userData };
      if (type === "magistrates" || type === "prosecutors") {
        delete cleanUserData.type;
      }
      
      // For magistrates, handle judicial_assistant_id
      let judicialAssistantId: string | undefined;
      if (type === "magistrates") {
        judicialAssistantId = cleanUserData.judicial_assistant_id;
        if (cleanUserData.judicial_assistant_id === "" || cleanUserData.judicial_assistant_id === "none") {
          cleanUserData.judicial_assistant_id = null;
          judicialAssistantId = undefined;
        }
      } else {
        // Remove magistrate-specific fields for other types
        delete cleanUserData.judicial_assistant_id;
        delete cleanUserData.virtual_room_url;
      }

      console.log(`Cleaned data for ${type} update:`, cleanUserData);
      
      // Executar a atualização original
      return updateMutation.mutate({ id, data: cleanUserData }, {
        ...options,
        onSuccess: async (data: any) => {
          console.log(`${type} updated successfully:`, data);
          
          // Se for magistrado, atualizar vínculo com assessor
          if (type === "magistrates" && judicialAssistantId) {
            try {
              await updateAssistantLink(id, judicialAssistantId);
            } catch (error) {
              console.error("Erro ao vincular assessor após atualização:", error);
              // Não falhar a operação principal por causa do vínculo
            }
          }
          
          // Chamar callback original se existir
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
      });
    },
  };

  return {
    createMutation: customCreateMutation,
    updateMutation: customUpdateMutation,
    deleteMutation,
  };
};
