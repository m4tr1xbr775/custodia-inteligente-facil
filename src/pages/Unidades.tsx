
import { useState } from "react";
import { Building, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnidadesCrud } from "@/hooks/useUnidadesCrud";
import UnidadeForm from "@/components/Unidades/UnidadeForm";
import UnidadesStats from "@/components/Unidades/UnidadesStats";
import UnidadeCard from "@/components/Unidades/UnidadeCard";

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
  address: string;
  municipalities: string;
  region_id?: string;
  number_of_rooms: number;
  created_at: string;
  updated_at: string;
}

const Unidades = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<PrisonUnit | null>(null);
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null);
  const { toast } = useToast();
  const { createMutation, updateMutation, deleteMutation } = useUnidadesCrud();

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
      
      // Garantir que todos os campos obrigatórios estejam presentes
      return (data || []).map(unit => ({
        ...unit,
        type: unit.type as "CDP" | "Presídio" | "CPP",
        number_of_rooms: unit.number_of_rooms || 1,
        address: unit.address || '',
        municipalities: unit.municipalities || ''
      })) as PrisonUnit[];
    },
  });

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
    console.log('Editing unit:', unit);
    setEditingUnit(unit);
    setIsFormOpen(true);
  };

  const handleDeleteUnit = (unitId: string) => {
    setDeletingUnitId(unitId);
  };

  const confirmDeleteUnit = () => {
    if (deletingUnitId) {
      deleteMutation.mutate(deletingUnitId);
      setDeletingUnitId(null);
    }
  };

  const handleSaveUnit = async (data: any) => {
    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, data });
    } else {
      createMutation.mutate(data);
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
      ? unit.municipalities.split(',').map(m => m.trim()).filter(m => m !== '') 
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

      {/* Estatísticas */}
      <UnidadesStats units={units} />

      {/* Lista de Unidades */}
      <div className="space-y-4">
        {filteredUnits.map((unit) => (
          <UnidadeCard
            key={unit.id}
            unit={unit}
            onView={handleViewUnit}
            onEdit={handleEditUnit}
            onDelete={handleDeleteUnit}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
          />
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
        onClose={() => {
          setIsFormOpen(false);
          setEditingUnit(null);
        }}
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
