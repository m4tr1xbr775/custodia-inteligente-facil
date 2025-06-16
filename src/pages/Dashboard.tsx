
import { useAudiences } from "@/hooks/useAudiences";
import { useRegions } from "@/hooks/useRegions";
import { usePrisonUnits } from "@/hooks/usePrisonUnits";
import { useContacts } from "@/hooks/useContacts";
import StatsCard from "@/components/Dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Building, Users, Phone, MapPin } from "lucide-react";

const Dashboard = () => {
  const { data: audiences, isLoading: audiencesLoading } = useAudiences();
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: prisonUnits, isLoading: unitsLoading } = usePrisonUnits();
  const { data: contacts, isLoading: contactsLoading } = useContacts();

  const isLoading = audiencesLoading || regionsLoading || unitsLoading || contactsLoading;

  // Calcular estatísticas
  const totalAudiences = audiences?.length || 0;
  const scheduledAudiences = audiences?.filter(a => a.status === 'agendada').length || 0;
  const completedAudiences = audiences?.filter(a => a.status === 'realizada').length || 0;
  const totalRegions = regions?.length || 0;
  const totalPrisonUnits = prisonUnits?.length || 0;
  const totalContacts = contacts?.length || 0;

  // Audiências de hoje
  const today = new Date().toISOString().split('T')[0];
  const todaysAudiences = audiences?.filter(a => a.scheduled_date === today) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total de Audiências"
          value={totalAudiences}
          icon={<CalendarDays className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title="Audiências Agendadas"
          value={scheduledAudiences}
          icon={<CalendarDays className="h-6 w-6" />}
          color="yellow"
        />
        <StatsCard
          title="Audiências Realizadas"
          value={completedAudiences}
          icon={<CalendarDays className="h-6 w-6" />}
          color="green"
        />
        <StatsCard
          title="Regiões"
          value={totalRegions}
          icon={<MapPin className="h-6 w-6" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Unidades Prisionais"
          value={totalPrisonUnits}
          icon={<Building className="h-6 w-6" />}
          color="indigo"
        />
        <StatsCard
          title="Contatos"
          value={totalContacts}
          icon={<Phone className="h-6 w-6" />}
          color="pink"
        />
        <StatsCard
          title="Audiências Hoje"
          value={todaysAudiences.length}
          icon={<CalendarDays className="h-6 w-6" />}
          color="orange"
        />
      </div>

      {/* Audiências de Hoje */}
      {todaysAudiences.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Audiências de Hoje ({todaysAudiences.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysAudiences.map((audience) => (
                <div
                  key={audience.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{audience.defendant_name}</h4>
                    <p className="text-sm text-gray-600">
                      {audience.scheduled_time} - {audience.prison_units.name}
                    </p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      audience.status === 'agendada' 
                        ? 'border-blue-300 text-blue-700' 
                        : audience.status === 'realizada'
                        ? 'border-green-300 text-green-700'
                        : 'border-red-300 text-red-700'
                    }
                  >
                    {audience.status === 'agendada' ? 'Agendada' : 
                     audience.status === 'realizada' ? 'Realizada' : 'Cancelada'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo por Regiões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Resumo por Regiões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {regions?.map((region) => {
              const regionAudiences = audiences?.filter(a => a.region_id === region.id) || [];
              const regionUnits = prisonUnits?.filter(u => u.region_id === region.id) || [];
              
              return (
                <div
                  key={region.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {region.name}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          region.type === 'macrorregiao' 
                            ? 'border-blue-300 text-blue-700' 
                            : 'border-green-300 text-green-700'
                        }`}
                      >
                        {region.type === 'macrorregiao' ? 'Macrorregião' : 'Central de Custódia'}
                      </Badge>
                    </h4>
                    <p className="text-sm text-gray-600">
                      {regionUnits.length} {regionUnits.length === 1 ? 'unidade' : 'unidades'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">
                      {regionAudiences.length} {regionAudiences.length === 1 ? 'audiência' : 'audiências'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {regionAudiences.filter(a => a.status === 'agendada').length} agendadas
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
