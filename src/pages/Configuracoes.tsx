
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/Configuracoes/UserManagement";
import RegionManagement from "@/components/Configuracoes/RegionManagement";
import ScheduleManagement from "@/components/Configuracoes/ScheduleManagement";

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState("magistrates");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">
          Gerencie magistrados, promotores, advogados, centrais de plantão e escalas semanais
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="magistrates">Magistrados</TabsTrigger>
          <TabsTrigger value="prosecutors">Promotores</TabsTrigger>
          <TabsTrigger value="defenders">Advogados</TabsTrigger>
          <TabsTrigger value="regions">Centrais</TabsTrigger>
          <TabsTrigger value="schedules">Escalas</TabsTrigger>
          <TabsTrigger value="assignments">Atribuições</TabsTrigger>
        </TabsList>

        <TabsContent value="magistrates">
          <UserManagement type="magistrates" title="Magistrados" />
        </TabsContent>

        <TabsContent value="prosecutors">
          <UserManagement type="prosecutors" title="Promotores" />
        </TabsContent>

        <TabsContent value="defenders">
          <UserManagement type="defenders" title="Advogados Dativos" />
        </TabsContent>

        <TabsContent value="regions">
          <RegionManagement />
        </TabsContent>

        <TabsContent value="schedules">
          <ScheduleManagement />
        </TabsContent>

        <TabsContent value="assignments">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">Atribuições de Plantão</h3>
            <p className="text-gray-600 mt-2">
              Funcionalidade em desenvolvimento - aqui você poderá atribuir profissionais às centrais de plantão
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
