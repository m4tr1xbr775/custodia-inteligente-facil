
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MagistrateAssistantAlertProps {
  magistrateName: string;
  magistrateId: string;
  onClose: () => void;
}

const MagistrateAssistantAlert = ({ magistrateName, magistrateId, onClose }: MagistrateAssistantAlertProps) => {
  const navigate = useNavigate();

  const handleEditMagistrate = () => {
    // Salvar informações no localStorage para retornar depois
    localStorage.setItem('returnToSchedules', 'true');
    localStorage.setItem('selectedMagistrateId', magistrateId);
    
    // Navegar para configurações com aba de magistrados
    navigate('/configuracoes?tab=magistrates&edit=' + magistrateId);
  };

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-orange-800 font-medium">
            Este magistrado ainda não possui um assessor vinculado.
          </p>
          <p className="text-orange-700 text-sm mt-1">
            Magistrado: <strong>{magistrateName}</strong>
          </p>
          <p className="text-orange-600 text-sm">
            Faça a atribuição antes de continuar.
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleEditMagistrate}>
            <User className="h-4 w-4 mr-1" />
            Editar Magistrado
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default MagistrateAssistantAlert;
