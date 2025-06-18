
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
  const { data: audienciaData } = useQuery({
    queryKey: ["audiencia", audienciaId],
    queryFn: async () => {
      if (!audienciaId) return null;
      
      const { data, error } = await supabase
        .from("audiences")
        .select("*")
        .eq("id", audienciaId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!audienciaId,
  });

  const handleSuccess = () => {
    onClose();
  };

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
