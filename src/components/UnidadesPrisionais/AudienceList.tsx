import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import AudienceCard from "./AudienceCard";
import { Loader2, Calendar } from "lucide-react";
import { addDays, subDays, startOfDay, endOfDay, isAfter, isBefore, isWithinInterval } from "date-fns";
import { parseLocalDate } from "@/lib/dateUtils";

interface AudienceListProps {
  selectedUnit: string;
  dateFilter: string;
  customStartDate?: Date;
  customEndDate?: Date;
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
  dateFilter,
  customStartDate,
  customEndDate,
  observationsChanges,
  onAcknowledgmentChange,
  onObservationsChange,
  onSaveObservations,
  hasObservationsChanged,
  isUpdatingAcknowledgment,
  isUpdatingObservations,
}: AudienceListProps) => {
  const getDateRange = () => {
    const today = new Date();
    
    switch (dateFilter) {
      case 'futuras':
        return { start: startOfDay(today), end: null };
      case 'ultimos-7':
        return { start: startOfDay(subDays(today, 7)), end: endOfDay(today) };
      case 'ultimos-30':
        return { start: startOfDay(subDays(today, 30)), end: endOfDay(today) };
      case 'personalizado':
        if (customStartDate && customEndDate) {
          return { 
            start: startOfDay(customStartDate), 
            end: endOfDay(customEndDate) 
          };
        }
        return { start: null, end: null };
      default:
        return { start: null, end: null };
    }
  };

  const { data: audiences = [], isLoading } = useQuery({
    queryKey: ['unit_audiences', selectedUnit, dateFilter, customStartDate, customEndDate],
    queryFn: async () => {
      if (!selectedUnit) return [];

      console.log("Buscando audiências para unidade:", selectedUnit);
      
      let query = supabase
        .from('audiences')
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
            phone
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
        .eq('prison_unit_id', selectedUnit)
        .order('scheduled_date', { ascending: true });

      const { data, error } = await query;
      
      if (error) {
        console.error("Erro ao buscar audiências:", error);
        throw error;
      }

      // Apply date filtering com parseLocalDate
      const { start, end } = getDateRange();
      let filteredData = data || [];
      
      if (start || end) {
        filteredData = filteredData.filter(audience => {
          // Usar parseLocalDate para evitar problemas de timezone
          const audienceDate = parseLocalDate(audience.scheduled_date);
          
          if (start && end) {
            return isWithinInterval(audienceDate, { start, end });
          } else if (start && !end) {
            return isAfter(audienceDate, start) || audienceDate.toDateString() === start.toDateString();
          } else if (!start && end) {
            return isBefore(audienceDate, end) || audienceDate.toDateString() === end.toDateString();
          }
          
          return true;
        });
      }

      console.log("Audiências encontradas:", filteredData);
      return filteredData;
    },
    enabled: !!selectedUnit,
  });

  if (!selectedUnit) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma unidade prisional</h3>
          <p className="text-gray-600">Escolha uma unidade para visualizar as audiências.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Carregando audiências...</span>
        </CardContent>
      </Card>
    );
  }

  if (audiences.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma audiência encontrada</h3>
          <p className="text-gray-600">
            Não há audiências agendadas para esta unidade no período selecionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Mostrando {audiences.length} audiência{audiences.length !== 1 ? 's' : ''} para o período selecionado
      </div>
      
      {audiences.map((audience) => (
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
  );
};

export default AudienceList;
