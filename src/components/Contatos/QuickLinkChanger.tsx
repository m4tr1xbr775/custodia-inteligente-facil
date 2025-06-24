
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserCheck, Link } from "lucide-react";
import { useAssistantLink } from "@/hooks/useAssistantLink";
import MagistrateSelector from "./MagistrateSelector";

interface QuickLinkChangerProps {
  assistantId: string;
  currentMagistrateId: string | null;
  currentMagistrateName?: string;
}

const QuickLinkChanger = ({ 
  assistantId, 
  currentMagistrateId, 
  currentMagistrateName 
}: QuickLinkChangerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMagistrateId, setSelectedMagistrateId] = useState(currentMagistrateId || "");
  
  const { magistrates, loadingMagistrates, updateLinkMutation } = useAssistantLink();

  const handleSave = () => {
    updateLinkMutation.mutate({
      assistantId,
      magistrateId: selectedMagistrateId || null
    }, {
      onSuccess: () => {
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Link className="h-4 w-4" />
          Alterar Vínculo
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Vínculo de Plantão</DialogTitle>
          <DialogDescription>
            {currentMagistrateName ? (
              <>Atualmente vinculado a: <strong>{currentMagistrateName}</strong></>
            ) : (
              "Selecione um magistrado para vincular"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loadingMagistrates ? (
            <div className="text-center py-4">Carregando magistrados...</div>
          ) : (
            <MagistrateSelector
              magistrates={magistrates}
              value={selectedMagistrateId}
              onValueChange={setSelectedMagistrateId}
              placeholder="Selecione um novo magistrado"
            />
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateLinkMutation.isPending || loadingMagistrates}
          >
            {updateLinkMutation.isPending ? "Salvando..." : "Salvar Alteração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickLinkChanger;
