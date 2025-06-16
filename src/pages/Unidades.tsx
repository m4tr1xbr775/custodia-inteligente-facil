
import { useState } from "react";
import { Building, Plus, Search, Phone, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Unidades = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const units = [
    {
      id: 1,
      name: "Centro de Detenção Provisória de Aparecida de Goiânia",
      shortName: "CDP Aparecida",
      comarca: "Aparecida de Goiânia",
      director: "Dr. João Carlos Silva",
      responsible: "Inspetor José Maria Santos",
      landline: "(62) 3201-4444",
      functional: "(62) 3201-4445",
      whatsapp: "(62) 99999-4444",
      email: "cdp.aparecida@dgap.go.gov.br",
      address: "Av. Presidente Vargas, 1000 - Aparecida de Goiânia/GO",
      capacity: 850,
      currentPopulation: 720,
      municipalities: ["Aparecida de Goiânia", "Senador Canedo", "Bela Vista de Goiás"],
      type: "CDP"
    },
    {
      id: 2,
      name: "Presídio Feminino de Goiânia",
      shortName: "Presídio Feminino",
      comarca: "Goiânia",
      director: "Dra. Maria Fernanda Costa",
      responsible: "Inspetora Maria José Silva",
      landline: "(62) 3201-5555",
      functional: "(62) 3201-5556",
      whatsapp: "(62) 99999-5555",
      email: "presidio.feminino@dgap.go.gov.br",
      address: "Rua das Flores, 500 - Goiânia/GO",
      capacity: 400,
      currentPopulation: 380,
      municipalities: ["Goiânia", "Trindade", "Goianira"],
      type: "Presídio"
    },
    {
      id: 3,
      name: "Complexo Prisional de Goiânia",
      shortName: "CPP Goiânia",
      comarca: "Goiânia",
      director: "Dr. Pedro Henrique Oliveira",
      responsible: "Inspetor João Carlos Santos",
      landline: "(62) 3201-6666",
      functional: "(62) 3201-6667",
      whatsapp: "(62) 99999-6666",
      email: "cpp.goiania@dgap.go.gov.br",
      address: "BR-153, Km 10 - Goiânia/GO",
      capacity: 1200,
      currentPopulation: 1150,
      municipalities: ["Goiânia", "Hidrolândia", "Aragoiânia"],
      type: "CPP"
    },
    {
      id: 4,
      name: "Casa de Prisão Provisória de Anápolis",
      shortName: "CPP Anápolis",
      comarca: "Anápolis",
      director: "Dr. Roberto Lima Santos",
      responsible: "Inspetor Carlos Eduardo Lima",
      landline: "(62) 3201-7777",
      functional: "(62) 3201-7778",
      whatsapp: "(62) 99999-7777",
      email: "cpp.anapolis@dgap.go.gov.br",
      address: "Av. Brasília, 2000 - Anápolis/GO",
      capacity: 600,
      currentPopulation: 580,
      municipalities: ["Anápolis", "Nerópolis", "Campo Limpo de Goiás"],
      type: "CPP"
    }
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "CDP":
        return <Badge className="bg-blue-100 text-blue-800">CDP</Badge>;
      case "Presídio":
        return <Badge className="bg-green-100 text-green-800">Presídio</Badge>;
      case "CPP":
        return <Badge className="bg-purple-100 text-purple-800">CPP</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getOccupancyBadge = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) {
      return <Badge className="bg-red-100 text-red-800">Superlotação</Badge>;
    } else if (percentage >= 80) {
      return <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string, unitName: string) => {
    const message = encodeURIComponent(`Olá, entrando em contato com ${unitName} através do SisJud.`);
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const filteredUnits = units.filter(unit => 
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.comarca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.municipalities.some(municipality => 
      municipality.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unidades Prisionais</h1>
          <p className="text-gray-600">Gerencie todas as unidades do sistema penitenciário</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Unidade
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, comarca ou município..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Total de Unidades</p>
                <p className="text-2xl font-bold text-blue-900">{units.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-lg text-white font-bold">
                CDP
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">CDPs</p>
                <p className="text-2xl font-bold text-green-900">
                  {units.filter(u => u.type === 'CDP').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 p-2 rounded-lg text-white font-bold">
                CPP
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">CPPs</p>
                <p className="text-2xl font-bold text-purple-900">
                  {units.filter(u => u.type === 'CPP').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 p-2 rounded-lg text-white font-bold">
                PR
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">Presídios</p>
                <p className="text-2xl font-bold text-orange-900">
                  {units.filter(u => u.type === 'Presídio').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Unidades */}
      <div className="space-y-4">
        {filteredUnits.map((unit) => (
          <Card key={unit.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{unit.name}</h3>
                      {getTypeBadge(unit.type)}
                      {getOccupancyBadge(unit.currentPopulation, unit.capacity)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Comarca:</span> {unit.comarca}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Diretor:</span> {unit.director}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Responsável:</span> {unit.responsible}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Telefone:</span> {unit.landline}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Funcional:</span> {unit.functional}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">WhatsApp:</span> {unit.whatsapp}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Capacidade:</span> {unit.capacity} vagas
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">População Atual:</span> {unit.currentPopulation}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Ocupação:</span> {Math.round((unit.currentPopulation / unit.capacity) * 100)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Municípios Atendidos:</span>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {unit.municipalities.map((municipality, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {municipality}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{unit.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCall(unit.landline)}
                      className="flex items-center space-x-2"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Ligar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWhatsApp(unit.whatsapp, unit.shortName)}
                      className="flex items-center space-x-2 text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUnits.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma unidade encontrada</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou adicione uma nova unidade.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Unidades;
