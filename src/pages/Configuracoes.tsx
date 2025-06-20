
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/Configuracoes/UserManagement";
import ServentiaManagement from "@/components/Configuracoes/ServentiaManagement";
import ScheduleManagement from "@/components/Configuracoes/ScheduleManagement";
import AssignmentManagement from "@/components/Configuracoes/AssignmentManagement";
import EscalaAutoUpdater from "@/components/Configuracoes/EscalaAutoUpdater";

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState("magistrates");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">
          Gerencie magistrados, promotores, defensores públicos/advogados, serventias de plantão e escalas semanais
        </p>
      </div>

      {/* Componente de Atualização Automática de Escalas */}
      <div className="mb-6">
        <EscalaAutoUpdater />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="magistrates">Magistrados</TabsTrigger>
          <TabsTrigger value="prosecutors">Promotores</TabsTrigger>
          <TabsTrigger value="defenders">Defensores Públicos/Advogados</TabsTrigger>
          <TabsTrigger value="serventias">Serventias</TabsTrigger>
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
          <UserManagement type="defenders" title="Defensores Públicos/Advogados" />
        </TabsContent>

        <TabsContent value="serventias">
          <ServentiaManagement />
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
