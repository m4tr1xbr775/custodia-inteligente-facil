
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
  old_values: any;
  new_values: any;
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
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    enabled: userProfile?.profile === 'Administrador',
  });

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case "insert":
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
      'defenders': 'Defensores',
      'prison_units_extended': 'Unidades Prisionais',
      'serventias': 'Serventias'
    };
    
    return <Badge variant="outline">{tableLabels[tableName] || tableName}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getChangesDescription = (log: LogEntry) => {
    if (log.action === 'INSERT') {
      return log.description || `Criou novo registro na tabela ${log.table_name}`;
    } else if (log.action === 'UPDATE') {
      return log.description || `Atualizou registro na tabela ${log.table_name}`;
    } else if (log.action === 'DELETE') {
      return log.description || `Excluiu registro da tabela ${log.table_name}`;
    }
    return log.description || 'Alteração no sistema';
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
                  placeholder="Buscar por descrição, usuário ou tabela..."
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
                <SelectItem value="insert">Criação</SelectItem>
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
                    <p className="font-medium text-gray-900">{getChangesDescription(log)}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{log.user_name || 'Sistema'}</span>
                    </div>
                  </div>
                </div>
                
                {(log.old_values || log.new_values) && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Detalhes da Alteração:</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      {log.old_values && log.action === 'UPDATE' && (
                        <div>
                          <span className="font-medium">Valores Anteriores:</span>
                          <pre className="whitespace-pre-wrap mt-1 p-2 bg-red-50 rounded text-xs">
                            {JSON.stringify(log.old_values, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.new_values && (
                        <div>
                          <span className="font-medium">
                            {log.action === 'INSERT' ? 'Dados Criados:' : 'Novos Valores:'}
                          </span>
                          <pre className="whitespace-pre-wrap mt-1 p-2 bg-green-50 rounded text-xs">
                            {JSON.stringify(log.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
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
            <p className="text-gray-600">
              {logs.length === 0 
                ? "Ainda não há registros de alterações no sistema." 
                : "Tente ajustar os filtros para encontrar os registros desejados."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Historico;
