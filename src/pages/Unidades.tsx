
import { useState } from "react";
import { Building, Plus, Search, Phone, MessageCircle, MapPin, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UnidadeForm from "@/components/Unidades/UnidadeForm";

const Unidades = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch units from Supabase
  const { data: units = [], isLoading } = useQuery({
    queryKey: ['prison_units'],
    queryFn: async () => {
      console.log('Fetching prison units from Supabase...');
      const { data, error } = await supabase
        .from('prison_units')
        .select(`
          *,
          regions(id, name, type)
        `)
        .order('name');
      
      if (error) {
        console.error('Error fetching prison units:', error);
        throw error;
      }
      
      console.log('Prison units fetched:', data);
      return data || [];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (unitData: any) => {
      console.log('Creating new prison unit:', unitData);
      const { data, error } = await supabase
        .from('prison_units')
        .insert([{
          name: unitData.name,
          region_id: unitData.region_id,
          address: unitData.address,
          phone: unitData.landline,
          capacity: unitData.capacity,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prison_units'] });
      toast({
        title: "Sucesso",
        description: "Unidade criada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error creating unit:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar unidade",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, unitData }: { id: string; unitData: any }) => {
      console.log('Updating prison unit:', id, unitData);
      const { data, error } = await supabase
        .from('prison_units')
        .update({
          name: unitData.name,
          region_id: unitData.region_id,
          address: unitData.address,
          phone: unitData.landline,
          capacity: unitData.capacity,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prison_units'] });
      toast({
        title: "Sucesso",
        description: "Unidade atualizada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Error updating unit:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar unidade",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (unitId: string) => {
      console.log('Deleting prison unit:', unitId);
      const { error } = await supabase
        .from('prison_units')
        .delete()
        .eq('id', unitId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prison_units'] });
      toast({
        title: "Sucesso",
        description: "Unidade excluída com sucesso!",
      });
      setDeletingUnitId(null);
    },
    onError: (error) => {
      console.error('Error deleting unit:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir unidade",
        variant: "destructive",
      });
    },
  });

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

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string, unitName: string) => {
    const message = encodeURIComponent(`Olá, entrando em contato com ${unitName} através do SisJud.`);
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleCreateUnit = () => {
    setEditingUnit(null);
    setIsFormOpen(true);
  };

  const handleEditUnit = (unit: any) => {
    setEditingUnit(unit);
    setIsFormOpen(true);
  };

  const handleDeleteUnit = (unitId: string) => {
    setDeletingUnitId(unitId);
  };

  const confirmDeleteUnit = () => {
    if (deletingUnitId) {
      deleteMutation.mutate(deletingUnitId);
    }
  };

  const handleSaveUnit = async (data: any) => {
    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, unitData: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleViewUnit = (unit: any) => {
    toast({
      title: "Visualização",
      description: `Visualizando detalhes de ${unit.name}`,
    });
  };

  const filteredUnits = units.filter(unit => 
    unit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.regions?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando unidades...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unidades Prisionais</h1>
          <p className="text-gray-600">Gerencie todas as unidades do sistema penitenciário</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleCreateUnit}
        >
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
              placeholder="Buscar por nome ou região..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <MapPin className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Regiões Atendidas</p>
                <p className="text-2xl font-bold text-green-900">
                  {new Set(units.map(u => u.regions?.name)).size}
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
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Região:</span> {unit.regions?.name || 'Não definida'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Telefone:</span> {unit.phone || 'Não informado'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Capacidade:</span> {unit.capacity || 'Não informada'} vagas
                        </p>
                      </div>
                    </div>
                    
                    {unit.address && (
                      <div className="mt-3 flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{unit.address}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 lg:ml-6">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUnit(unit)}
                        className="flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUnit(unit)}
                        className="flex items-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Excluir</span>
                      </Button>
                    </div>
                    
                    {unit.phone && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCall(unit.phone)}
                          className="flex items-center space-x-2"
                        >
                          <Phone className="h-4 w-4" />
                          <span>Ligar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWhatsApp(unit.phone, unit.name)}
                          className="flex items-center space-x-2 text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>WhatsApp</span>
                        </Button>
                      </div>
                    )}
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

      {/* Formulário de Unidade */}
      <UnidadeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveUnit}
        initialData={editingUnit}
        mode={editingUnit ? 'edit' : 'create'}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingUnitId} onOpenChange={() => setDeletingUnitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta unidade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUnit}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Unidades;
