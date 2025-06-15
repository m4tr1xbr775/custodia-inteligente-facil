
import { useState } from "react";
import { Calendar, Plus, Search, Filter, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Audiencias = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const audiences = [
    {
      id: 1,
      date: "2024-06-15",
      time: "09:00",
      process: "0001234-56.2024.8.09.0000",
      defendant: "João Silva Santos",
      unit: "CDP Aparecida de Goiânia",
      magistrate: "Dr. Carlos Eduardo Silva",
      prosecutor: "Dra. Ana Paula Oliveira",
      defender: "Dr. Roberto Santos Lima",
      policeResponsible: "Inspetor José Maria",
      status: "agendada",
      virtualRoom: "https://zoom.us/j/123456789",
      confirmed: false
    },
    {
      id: 2,
      date: "2024-06-15",
      time: "10:30",
      process: "0001235-56.2024.8.09.0000",
      defendant: "Maria Oliveira Costa",
      unit: "Presídio Feminino",
      magistrate: "Dr. Carlos Eduardo Silva",
      prosecutor: "Dra. Ana Paula Oliveira",
      defender: "Dra. Fernanda Luz",
      policeResponsible: "Inspetora Maria José",
      status: "realizada",
      virtualRoom: "https://zoom.us/j/987654321",
      confirmed: true
    },
    {
      id: 3,
      date: "2024-06-15",
      time: "14:00",
      process: "0001236-56.2024.8.09.0000",
      defendant: "Carlos Eduardo Lima",
      unit: "CPP Goiânia",
      magistrate: "Dr. Carlos Eduardo Silva",
      prosecutor: "Dr. Pedro Henrique",
      defender: "Dr. Roberto Santos Lima",
      policeResponsible: "Inspetor João Carlos",
      status: "cancelada",
      virtualRoom: "https://zoom.us/j/456789123",
      confirmed: false
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
      case "nao_compareceu":
        return <Badge className="bg-yellow-100 text-yellow-800">Não Compareceu</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredAudiences = audiences.filter(audience => {
    const matchesSearch = 
      audience.defendant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audience.process.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audience.unit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || audience.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audiências de Custódia</h1>
          <p className="text-gray-600">Gerencie todas as audiências do sistema</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Audiência
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, processo ou unidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="realizada">Realizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="nao_compareceu">Não Compareceu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Audiências */}
      <div className="space-y-4">
        {filteredAudiences.map((audience) => (
          <Card key={audience.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{new Date(audience.date).toLocaleDateString('pt-BR')} - {audience.time}</span>
                    </div>
                    {getStatusBadge(audience.status)}
                    {audience.confirmed ? (
                      <Badge className="bg-green-100 text-green-800">Confirmado pela UP</Badge>
                    ) : (
                      <Badge variant="outline" className="border-yellow-300 text-yellow-700">Pendente Confirmação</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{audience.defendant}</h3>
                      <p className="text-sm text-gray-600">Processo: {audience.process}</p>
                      <p className="text-sm text-gray-600">Unidade: {audience.unit}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm"><span className="font-medium">Magistrado:</span> {audience.magistrate}</p>
                      <p className="text-sm"><span className="font-medium">Promotor:</span> {audience.prosecutor}</p>
                      <p className="text-sm"><span className="font-medium">Defensor:</span> {audience.defender}</p>
                      <p className="text-sm"><span className="font-medium">Polícia Penal:</span> {audience.policeResponsible}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 lg:ml-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(audience.virtualRoom, '_blank')}
                    className="flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Sala Virtual</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAudiences.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma audiência encontrada</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou adicione uma nova audiência.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Audiencias;
