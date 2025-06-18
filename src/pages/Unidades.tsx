
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

interface PrisonUnit {
  id: string;
  name: string;
  short_name: string;
  type: "CDP" | "Presídio" | "CPP";
  comarca: string;
  director: string;
  responsible: string;
  landline: string;
  functional: string;
  whatsapp: string;
  email: string;
  capacity: number;
  current_population: number;
  address: string;
  municipalities: string;
  region_id?: string;
  created_at: string;
  updated_at: string;
}

const Unidades = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<PrisonUnit | null>(null);
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch units from Supabase
  const { data: units = [], isLoading } = useQuery({
    queryKey: ['prison_units_extended'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prison_units_extended')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching units:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Create unit mutation
  const createUnitMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('prison_units_extended')
        .insert([{
          ...data,
          municipalities: Array.isArray(data.municipalities) 
            ? data.municipalities.join(', ') 
            : data.municipalities
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prison_units_extended'] });
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

  // Update unit mutation
  const updateUnitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('prison_units_extended')
        .update({
          ...data,
          municipalities: Array.isArray(data.municipalities) 
            ? data.municipalities.join(', ') 
            : data.municipalities
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prison_units_extended'] });
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

  // Delete unit mutation
  const deleteUnitMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prison_units_extended')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prison_units_extended'] });
      toast({
        title: "Sucesso",
        description: "Unidade excluída com sucesso!",
      });
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

  const handleCreateUnit = () => {
    setEditingUnit(null);
    setIsFormOpen(true);
  };

  const handleEditUnit = (unit: PrisonUnit) => {
    setEditingUnit(unit);
    setIsFormOpen(true);
  };

  const handleDeleteUnit = (unitId: string) => {
    setDeletingUnitId(unitId);
  };

  const confirmDeleteUnit = () => {
    if (deletingUnitId) {
      deleteUnitMutation.mutate(deletingUnitId);
      setDeletingUnitId(null);
    }
  };

  const handleSaveUnit = async (data: any) => {
    if (editingUnit) {
      updateUnitMutation.mutate({ id: editingUnit.id, data });
    } else {
      createUnitMutation.mutate(data);
    }
  };

  const handleViewUnit = (unit: PrisonUnit) => {
    toast({
      title: "Visualização",
      description: `Visualizando detalhes de ${unit.short_name}`,
    });
  };

  const filteredUnits = units.filter(unit => {
    const searchLower = searchTerm.toLowerCase();
    const municipalitiesArray = typeof unit.municipalities === 'string' 
      ? unit.municipalities.split(',').map(m => m.trim()) 
      : [];
    
    return unit.name.toLowerCase().includes(searchLower) ||
           unit.short_name.toLowerCase().includes(searchLower) ||
           unit.comarca.toLowerCase().includes(searchLower) ||
           municipalitiesArray.some((municipality: string) => 
             municipality.toLowerCase().includes(searchLower)
           );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-lg">Carregando unidades...</div>
        </div>
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
        {filteredUnits.map((unit) => {
          const municipalitiesArray = typeof unit.municipalities === 'string' 
            ? unit.municipalities.split(',').map(m => m.trim()) 
            : [];

          return (
            <Card key={unit.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{unit.name}</h3>
                        {getTypeBadge(unit.type)}
                        {getOccupancyBadge(unit.current_population, unit.capacity)}
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
                            <span className="font-medium">População Atual:</span> {unit.current_population}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Ocupação:</span> {Math.round((unit.current_population / unit.capacity) * 100)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Municípios Atendidos:</span>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {municipalitiesArray.map((municipality: string, index: number) => (
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
                      
                      <div className="flex flex-wrap gap-2">
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
                          onClick={() => handleWhatsApp(unit.whatsapp, unit.short_name)}
                          className="flex items-center space-x-2 text-green-600 border-green-300 hover:bg-green-50"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>WhatsApp</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
