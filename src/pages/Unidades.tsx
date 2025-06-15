
import { usePrisonUnits } from "@/hooks/usePrisonUnits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Phone, Users } from "lucide-react";

const Unidades = () => {
  const { data: prisonUnits, isLoading, error } = usePrisonUnits();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Erro ao carregar unidades: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Building className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Unidades Prisionais</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prisonUnits?.map((unit) => (
          <Card key={unit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-start justify-between">
                <span>{unit.name}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    unit.regions.type === 'macrorregiao' 
                      ? 'border-blue-300 text-blue-700' 
                      : 'border-green-300 text-green-700'
                  }`}
                >
                  {unit.regions.type === 'macrorregiao' ? 'Macrorregião' : 'Central de Custódia'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">{unit.regions.name}</span>
              </div>
              
              {unit.address && (
                <div className="flex items-start gap-2 text-sm">
                  <Building className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{unit.address}</span>
                </div>
              )}
              
              {unit.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <a 
                    href={`tel:${unit.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {unit.phone}
                  </a>
                </div>
              )}
              
              {unit.capacity && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    Capacidade: {unit.capacity.toLocaleString()} pessoas
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {prisonUnits?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma unidade encontrada
            </h3>
            <p className="text-gray-600">
              Não há unidades prisionais cadastradas no momento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Unidades;
