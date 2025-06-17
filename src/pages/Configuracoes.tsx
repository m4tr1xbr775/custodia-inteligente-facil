
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/Configuracoes/UserManagement";
import RegionManagement from "@/components/Configuracoes/RegionManagement";
import ScheduleManagement from "@/components/Configuracoes/ScheduleManagement";
import AssignmentManagement from "@/components/Configuracoes/AssignmentManagement";

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
          <AssignmentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
