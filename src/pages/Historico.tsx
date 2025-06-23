
import { useState } from "react";
import { History, Calendar, User, Activity, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatLocalDate, parseLocalDate } from "@/lib/dateUtils";

interface LogEntry {
  id: string;
  action: string;
  table_name: string;
  record_id: string;
  user_id: string;
  user_name: string;
  changes: any;
  timestamp: string;
  description: string;
}

const Historico = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("todos");
  const [tableFilter, setTableFilter] = useState("todos");
  const { userProfile } = useAuth();

  // Fetch logs from database
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['system-logs'],
    queryFn: async () => {
      // Como não temos uma tabela de logs ainda, vamos simular alguns dados
      // Em uma implementação real, você criaria uma tabela de logs no banco
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          action: 'CREATE',
          table_name: 'contacts',
          record_id: 'user123',
          user_id: 'admin1',
          user_name: 'Administrator',
          changes: { name: 'João Silva', profile: 'Juiz' },
          timestamp: new Date().toISOString(),
          description: 'Criou novo usuário: João Silva'
        },
        {
          id: '2',
          action: 'UPDATE',
          table_name: 'schedules',
          record_id: 'schedule456',
          user_id: 'admin1',
          user_name: 'Administrator',
          changes: { status: 'ativa', start_date: '2025-06-23' },
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          description: 'Atualizou escala para status ativo'
        },
        {
          id: '3',
          action: 'DELETE',
          table_name: 'audiences',
          record_id: 'aud789',
          user_id: 'admin1',
          user_name: 'Administrator',
          changes: {},
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          description: 'Removeu audiência agendada'
        }
      ];
      return mockLogs;
    },
    enabled: userProfile?.profile === 'Administrador',
  });

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return <Badge className="bg-green-100 text-green-800">Criação</Badge>;
      case "update":
        return <Badge className="bg-blue-100 text-blue-800">Atualização</Badge>;
      case "delete":
        return <Badge className="bg-red-100 text-red-800">Exclusão</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getTableBadge = (tableName: string) => {
    const tableLabels: Record<string, string> = {
      'contacts': 'Usuários',
      'schedules': 'Escalas',
      'audiences': 'Audiências',
      'magistrates': 'Magistrados',
      'prosecutors': 'Promotores',
      'defenders': 'Defensores'
    };
    
    return <Badge variant="outline">{tableLabels[tableName] || tableName}</Badge>;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "todos" || log.action.toLowerCase() === actionFilter;
    const matchesTable = tableFilter === "todos" || log.table_name === tableFilter;
    
    return matchesSearch && matchesAction && matchesTable;
  });

  if (!userProfile || userProfile.profile !== 'Administrador') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
          <p className="text-gray-600">Apenas administradores podem acessar o histórico do sistema.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando histórico...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Histórico do Sistema</h1>
          <p className="text-gray-600">Registro de todas as alterações realizadas no sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">{filteredLogs.length} registros</span>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por descrição ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Ações</SelectItem>
                <SelectItem value="create">Criação</SelectItem>
                <SelectItem value="update">Atualização</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Módulos</SelectItem>
                <SelectItem value="contacts">Usuários</SelectItem>
                <SelectItem value="schedules">Escalas</SelectItem>
                <SelectItem value="audiences">Audiências</SelectItem>
                <SelectItem value="magistrates">Magistrados</SelectItem>
                <SelectItem value="prosecutors">Promotores</SelectItem>
                <SelectItem value="defenders">Defensores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getActionBadge(log.action)}
                      {getTableBadge(log.table_name)}
                    </div>
                    <p className="font-medium text-gray-900">{log.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatLocalDate(parseLocalDate(log.timestamp.split('T')[0]))}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{log.user_name}</span>
                    </div>
                  </div>
                </div>
                
                {Object.keys(log.changes).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Alterações:</h4>
                    <div className="text-sm text-gray-600">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(log.changes, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou aguarde por novas atividades no sistema.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Historico;
