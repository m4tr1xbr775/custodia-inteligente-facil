
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Users, 
  Calendar,
  Building,
  Shield,
  UserPlus,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import ConfigForm from "@/components/Configuracoes/ConfigForm";
import UserManagement from "@/components/Configuracoes/UserManagement";
import RegionManagement from "@/components/Configuracoes/RegionManagement";

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState("magistrates");

  const tabs = [
    { id: "magistrates", label: "Juízes Plantonistas", icon: Shield },
    { id: "prosecutors", label: "Promotores", icon: Users },
    { id: "defenders", label: "Advogados Dativos", icon: UserPlus },
    { id: "regions", label: "Regiões", icon: Building },
    { id: "schedules", label: "Agendas", icon: Calendar },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "magistrates":
        return <UserManagement type="magistrates" title="Juízes Plantonistas" />;
      case "prosecutors":
        return <UserManagement type="prosecutors" title="Promotores" />;
      case "defenders":
        return <UserManagement type="defenders" title="Advogados Dativos" />;
      case "regions":
        return <RegionManagement />;
      case "schedules":
        return <ConfigForm type="schedules" />;
      default:
        return <UserManagement type="magistrates" title="Juízes Plantonistas" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Gerencie usuários, regiões e agendas do sistema</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800">Administrador</Badge>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Configuracoes;
