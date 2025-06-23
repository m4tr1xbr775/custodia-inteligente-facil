
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PautaInitializer from "@/components/Audiencias/PautaInitializer";
import { Settings, Clock, Database } from "lucide-react";

const ConfiguracoesSlots = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Configurações de Pautas</h1>
        </div>
        <p className="text-gray-600">
          Gerencie a análise de capacidade do sistema de agendamento dinâmico
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <PautaInitializer />
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
            <CardDescription>
              Como funciona o novo sistema de agendamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Cálculo em Tempo Real</h4>
                  <p className="text-sm text-gray-600">
                    Horários são calculados dinamicamente baseado na capacidade das salas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Múltiplas Salas</h4>
                  <p className="text-sm text-gray-600">
                    Cada unidade pode ter múltiplas salas para audiências simultâneas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Intervalos de 15 Minutos</h4>
                  <p className="text-sm text-gray-600">
                    Horários disponíveis de 09:00 às 17:45 em intervalos de 15 minutos
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Validação Automática</h4>
                  <p className="text-sm text-gray-600">
                    Sistema previne duplo agendamento na mesma sala e horário
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Sistema</h3>
              <p className="text-2xl font-bold text-blue-600">Dinâmico</p>
              <p className="text-sm text-blue-600">Cálculo em tempo real</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800">Intervalos</h3>
              <p className="text-2xl font-bold text-green-600">15min</p>
              <p className="text-sm text-green-600">Das 09:00 às 17:45</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800">Capacidade</h3>
              <p className="text-2xl font-bold text-orange-600">Multi-sala</p>
              <p className="text-sm text-orange-600">Por unidade prisional</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracoesSlots;
