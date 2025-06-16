
import { useState } from "react";
import { Users, Plus, Search, Phone, MessageCircle, Mail } from "lucide-react";
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

const Contatos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");

  const contacts = [
    {
      id: 1,
      name: "Dr. Carlos Eduardo Silva",
      role: "Magistrado",
      institution: "TJGO",
      comarca: "Goiânia",
      phone: "(62) 3201-1111",
      cellphone: "(62) 99999-1111",
      whatsapp: "(62) 99999-1111",
      email: "carlos.silva@tjgo.jus.br",
      position: "Juiz Titular"
    },
    {
      id: 2,
      name: "Dra. Ana Paula Oliveira",
      role: "Promotor",
      institution: "MPGO",
      comarca: "Goiânia",
      phone: "(62) 3243-2222",
      cellphone: "(62) 99999-2222",
      whatsapp: "(62) 99999-2222",
      email: "ana.oliveira@mpgo.mp.br",
      position: "1ª Promotoria Criminal"
    },
    {
      id: 3,
      name: "Dr. Roberto Santos Lima",
      role: "Defensor",
      institution: "Defensoria Pública",
      comarca: "Goiânia",
      phone: "(62) 3269-3333",
      cellphone: "(62) 99999-3333",
      whatsapp: "(62) 99999-3333",
      email: "roberto.lima@defensoria.go.def.br",
      position: "Defensor Público"
    },
    {
      id: 4,
      name: "Inspetor José Maria Santos",
      role: "Polícia Penal",
      institution: "DGAP",
      unit: "CDP Aparecida de Goiânia",
      phone: "(62) 3201-4444",
      cellphone: "(62) 99999-4444",
      whatsapp: "(62) 99999-4444",
      email: "jose.santos@dgap.go.gov.br",
      position: "Inspetor Chefe"
    },
    {
      id: 5,
      name: "Dra. Fernanda Luz",
      role: "Defensor",
      institution: "Defensoria Pública",
      comarca: "Aparecida de Goiânia",
      phone: "(62) 3269-5555",
      cellphone: "(62) 99999-5555",
      whatsapp: "(62) 99999-5555",
      email: "fernanda.luz@defensoria.go.def.br",
      position: "Defensora Pública"
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
      case "Assessor":
        return <Badge className="bg-gray-100 text-gray-800">Assessor</Badge>;
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

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.comarca && contact.comarca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.unit && contact.unit.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === "todos" || contact.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banco de Contatos</h1>
          <p className="text-gray-600">Gerencie todos os contatos do sistema judiciário</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Contato
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
                  placeholder="Buscar por nome, instituição ou comarca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Funções</SelectItem>
                <SelectItem value="Magistrado">Magistrado</SelectItem>
                <SelectItem value="Promotor">Promotor</SelectItem>
                <SelectItem value="Defensor">Defensor</SelectItem>
                <SelectItem value="Polícia Penal">Polícia Penal</SelectItem>
                <SelectItem value="Assessor">Assessor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contatos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{contact.name}</h3>
                    <p className="text-sm text-gray-600">{contact.position}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getRoleBadge(contact.role)}
                      <Badge variant="outline">{contact.institution}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {contact.comarca && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Comarca:</span> {contact.comarca}
                    </p>
                  )}
                  {contact.unit && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Unidade:</span> {contact.unit}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Telefone:</span> {contact.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Celular:</span> {contact.cellphone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">E-mail:</span> {contact.email}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCall(contact.cellphone)}
                    className="flex items-center space-x-1"
                  >
                    <Phone className="h-3 w-3" />
                    <span>Ligar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsApp(contact.whatsapp, contact.name)}
                    className="flex items-center space-x-1 text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEmail(contact.email)}
                    className="flex items-center space-x-1"
                  >
                    <Mail className="h-3 w-3" />
                    <span>E-mail</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contato encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou adicione um novo contato.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Contatos;
