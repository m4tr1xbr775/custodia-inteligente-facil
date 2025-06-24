
import { useEntityCrud } from "./useEntityCrud";

type TableName = "magistrates" | "prosecutors" | "defenders";

export const useUserMutations = (type: TableName, title: string) => {
  const config = {
    tableName: type,
    queryKey: [type],
    entityName: title.slice(0, -1), // Remove 's' do final
    entityNamePlural: title,
  };

  const { createMutation, updateMutation, deleteMutation } = useEntityCrud(config);

  // Customize create mutation para lidar com campos específicos de cada tipo
  const customCreateMutation = {
    ...createMutation,
    mutationFn: async (userData: any) => {
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

      return createMutation.mutationFn(cleanUserData);
    },
  };

  // Customize update mutation
  const customUpdateMutation = {
    ...updateMutation,
    mutationFn: async ({ id, userData }: { id: string; userData: any }) => {
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

      return updateMutation.mutationFn({ id, data: cleanUserData });
    },
  };

  return {
    createMutation: customCreateMutation,
    updateMutation: customUpdateMutation,
    deleteMutation,
  };
};
