
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Magistrate {
  id: string;
  name: string;
  judicial_assistant_id?: string;
}

export const useMagistrateAssistantValidation = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [selectedMagistrate, setSelectedMagistrate] = useState<Magistrate | null>(null);
  const { toast } = useToast();

  // Buscar dados dos magistrados
  const { data: magistrates = [] } = useQuery({
    queryKey: ['magistrates-with-assistants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('magistrates')
        .select('id, name, judicial_assistant_id')
        .eq('active', true);
      
      if (error) throw error;
      return data as Magistrate[];
    },
  });

  const validateMagistrateAssistant = async (magistrateId: string): Promise<{ 
    isValid: boolean; 
    judicialAssistantId?: string; 
    magistrate?: Magistrate 
  }> => {
    if (!magistrateId) {
      return { isValid: true }; // Se não há magistrado selecionado, não há problema
    }

    const magistrate = magistrates.find(m => m.id === magistrateId);
    
    if (!magistrate) {
      toast({
        title: "Erro",
        description: "Magistrado não encontrado",
        variant: "destructive",
      });
      return { isValid: false };
    }

    if (!magistrate.judicial_assistant_id) {
      setSelectedMagistrate(magistrate);
      setShowAlert(true);
      return { isValid: false, magistrate };
    }

    return { 
      isValid: true, 
      judicialAssistantId: magistrate.judicial_assistant_id,
      magistrate 
    };
  };

  const closeAlert = () => {
    setShowAlert(false);
    setSelectedMagistrate(null);
  };

  return {
    validateMagistrateAssistant,
    showAlert,
    selectedMagistrate,
    closeAlert,
  };
};
