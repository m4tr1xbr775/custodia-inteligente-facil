
import { Clock, Phone, MessageCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Plantoes = () => {
  const todayDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const onDutyPersonnel = [
    {
      id: 1,
      name: "Dr. Carlos Eduardo Silva",
      role: "Magistrado",
      comarca: "Goiânia",
      phone: "(62) 99999-1111",
      whatsapp: "(62) 99999-1111",
      email: "carlos.silva@tjgo.jus.br",
      period: "24h",
      status: "ativo"
    },
    {
      id: 2,
      name: "Dra. Ana Paula Oliveira",
      role: "Promotor",
      comarca: "Goiânia",
      phone: "(62) 99999-2222",
      whatsapp: "(62) 99999-2222",
      email: "ana.oliveira@mpgo.mp.br",
      period: "24h",
      status: "ativo"
    },
    {
      id: 3,
      name: "Dr. Roberto Santos Lima",
      role: "Defensor",
      comarca: "Goiânia",
      phone: "(62) 99999-3333",
      whatsapp: "(62) 99999-3333",
      email: "roberto.lima@defensoria.go.def.br",
      period: "24h",
      status: "ativo"
    },
    {
      id: 4,
      name: "Inspetor José Maria Santos",
      role: "Polícia Penal",
      unit: "CDP Aparecida de Goiânia",
      phone: "(62) 99999-4444",
      whatsapp: "(62) 99999-4444",
      email: "jose.santos@dgap.go.gov.br",
      period: "12h - Diurno",
      status: "ativo"
    },
    {
      id: 5,
      name: "Inspetora Maria José Silva",
      role: "Polícia Penal",
      unit: "Presídio Feminino",
      phone: "(62) 99999-5555",
      whatsapp: "(62) 99999-5555",
      email: "maria.silva@dgap.go.gov.br",
      period: "12h - Noturno",
      status: "ativo"
    }
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Magistrado":
        return <Badge className="bg-blue-100 text-blue-800">Magistrado</Badge>;
      case "Promotor":
        return <Badge className="bg-green-100 text-green-800">Promotor</Badge>;
      case "Defensor":
        return <Badge className="bg-purple-100 text-purple-800">Defensor</Badge>;
      case "Polícia Penal":
        return <Badge className="bg-orange-100 text-orange-800">Polícia Penal</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Olá ${name}, entrando em contato através do SisJud.`);
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Plantões Ativos</h1>
        <p className="text-gray-600 capitalize">{todayDate}</p>
      </div>

      {/* Resumo dos Plantões */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Magistrados</p>
                <p className="text-xl font-bold text-blue-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Promotores</p>
                <p className="text-xl font-bold text-green-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">Defensores</p>
                <p className="text-xl font-bold text-purple-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">Polícia Penal</p>
                <p className="text-xl font-bold text-orange-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Plantonistas */}
      <div className="space-y-4">
        {onDutyPersonnel.map((person) => (
          <Card key={person.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <h3 className="font-semibold text-lg text-gray-900">{person.name}</h3>
                    {getRoleBadge(person.role)}
                    <Badge className="bg-green-100 text-green-800">
                      <Clock className="h-3 w-3 mr-1" />
                      {person.period}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      {person.comarca && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Comarca:</span> {person.comarca}
                        </p>
                      )}
                      {person.unit && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Unidade:</span> {person.unit}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">E-mail:</span> {person.email}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Telefone:</span> {person.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">WhatsApp:</span> {person.whatsapp}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:ml-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCall(person.phone)}
                    className="flex items-center space-x-2"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Ligar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsApp(person.whatsapp, person.name)}
                    className="flex items-center space-x-2 text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Plantoes;
