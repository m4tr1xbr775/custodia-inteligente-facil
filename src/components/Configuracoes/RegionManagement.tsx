
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, MapPin, Phone, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Serventia {
  id: string;
  name: string;
  code: string;
  type: 'macrorregiao' | 'central_custodia';
  responsible?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

const RegionManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServentia, setEditingServentia] = useState<Serventia | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [serventiaToDelete, setServentiaToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    responsible: "",
    phone: "",
    type: "macrorregiao" as 'macrorregiao' | 'central_custodia',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch serventias from Supabase
  const { data: serventias = [], isLoading } = useQuery({
    queryKey: ['serventias'],
    queryFn: async () => {
      console.log('Fetching serventias from database');
      const { data, error } = await supabase
        .from('serventias')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching serventias:', error);
        throw error;
      }
      
      console.log('Fetched serventias:', data);
      return data as Serventia[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (serventiaData: any) => {
      console.log('Creating new serventia:', serventiaData);
      const { data, error } = await supabase
        .from('serventias')
        .insert([serventiaData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating serventia:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serventias'] });
      queryClient.invalidateQueries({ queryKey: ['custody-centers'] });
      toast({
        title: "Sucesso",
        description: "Serventia criada com sucesso!",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error('Error creating serventia:', error);
      toast({
        title: "Erro",
        description: `Erro ao criar serventia: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, serventiaData }: { id: string; serventiaData: any }) => {
      console.log('Updating serventia with id:', id, serventiaData);
      const { data, error } = await supabase
        .from('serventias')
        .update(serventiaData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating serventia:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serventias'] });
      queryClient.invalidateQueries({ queryKey: ['custody-centers'] });
      toast({
        title: "Sucesso",
        description: "Serventia atualizada com sucesso!",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error('Error updating serventia:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar serventia: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Check if serventia can be deleted
  const checkServentiaUsage = useMutation({
    mutationFn: async (serventiaId: string) => {
      console.log('Checking if serventia can be deleted:', serventiaId);
      
      // Check audiences
      const { data: audiences, error: audiencesError } = await supabase
        .from('audiences')
        .select('id')
        .eq('serventia_id', serventiaId)
        .limit(1);
      
      if (audiencesError) {
        console.error('Error checking audiences:', audiencesError);
        throw audiencesError;
      }
      
      // Check contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id')
        .limit(1);
      
      if (contactsError) {
        console.error('Error checking contacts:', contactsError);
        throw contactsError;
      }
      
      // Check schedule assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('schedule_assignments')
        .select('id')
        .eq('serventia_id', serventiaId)
        .limit(1);
      
      if (assignmentsError) {
        console.error('Error checking schedule assignments:', assignmentsError);
        throw assignmentsError;
      }
      
      const hasUsages = {
        audiences: audiences && audiences.length > 0,
        contacts: contacts && contacts.length > 0,
        assignments: assignments && assignments.length > 0
      };
      
      console.log('Serventia usage check result:', hasUsages);
      return hasUsages;
    },
    onSuccess: (usages) => {
      if (usages.audiences || usages.contacts || usages.assignments) {
        const usageMessages = [];
        if (usages.audiences) usageMessages.push('audiências');
        if (usages.contacts) usageMessages.push('contatos');
        if (usages.assignments) usageMessages.push('escalas');
        
        toast({
          title: "Não é possível excluir",
          description: `Esta serventia não pode ser removida pois está sendo utilizada em: ${usageMessages.join(', ')}.`,
          variant: "destructive",
        });
      } else {
        // Proceed with deletion
        if (serventiaToDelete) {
          deleteMutation.mutate(serventiaToDelete);
        }
      }
      setDeleteAlertOpen(false);
      setServentiaToDelete(null);
    },
    onError: (error: any) => {
      console.error('Error checking serventia usage:', error);
      toast({
        title: "Erro",
        description: `Erro ao verificar uso da serventia: ${error.message}`,
        variant: "destructive",
      });
      setDeleteAlertOpen(false);
      setServentiaToDelete(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting serventia with id:', id);
      const { error } = await supabase
        .from('serventias')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting serventia:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serventias'] });
      queryClient.invalidateQueries({ queryKey: ['custody-centers'] });
      toast({
        title: "Sucesso",
        description: "Serventia removida com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting serventia:', error);
      toast({
        title: "Erro",
        description: `Erro ao remover serventia: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Erro",
        description: "Nome e código são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    console.log("Serventia form submitted:", formData);
    
    if (editingServentia) {
      updateMutation.mutate({ id: editingServentia.id, serventiaData: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = (serventia: Serventia) => {
    console.log('Editing serventia:', serventia);
    setEditingServentia(serventia);
    setFormData({
      name: serventia.name,
      code: serventia.code,
      responsible: serventia.responsible || "",
      phone: serventia.phone || "",
      type: serventia.type,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingServentia(null);
    setFormData({
      name: "",
      code: "",
      responsible: "",
      phone: "",
      type: "macrorregiao",
    });
  };

  const handleDeleteClick = (id: string) => {
    console.log('Delete clicked for serventia:', id);
    setServentiaToDelete(id);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (serventiaToDelete) {
      checkServentiaUsage.mutate(serventiaToDelete);
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "macrorregiao" ? "Macrorregião" : "Central de Custódia";
  };

  const getTypeBadgeColor = (type: string) => {
    return type === "macrorregiao" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
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
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Serventias</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2" onClick={() => setEditingServentia(null)}>
              <Plus className="h-4 w-4" />
              <span>Adicionar Serventia</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingServentia ? "Editar Serventia" : "Adicionar Nova Serventia"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Serventia *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: Central de Custódia 01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder="Ex: CC01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value: 'macrorregiao' | 'central_custodia') => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macrorregiao">Macrorregião</SelectItem>
                    <SelectItem value="central_custodia">Central de Custódia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="responsible">Responsável</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => handleInputChange("responsible", e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="556299999999"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Serventias Cadastradas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serventias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    Nenhuma serventia encontrada
                  </TableCell>
                </TableRow>
              ) : (
                serventias.map((serventia) => (
                  <TableRow key={serventia.id}>
                    <TableCell className="font-medium">{serventia.name}</TableCell>
                    <TableCell>{serventia.code}</TableCell>
                    <TableCell>
                      <Badge className={getTypeBadgeColor(serventia.type)}>
                        {getTypeLabel(serventia.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {serventia.responsible ? (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{serventia.responsible}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {serventia.phone ? (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{serventia.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(serventia)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteClick(serventia.id)}
                          disabled={deleteMutation.isPending || checkServentiaUsage.isPending}
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

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta serventia? Esta ação não pode ser desfeita.
              Verificaremos se a serventia está sendo utilizada antes de removê-la.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteAlertOpen(false);
              setServentiaToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={checkServentiaUsage.isPending}
            >
              {checkServentiaUsage.isPending ? "Verificando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RegionManagement;
