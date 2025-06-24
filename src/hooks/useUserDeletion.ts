
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserDeletion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async (contactId: string) => {
      console.log('Iniciando exclusão do usuário:', contactId);
      
      // Chamar a edge function para deletar o usuário
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { contactId }
      });

      if (error) {
        console.error('Erro na edge function:', error);
        throw new Error(error.message || 'Erro ao excluir usuário');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao excluir usuário');
      }

      console.log('Usuário excluído com sucesso:', data.message);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Usuário excluído",
        description: data.message,
      });
    },
    onError: (error: any) => {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  return { deleteUserMutation };
};
