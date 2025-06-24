
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAssistantLink = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar magistrados ativos
  const { data: magistrates = [], isLoading: loadingMagistrates } = useQuery({
    queryKey: ['magistrates', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('magistrates')
        .select('id, name')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Mutation para atualizar vínculo
  const updateLinkMutation = useMutation({
    mutationFn: async ({ assistantId, magistrateId }: { assistantId: string; magistrateId: string | null }) => {
      const { error } = await supabase
        .from('contacts')
        .update({ linked_magistrate_id: magistrateId })
        .eq('id', assistantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Vínculo atualizado",
        description: "O vínculo com o magistrado foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar vínculo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    magistrates,
    loadingMagistrates,
    updateLinkMutation,
  };
};
