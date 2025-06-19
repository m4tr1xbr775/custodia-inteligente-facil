
import { useState } from "react";
import { Users, Plus, Search, Phone, MessageCircle, Mail, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContatoModal from "@/components/Contatos/ContatoModal";

const Contatos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | undefined>();
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch contacts from database
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const getRoleBadge = (position: string) => {
    if (!position) return <Badge variant="secondary">Sem Cargo</Badge>;
    
    switch (position.toLowerCase()) {
      case "juiz":
        return <Badge className="bg-blue-100 text-blue-800">Juiz</Badge>;
      case "promotor":
        return <Badge className="bg-green-100 text-green-800">Promotor</Badge>;
      case "defensor público":
        return <Badge className="bg-purple-100 text-purple-800">Defensor Público</Badge>;
      case "assistente de juiz":
        return <Badge className="bg-orange-100 text-orange-800">Assistente de Juiz</Badge>;
      case "analista":
        return <Badge className="bg-gray-100 text-gray-800">Analista</Badge>;
      case "gestor":
        return <Badge className="bg-yellow-100 text-yellow-800">Gestor</Badge>;
      case "administrador":
        return <Badge className="bg-red-100 text-red-800">Administrador</Badge>;
      default:
        return <Badge variant="secondary">{position}</Badge>;
    }
  };

  const handleCall = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleWhatsApp = (phone: string, name: string) => {
    if (phone) {
      const message = encodeURIComponent(`Olá ${name}, entrando em contato através do SisJud.`);
      window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  const handleEmail = (email: string) => {
    if (email) {
      window.open(`mailto:${email}`, '_self');
    }
  };

  const handleNewContact = () => {
    setEditingContactId(undefined);
    setIsModalOpen(true);
  };

  const handleEditContact = (contactId: string) => {
    setEditingContactId(contactId);
    setIsModalOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      setDeletingContactId(contactId);

      const { error } = await supabase
        .from('contacts')
        .update({ active: false })
        .eq('id', contactId);

      if (error) throw error;

      toast({
        title: "Contato removido",
        description: "O contato foi removido com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    } catch (error: any) {
      console.error('Erro ao deletar contato:', error);
      toast({
        title: "Erro ao remover contato",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingContactId(null);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "todos" || contact.position === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando contatos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banco de Contatos</h1>
          <p className="text-gray-600">Gerencie todos os contatos do sistema judiciário</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleNewContact}
        >
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
                  placeholder="Buscar por nome, serventia de origem ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Cargos</SelectItem>
                <SelectItem value="Juiz">Juiz</SelectItem>
                <SelectItem value="Promotor">Promotor</SelectItem>
                <SelectItem value="Defensor Público">Defensor Público</SelectItem>
                <SelectItem value="Assistente de Juiz">Assistente de Juiz</SelectItem>
                <SelectItem value="Analista">Analista</SelectItem>
                <SelectItem value="Gestor">Gestor</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
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
                    <div className="flex items-center space-x-2 mt-2">
                      {getRoleBadge(contact.position)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditContact(contact.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deletingContactId === contact.id}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o contato de {contact.name}? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteContact(contact.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {contact.position && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Cargo:</span> {contact.position}
                    </p>
                  )}
                  {contact.department && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Serventia de Origem:</span> {contact.department}
                    </p>
                  )}
                  {contact.phone && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Telefone:</span> {contact.phone}
                    </p>
                  )}
                  {contact.mobile && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Celular:</span> {contact.mobile}
                    </p>
                  )}
                  {contact.email && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">E-mail:</span> {contact.email}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {contact.mobile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCall(contact.mobile)}
                      className="flex items-center space-x-1"
                    >
                      <Phone className="h-3 w-3" />
                      <span>Ligar</span>
                    </Button>
                  )}
                  {contact.mobile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWhatsApp(contact.mobile, contact.name)}
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
            <p className="text-gray-600">Tente ajustar os filtros ou adicione um novo contato.</p>
          </CardContent>
        </Card>
      )}

      <ContatoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingContactId={editingContactId}
      />
    </div>
  );
};

export default Contatos;
