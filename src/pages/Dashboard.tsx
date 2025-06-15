
import { Calendar, Clock, Users, Building, CheckCircle, AlertCircle } from "lucide-react";
import StatsCard from "@/components/Dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const todayDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const recentAudiences = [
    {
      id: 1,
      time: "09:00",
      process: "0001234-56.2024.8.09.0000",
      defendant: "João Silva Santos",
      unit: "CDP Aparecida de Goiânia",
      status: "agendada"
    },
    {
      id: 2,
      time: "10:30",
      process: "0001235-56.2024.8.09.0000",
      defendant: "Maria Oliveira Costa",
      unit: "Presídio Feminino",
      status: "realizada"
    },
    {
      id: 3,
      time: "14:00",
      process: "0001236-56.2024.8.09.0000",
      defendant: "Carlos Eduardo Lima",
      unit: "CPP Goiânia",
      status: "cancelada"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendada":
        return <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>;
      case "realizada":
        return <Badge className="bg-green-100 text-green-800">Realizada</Badge>;
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 capitalize">{todayDate}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Audiências Hoje"
          value={12}
          icon={Calendar}
          description="3 pendentes, 9 realizadas"
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Plantões Ativos"
          value={8}
          icon={Clock}
          description="Magistrados e promotores"
        />
        <StatsCard
          title="Unidades Prisionais"
          value={24}
          icon={Building}
          description="Todas as regiões"
        />
        <StatsCard
          title="Operadores Ativos"
          value={156}
          icon={Users}
          description="Judiciário, MP e Defensoria"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audiências do Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Audiências de Hoje</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAudiences.map((audience) => (
                <div key={audience.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{audience.time}</span>
                      {getStatusBadge(audience.status)}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{audience.defendant}</p>
                    <p className="text-xs text-gray-500">{audience.process}</p>
                    <p className="text-xs text-gray-500">{audience.unit}</p>
                  </div>
                  <div className="flex items-center">
                    {audience.status === "realizada" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plantões Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Plantões Ativos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-green-800">Magistrado Plantonista</span>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
                <p className="text-sm font-medium">Dr. Carlos Eduardo Silva</p>
                <p className="text-xs text-green-600">Comarca de Goiânia</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-blue-800">Promotor Plantonista</span>
                  <Badge className="bg-blue-100 text-blue-800">Ativo</Badge>
                </div>
                <p className="text-sm font-medium">Dra. Ana Paula Oliveira</p>
                <p className="text-xs text-blue-600">1ª Promotoria Criminal</p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-purple-800">Defensor Plantonista</span>
                  <Badge className="bg-purple-100 text-purple-800">Ativo</Badge>
                </div>
                <p className="text-sm font-medium">Dr. Roberto Santos Lima</p>
                <p className="text-xs text-purple-600">Defensoria Pública</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            <span>Alertas e Notificações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  3 audiências pendentes de confirmação pela unidade prisional
                </p>
                <p className="text-xs text-yellow-600">CDP Aparecida, Presídio Feminino, CPP Goiânia</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Sistema atualizado com sucesso
                </p>
                <p className="text-xs text-blue-600">Última sincronização há 5 minutos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
