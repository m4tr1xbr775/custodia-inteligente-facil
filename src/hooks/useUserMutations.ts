
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
    mutate: (userData: any, options?: any) => {
      console.log(`Creating ${type} with data:`, userData);
      
      // Remove the type field for magistrates and prosecutors as they don't have this column
      const cleanUserData = { ...userData };
      if (type === "magistrates" || type === "prosecutors") {
        delete cleanUserData.type;
      }
      
      // For magistrates, handle judicial_assistant_id
      if (type === "magistrates") {
        if (cleanUserData.judicial_assistant_id === "" || cleanUserData.judicial_assistant_id === "none") {
          delete cleanUserData.judicial_assistant_id;
        }
      } else {
        // Remove magistrate-specific fields for other types
        delete cleanUserData.judicial_assistant_id;
        delete cleanUserData.virtual_room_url;
      }

      console.log(`Cleaned data for ${type}:`, cleanUserData);
      return createMutation.mutate(cleanUserData, options);
    },
  };

  // Customize update mutation
  const customUpdateMutation = {
    ...updateMutation,
    mutate: ({ id, userData }: { id: string; userData: any }, options?: any) => {
      console.log(`Updating ${type} ${id} with data:`, userData);
      
      // Remove the type field for magistrates and prosecutors as they don't have this column
      const cleanUserData = { ...userData };
      if (type === "magistrates" || type === "prosecutors") {
        delete cleanUserData.type;
      }
      
      // For magistrates, handle judicial_assistant_id
      if (type === "magistrates") {
        if (cleanUserData.judicial_assistant_id === "" || cleanUserData.judicial_assistant_id === "none") {
          cleanUserData.judicial_assistant_id = null;
        }
      } else {
        // Remove magistrate-specific fields for other types
        delete cleanUserData.judicial_assistant_id;
        delete cleanUserData.virtual_room_url;
      }

      console.log(`Cleaned data for ${type} update:`, cleanUserData);
      return updateMutation.mutate({ id, data: cleanUserData }, options);
    },
  };

  return {
    createMutation: customCreateMutation,
    updateMutation: customUpdateMutation,
    deleteMutation,
  };
};
