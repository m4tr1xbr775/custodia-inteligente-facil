
import React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjudiIconProps {
  processNumber: string;
  size?: "sm" | "lg" | "default" | "icon";
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

export const formatProcessNumber = (processNumber: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = processNumber.replace(/\D/g, '');
  
  // Se não tem pelo menos 13 dígitos, retorna como está
  if (cleaned.length < 13) return processNumber;
  
  // Formatar para NNNNNNN-DD.AAAA.J.TR.OOOO
  const formatted = cleaned.replace(
    /(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})/,
    '$1-$2.$3.$4.$5.$6'
  );
  
  return formatted;
};

export const ProjudiIcon: React.FC<ProjudiIconProps> = ({
  processNumber,
  size = "sm",
  variant = "ghost",
  className = ""
}) => {
  const handleClick = () => {
    if (!processNumber || processNumber.trim() === '') {
      return;
    }
    
    // Remove formatação e espaços para a URL
    const cleanNumber = processNumber.replace(/\D/g, '');
    const formattedNumber = formatProcessNumber(cleanNumber);
    
    const url = `https://projudi.tjgo.jus.br/BuscaProcesso?PaginaAtual=2&ProcessoNumero=${formattedNumber}`;
    window.open(url, '_blank');
  };

  if (!processNumber || processNumber.trim() === '') {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleClick}
            className={`flex items-center space-x-1 ${className}`}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-xs">Projudi</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Abrir processo no Projudi TJGO</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
