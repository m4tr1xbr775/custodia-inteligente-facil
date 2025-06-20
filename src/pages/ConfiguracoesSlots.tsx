
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
          Gerencie a criação e configuração das pautas de horários para audiências
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
              Informações das Pautas
            </CardTitle>
            <CardDescription>
              Como funciona o sistema de pautas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Horário Configurável</h4>
                  <p className="text-sm text-gray-600">
                    Defina o horário de início e fim para geração das pautas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Intervalos Flexíveis</h4>
                  <p className="text-sm text-gray-600">
                    Escolha intervalos de 15 ou 30 minutos entre as pautas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Disponibilidade Automática</h4>
                  <p className="text-sm text-gray-600">
                    Pautas são marcadas como indisponíveis quando uma audiência é agendada
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Liberação Automática</h4>
                  <p className="text-sm text-gray-600">
                    Pautas são liberadas automaticamente quando audiências são canceladas
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
              <h3 className="font-semibold text-blue-800">Pautas Configuráveis</h3>
              <p className="text-2xl font-bold text-blue-600">Flex</p>
              <p className="text-sm text-blue-600">Por unidade prisional</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800">Duração das Pautas</h3>
              <p className="text-2xl font-bold text-green-600">15-30min</p>
              <p className="text-sm text-green-600">Intervalo configurável</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800">Período Recomendado</h3>
              <p className="text-2xl font-bold text-orange-600">90</p>
              <p className="text-sm text-orange-600">Dias à frente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracoesSlots;
