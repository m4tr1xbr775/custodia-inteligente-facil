
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserManagementProps {
  type: "magistrates" | "prosecutors" | "defenders";
  title: string;
}

interface BaseUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  registration?: string;
  active?: boolean;
  created_at: string;
  updated_at: string;
}

interface Defender extends BaseUser {
  type?: string;
}

type User = BaseUser | Defender;

const UserManagement = ({ type, title }: UserManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    registration: "",
    type: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data from Supabase
  const { data: users = [], isLoading } = useQuery({
    queryKey: [type],
    queryFn: async () => {
      console.log(`Fetching data for ${type}`);
      const { data, error } = await supabase
        .from(type)
        .select('*')
        .order('name');
      
      if (error) {
        console.error(`Error fetching ${type}:`, error);
        throw error;
      }
      
      console.log(`Fetched ${type} data:`, data);
      return data as User[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (userData: any) => {
      console.log(`Creating new ${type}:`, userData);
      
      // Remove the type field for magistrates and prosecutors as they don't have this column
      const cleanUserData = { ...userData };
      if (type === "magistrates" || type === "prosecutors") {
        delete cleanUserData.type;
      }
      
      // Remove empty strings to avoid inserting empty values
      Object.keys(cleanUserData).forEach(key => {
        if (cleanUserData[key] === "") {
          delete cleanUserData[key];
        }
      });
      
      const { data, error } = await supabase
        .from(type)
        .insert([cleanUserData])
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating ${type}:`, error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] });
      toast({
        title: "Sucesso",
        description: `${title.slice(0, -1)} criado com sucesso!`,
      });
      setIsDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        registration: "",
        type: "",
      });
    },
    onError: (error: any) => {
      console.error(`Error creating ${type}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao criar ${title.slice(0, -1).toLowerCase()}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`Deleting ${type} with id:`, id);
      const { error } = await supabase
        .from(type)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting ${type}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] });
      toast({
        title: "Sucesso",
        description: `${title.slice(0, -1)} removido com sucesso!`,
      });
    },
    onError: (error: any) => {
      console.error(`Error deleting ${type}:`, error);
      toast({
        title: "Erro",
        description: `Erro ao remover ${title.slice(0, -1).toLowerCase()}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    console.log("Form submitted:", formData);
    createMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Adicionar {title.slice(0, -1)}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar {title.slice(0, -1)}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(62) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="registration">Registro/Matrícula</Label>
                <Input
                  id="registration"
                  value={formData.registration}
                  onChange={(e) => handleInputChange("registration", e.target.value)}
                  placeholder="Número do registro"
                />
              </div>
              {type === "defenders" && (
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dativo">Advogado Dativo</SelectItem>
                      <SelectItem value="defensoria_publica">Defensoria Pública</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Registro</TableHead>
                {type === "defenders" && <TableHead>Tipo</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={type === "defenders" ? 6 : 5} className="text-center text-gray-500">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.email && (
                          <div className="flex items-center space-x-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center space-x-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.registration || "-"}</TableCell>
                    {type === "defenders" && (
                      <TableCell>
                        {(user as Defender).type === "defensoria_publica" ? "Defensoria Pública" : 
                         (user as Defender).type === "dativo" ? "Advogado Dativo" : "-"}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge className={user.active !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {user.active !== false ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
