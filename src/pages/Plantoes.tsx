
import { useState } from "react";
import { Users, Search, Phone, MessageCircle, Mail, Filter } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Plantoes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [locationFilter, setLocationFilter] = useState("todos");

  // Fetch all contacts with combined data from different tables
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['agenda-contacts', typeFilter, locationFilter],
    queryFn: async () => {
      const allContacts: any[] = [];

      // Fetch magistrates
      const { data: magistrates } = await supabase
        .from('magistrates')
        .select('id, name, email, phone')
        .eq('active', true);
      
      if (magistrates) {
        magistrates.forEach(magistrate => {
          allContacts.push({
            ...magistrate,
            type: 'Magistrado',
            location: 'Comarca Principal' // You can modify this based on your data structure
          });
        });
      }

      // Fetch prosecutors
      const { data: prosecutors } = await supabase
        .from('prosecutors')
        .select('id, name, email, phone')
        .eq('active', true);
      
      if (prosecutors) {
        prosecutors.forEach(prosecutor => {
          allContacts.push({
            ...prosecutor,
            type: 'Promotor',
            location: 'Comarca Principal'
          });
        });
      }

      // Fetch defenders
      const { data: defenders } = await supabase
        .from('defenders')
        .select('id, name, email, phone')
        .eq('active', true);
      
      if (defenders) {
        defenders.forEach(defender => {
          allContacts.push({
            ...defender,
            type: 'Defensor',
            location: 'Comarca Principal'
          });
        });
      }

      // Fetch contacts table for Analistas and Policiais
      const { data: generalContacts } = await supabase
        .from('contacts')
        .select('id, name, email, phone, mobile, profile, department')
        .eq('active', true);
        
      if (generalContacts) {
        generalContacts.forEach(contact => {
          allContacts.push({
            ...contact,
            phone: contact.mobile || contact.phone,
            type: contact.profile || 'Analista',
            location: contact.department || 'Unidade Geral'
          });
        });
      }

      return allContacts;
    },
  });

  const getTypeBadge = (type: string) => {
    const colors = {
      'Magistrado': 'bg-blue-100 text-blue-800',
      'Promotor': 'bg-green-100 text-green-800',
      'Defensor': 'bg-purple-100 text-purple-800',
      'Analista': 'bg-gray-100 text-gray-800',
      'Policial Penal': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  const handleWhatsApp = (phone: string, name: string) => {
    if (phone) {
      const message = encodeURIComponent(`Olá ${name}, entrando em contato através do SisJud.`);
      window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  const handleCall = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleEmail = (email: string) => {
    if (email) {
      window.open(`mailto:${email}`, '_self');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "todos" || contact.type === typeFilter;
    const matchesLocation = locationFilter === "todos" || contact.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando agenda de contatos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda de Contatos</h1>
          <p className="text-gray-600">Contatos dos operadores do sistema judiciário</p>
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
                  placeholder="Buscar por nome, tipo ou localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo de Contato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="Magistrado">Magistrado</SelectItem>
                <SelectItem value="Promotor">Promotor</SelectItem>
                <SelectItem value="Defensor">Defensor</SelectItem>
                <SelectItem value="Analista">Analista</SelectItem>
                <SelectItem value="Policial Penal">Policial Penal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Localização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Localizações</SelectItem>
                <SelectItem value="comarca principal">Comarca Principal</SelectItem>
                <SelectItem value="unidade">Unidade</SelectItem>
                <SelectItem value="comarca">Comarca</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contatos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={`${contact.type}-${contact.id}`} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{contact.name}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      {getTypeBadge(contact.type)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tipo:</span> {contact.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Localização:</span> {contact.location}
                  </p>
                  {contact.phone && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Telefone:</span> {contact.phone}
                    </p>
                  )}
                  {contact.email && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">E-mail:</span> {contact.email}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {contact.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCall(contact.phone)}
                      className="flex items-center space-x-1"
                    >
                      <Phone className="h-3 w-3" />
                      <span>Ligar</span>
                    </Button>
                  )}
                  {contact.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWhatsApp(contact.phone, contact.name)}
                      className="flex items-center space-x-1 text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>WhatsApp</span>
                    </Button>
                  )}
                  {contact.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmail(contact.email)}
                      className="flex items-center space-x-1"
                    >
                      <Mail className="h-3 w-3" />
                      <span>E-mail</span>
                    </Button>
                  )}
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
            <p className="text-gray-600">Tente ajustar os filtros para encontrar os contatos desejados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Plantoes;
