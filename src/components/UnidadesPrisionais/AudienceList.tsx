
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AudienceCard from "./AudienceCard";

interface AudienceListProps {
  selectedUnit: string;
  observationsChanges: Record<string, string>;
  onAcknowledgmentChange: (audienceId: string, status: string) => void;
  onObservationsChange: (audienceId: string, observations: string) => void;
  onSaveObservations: (audienceId: string) => void;
  hasObservationsChanged: (audienceId: string, currentObservations: string) => boolean;
  isUpdatingAcknowledgment: boolean;
  isUpdatingObservations: boolean;
}

const AudienceList = ({
  selectedUnit,
  observationsChanges,
  onAcknowledgmentChange,
  onObservationsChange,
  onSaveObservations,
  hasObservationsChanged,
  isUpdatingAcknowledgment,
  isUpdatingObservations,
}: AudienceListProps) => {
  // Fetch audiences for selected unit with complete data joins
  const { data: audiences, isLoading } = useQuery({
    queryKey: ['unit_audiences', selectedUnit],
    queryFn: async () => {
      if (!selectedUnit) return [];
      
      console.log("Buscando audiências para unidade:", selectedUnit);
      
      // Buscar as audiências da unidade com todos os joins necessários
      const { data: audiences, error: audiencesError } = await supabase
        .from('audiences')
        .select(`
          *,
          serventias!inner (
            id,
            name,
            type,
            code
          ),
          prison_units_extended!inner (
            id,
            name,
            short_name
          ),
          magistrates (
            id,
            name,
            email,
            phone,
            virtual_room_url,
            judicial_assistant:judicial_assistant_id (
              id,
              name,
              email,
              phone
            )
          ),
          prosecutors (
            id,
            name,
            email,
            phone
          ),
          defenders (
            id,
            name,
            email,
            phone,
            type
          ),
          judicial_assistant:judicial_assistant_id (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('prison_unit_id', selectedUnit)
        .order('scheduled_date', { ascending: true });
      
      if (audiencesError) {
        console.error("Erro ao buscar audiências:", audiencesError);
        throw audiencesError;
      }
      
      console.log("Audiências com relações encontradas:", audiences);
      return audiences || [];
    },
    enabled: !!selectedUnit,
  });

  if (!selectedUnit) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Audiências Agendadas</span>
          {audiences && (
            <Badge variant="outline" className="ml-auto">
              {audiences.length} audiência{audiences.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="text-center py-8">
            <div className="text-lg">Carregando audiências...</div>
          </div>
        )}

        {audiences && audiences.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma audiência agendada</h3>
            <p className="text-gray-600">Não há audiências agendadas para esta unidade no momento.</p>
          </div>
        )}

        <div className="space-y-4">
          {audiences?.map((audience) => (
            <AudienceCard
              key={audience.id}
              audience={audience}
              observationsChanges={observationsChanges}
              onAcknowledgmentChange={onAcknowledgmentChange}
              onObservationsChange={onObservationsChange}
              onSaveObservations={onSaveObservations}
              hasObservationsChanged={hasObservationsChanged}
              isUpdatingAcknowledgment={isUpdatingAcknowledgment}
              isUpdatingObservations={isUpdatingObservations}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudienceList;
