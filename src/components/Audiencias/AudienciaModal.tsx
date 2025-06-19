
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AudienciaForm from "./AudienciaForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AudienciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  audienciaId?: string;
}

const AudienciaModal = ({ isOpen, onClose, audienciaId }: AudienciaModalProps) => {
  console.log("AudienciaModal renderizado com:", { isOpen, audienciaId });

  const { data: audienciaData, isLoading, error } = useQuery({
    queryKey: ["audiencia", audienciaId],
    queryFn: async () => {
      if (!audienciaId) {
        console.log("Nenhum ID de audiência fornecido, retornando null");
        return null;
      }
      
      console.log("Buscando dados da audiência com ID:", audienciaId);
      
      const { data, error } = await supabase
        .from("audiences")
        .select(`
          *,
          prison_units_extended (
            id,
            name,
            short_name
          ),
          serventias (
            id,
            name,
            type
          ),
          magistrates (
            id,
            name,
            phone,
            judicial_assistant_id
          ),
          prosecutors (
            id,
            name,
            phone
          ),
          defenders (
            id,
            name,
            phone,
            type
          )
        `)
        .eq("id", audienciaId)
        .single();
      
      if (error) {
        console.error("Erro ao buscar audiência:", error);
        throw error;
      }
      
      console.log("Dados da audiência carregados:", data);
      return data;
    },
    enabled: !!audienciaId && isOpen,
  });

  const handleSuccess = () => {
    console.log("Formulário submetido com sucesso, fechando modal");
    onClose();
  };

  if (isLoading && audienciaId) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-lg">Carregando dados da audiência...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-lg text-red-600">Erro ao carregar dados da audiência</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {audienciaId ? "Editar Audiência" : "Nova Audiência"}
          </DialogTitle>
        </DialogHeader>
        <AudienciaForm
          onSuccess={handleSuccess}
          initialData={audienciaData}
          isEditing={!!audienciaId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AudienciaModal;
