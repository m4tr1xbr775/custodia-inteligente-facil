
import { useAudiences } from "@/hooks/useAudiences";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Audiencias = () => {
  const { data: audiences, isLoading, error } = useAudiences();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Erro ao carregar audiências: {error.message}
        </div>
      </div>
    );
  }

  // Agrupar audiências por região
  const groupedAudiences = audiences?.reduce((acc, audience) => {
    const regionName = audience.regions.name;
    if (!acc[regionName]) {
      acc[regionName] = {
        region: audience.regions,
        audiences: []
      };
    }
    acc[regionName].audiences.push(audience);
    return acc;
  }, {} as Record<string, { region: any; audiences: any[] }>) || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendada":
        return "bg-blue-100 text-blue-800";
      case "realizada":
        return "bg-green-100 text-green-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      case "nao_compareceu":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "agendada":
        return "Agendada";
      case "realizada":
        return "Realizada";
      case "cancelada":
        return "Cancelada";
      case "nao_compareceu":
        return "Não Compareceu";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Audiências de Custódia</h1>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedAudiences).map(([regionName, { region, audiences }]) => (
          <Card key={regionName} className="w-full">
            <CardHeader className={`pb-4 ${
              region.type === 'macrorregiao' 
                ? 'bg-gradient-to-r from-blue-50 to-blue-100' 
                : 'bg-gradient-to-r from-green-50 to-green-100'
            }`}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className={`h-5 w-5 ${
                    region.type === 'macrorregiao' ? 'text-blue-600' : 'text-green-600'
                  }`} />
                  {regionName}
                  <Badge variant="outline" className={
                    region.type === 'macrorregiao' 
                      ? 'border-blue-300 text-blue-700' 
                      : 'border-green-300 text-green-700'
                  }>
                    {region.type === 'macrorregiao' ? 'Macrorregião' : 'Central de Custódia'}
                  </Badge>
                </CardTitle>
                <Badge variant="secondary">
                  {audiences.length} {audiences.length === 1 ? 'audiência' : 'audiências'}
                </Badge>
              </div>
              {region.responsible && (
                <p className="text-sm text-gray-600 mt-1">
                  Responsável: {region.responsible}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {audiences.map((audience) => (
                  <div
                    key={audience.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {audience.defendant_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Processo: {audience.process_number}
                        </p>
                      </div>
                      <Badge className={getStatusColor(audience.status)}>
                        {getStatusLabel(audience.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-500" />
                        <span>
                          {format(new Date(audience.scheduled_date), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{audience.scheduled_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{audience.prison_units.name}</span>
                      </div>
                      {audience.magistrates && (
                        <div className="text-gray-600">
                          Magistrado: {audience.magistrates.name}
                        </div>
                      )}
                    </div>

                    {audience.observations && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                        <strong>Observações:</strong> {audience.observations}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(groupedAudiences).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma audiência encontrada
            </h3>
            <p className="text-gray-600">
              Não há audiências agendadas no momento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Audiencias;
