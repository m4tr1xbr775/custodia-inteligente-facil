
import { useEntityCrud } from "./useEntityCrud";

export const useUnidadesCrud = () => {
  const config = {
    tableName: "prison_units_extended",
    queryKey: ["prison_units_extended"],
    entityName: "Unidade",
    entityNamePlural: "Unidades",
  };

  const { createMutation, updateMutation, deleteMutation } = useEntityCrud(config);

  // Customize mutations para lidar com campos específicos das unidades
  const customCreateMutation = {
    ...createMutation,
    mutationFn: async (data: any) => {
      // Limpar dados vazios opcionais
      const cleanData = { ...data };
      if (!cleanData.address || cleanData.address.trim() === '') {
        cleanData.address = '';
      }
      if (!cleanData.municipalities || cleanData.municipalities.trim() === '') {
        cleanData.municipalities = '';
      }

      // Converter array de municípios para string se necessário
      if (Array.isArray(cleanData.municipalities)) {
        cleanData.municipalities = cleanData.municipalities.join(', ');
      }

      return createMutation.mutationFn(cleanData);
    },
  };

  const customUpdateMutation = {
    ...updateMutation,
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Limpar dados vazios opcionais
      const cleanData = { ...data };
      if (!cleanData.address || cleanData.address.trim() === '') {
        cleanData.address = '';
      }
      if (!cleanData.municipalities || cleanData.municipalities.trim() === '') {
        cleanData.municipalities = '';
      }

      // Converter array de municípios para string se necessário
      if (Array.isArray(cleanData.municipalities)) {
        cleanData.municipalities = cleanData.municipalities.join(', ');
      }

      return updateMutation.mutationFn({ id, data: cleanData });
    },
  };

  return {
    createMutation: customCreateMutation,
    updateMutation: customUpdateMutation,
    deleteMutation,
  };
};
