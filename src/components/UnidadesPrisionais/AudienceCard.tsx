import { Calendar, CheckCircle, XCircle, Clock, ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjudiIcon } from "@/components/ui/projudi-icon";
import { parseLocalDate } from "@/lib/dateUtils";

interface AudienceCardProps {
  audience: any;
  observationsChanges: Record<string, string>;
  onAcknowledgmentChange: (audienceId: string, status: string) => void;
  onObservationsChange: (audienceId: string, observations: string) => void;
  onSaveObservations: (audienceId: string) => void;
  hasObservationsChanged: (audienceId: string, currentObservations: string) => boolean;
  isUpdatingAcknowledgment: boolean;
  isUpdatingObservations: boolean;
}

const AudienceCard = ({
  audience,
  observationsChanges,
  onAcknowledgmentChange,
  onObservationsChange,
  onSaveObservations,
  hasObservationsChanged,
  isUpdatingAcknowledgment,
  isUpdatingObservations,
}: AudienceCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendada":
        return <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>;
      case "realizada":
        return <Badge className="bg-green-100 text-green-800">Realizada</Badge>;
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case "nao_compareceu":
        return <Badge className="bg-yellow-100 text-yellow-800">Não Compareceu</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAcknowledgmentBadge = (acknowledgment: string) => {
    switch (acknowledgment) {
      case "confirmado":
        return <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-semibold">✓ CONFIRMADO</Badge>;
      case "negado":
        return <Badge className="bg-red-500 text-white text-xs px-2 py-1 font-semibold">✗ NEGADO</Badge>;
      default:
        return <Badge className="bg-yellow-500 text-white text-xs px-2 py-1 font-semibold">⏳ PENDENTE</Badge>;
    }
  };

  // Função para formatar data de forma segura
  const formatAudienceDate = (dateString: string) => {
    console.log("AudienceCard - Formatando data da audiência:", dateString);
    const date = parseLocalDate(dateString);
    const formattedDate = date.toLocaleDateString('pt-BR');
    console.log("AudienceCard - Data formatada:", formattedDate);
    return formattedDate;
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              {/* Status de confirmação em posição destacada */}
              {getAcknowledgmentBadge(audience.unit_acknowledgment)}
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-lg">
                  {formatAudienceDate(audience.scheduled_date)} às {audience.scheduled_time}
                </span>
              </div>
              {getStatusBadge(audience.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-xl text-gray-900">{audience.defendant_name}</h3>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Processo:</span> {audience.process_number}
                  </p>
                  <ProjudiIcon 
                    processNumber={audience.process_number} 
                    size="sm" 
                    variant="ghost"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Central:</span> {audience.serventias?.name || 'Não informado'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Unidade:</span> {audience.prison_units_extended?.name || 'Não informado'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Magistrado:</span> {audience.magistrates?.name || 'Não definido'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Promotor:</span> {audience.prosecutors?.name || 'Não definido'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Defensor:</span> {audience.defenders?.name || 'Não definido'}
                  {audience.defenders?.type && (
                    <span className="text-xs text-gray-500 ml-1">({audience.defenders.type})</span>
                  )}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Assistente Judicial:</span> {audience.judicial_assistant?.name || audience.magistrates?.judicial_assistant?.name || 'Não definido'}
                </p>
              </div>
            </div>

            {(audience.virtual_room_url || audience.magistrates?.virtual_room_url) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(audience.virtual_room_url || audience.magistrates?.virtual_room_url, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Acessar Sala Virtual</span>
                </Button>
              </div>
            )}

            {/* Campo de observações com botão de atualização */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Observações:
              </label>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Adicione observações ou motivo da negação..."
                  value={observationsChanges[audience.id] !== undefined 
                    ? observationsChanges[audience.id] 
                    : (audience.observations || '')}
                  onChange={(e) => onObservationsChange(audience.id, e.target.value)}
                  className="flex-1 min-h-[80px] text-sm"
                  disabled={isUpdatingObservations}
                />
                {hasObservationsChanged(audience.id, audience.observations) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSaveObservations(audience.id)}
                    disabled={isUpdatingObservations}
                    className="flex items-center space-x-2 self-start"
                  >
                    <Save className="h-4 w-4" />
                    <span>Salvar</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:ml-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Status da Confirmação:</label>
                <Select
                  value={audience.unit_acknowledgment}
                  onValueChange={(value) => onAcknowledgmentChange(audience.id, value)}
                  disabled={isUpdatingAcknowledgment}
                >
                  <SelectTrigger className="w-[180px] mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span>Pendente</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="confirmado">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Confirmado</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="negado">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>Negado</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudienceCard;
