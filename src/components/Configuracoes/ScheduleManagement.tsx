import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Edit, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parseLocalDate, formatLocalDate } from "@/lib/dateUtils";
import { useMagistrateAssistantValidation } from "@/hooks/useMagistrateAssistantValidation";
import MagistrateAssistantAlert from "./MagistrateAssistantAlert";

interface Schedule {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'ativa' | 'inativa' | 'rascunho';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface Assignment {
  id: string;
  schedule_id: string;
  serventia_id: string;
  magistrate_id?: string;
  prosecutor_id?: string;
  defender_id?: string;
  shift: string;
  created_at: string;
  updated_at: string;
  serventia?: {
    name: string;
    code: string;
  };
  magistrate?: {
    name: string;
  };
  prosecutor?: {
    name: string;
  };
  defender?: {
    name: string;
  };
  judicial_assistant?: {
    id: string;
    name: string;
    phone: string;
  };
}

const ScheduleManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isManageAssignmentsDialogOpen, setIsManageAssignmentsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedScheduleForAssignment, setSelectedScheduleForAssignment] = useState<Schedule | null>(null);
  const [selectedScheduleForManagement, setSelectedScheduleForManagement] = useState<Schedule | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    serventia_id: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "rascunho",
  });
  const [assignmentFormData, setAssignmentFormData] = useState({
    serventia_id: "",
    magistrate_id: "none",
    prosecutor_id: "none",
    defender_id: "none",
    shift: "integral",
  });
  const [assignmentMagistrateAlert, setAssignmentMagistrateAlert] = useState<{
    show: boolean;
    magistrate: any;
  }>({ show: false, magistrate: null });

  const { validateMagistrateAssistant, showAlert, selectedMagistrate, closeAlert } = useMagistrateAssistantValidation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Verificar se deve retornar para escalas após edição de magistrado
  useEffect(() => {
    const shouldReturn = localStorage.getItem('returnToSchedules');
    if (shouldReturn === 'true') {
      localStorage.removeItem('returnToSchedules');
      localStorage.removeItem('selectedMagistrateId');
      toast({
        title: "Sucesso",
        description: "Agora você pode continuar com o cadastro da escala.",
      });
    }
  }, [toast]);

  // Fetch serventias
  const { data: serventias = [] } = useQuery({
    queryKey: ['serventias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('serventias')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch magistrates
  const { data: magistrates = [] } = useQuery({
    queryKey: ['magistrates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('magistrates')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch prosecutors
  const { data: prosecutors = [] } = useQuery({
    queryKey: ['prosecutors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prosecutors')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch defenders
  const { data: defenders = [] } = useQuery({
    queryKey: ['defenders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('defenders')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch schedules from Supabase
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      console.log('Fetching schedules from database');
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching schedules:', error);
        throw error;
      }
      
      console.log('Fetched schedules:', data);
      return data as Schedule[];
    },
  });

  // Fetch assignments for selected schedule in management dialog
  const { data: managementAssignments = [], isLoading: isLoadingManagementAssignments } = useQuery({
    queryKey: ['management_assignments', selectedScheduleForManagement?.id],
    queryFn: async () => {
      if (!selectedScheduleForManagement?.id) return [];
      
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          *,
          serventia:serventias(name, code),
          magistrate:magistrates(name, judicial_assistant_id),
          prosecutor:prosecutors(name),
          defender:defenders(name),
          judicial_assistant:contacts!judicial_assistant_id(id, name, phone)
        `)
        .eq('schedule_id', selectedScheduleForManagement.id)
        .order('shift');
      
      if (error) throw error;
      return data as Assignment[];
    },
    enabled: !!selectedScheduleForManagement?.id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      console.log('Creating new schedule:', scheduleData);
      
      // Get selected serventia name for title
      const selectedServentia = serventias.find(s => s.id === scheduleData.serventia_id);
      const title = selectedServentia ? `${selectedServentia.name} - ${selectedServentia.code}` : 'Nova Escala';
      
      const dataToInsert = {
        title,
        description: scheduleData.description,
        start_date: scheduleData.start_date,
        end_date: scheduleData.end_date,
        status: scheduleData.status
      };
      
      const { data, error } = await supabase
        .from('schedules')
        .insert([dataToInsert])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating schedule:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: "Sucesso",
        description: "Escala criada com sucesso!",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error('Error creating schedule:', error);
      toast({
        title: "Erro",
        description: `Erro ao criar escala: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, scheduleData }: { id: string; scheduleData: any }) => {
      console.log('Updating schedule with id:', id, scheduleData);
      
      // Get selected serventia name for title
      const selectedServentia = serventias.find(s => s.id === scheduleData.serventia_id);
      const title = selectedServentia ? `${selectedServentia.name} - ${selectedServentia.code}` : scheduleData.title || 'Escala Atualizada';
      
      const dataToUpdate = {
        title,
        description: scheduleData.description,
        start_date: scheduleData.start_date,
        end_date: scheduleData.end_date,
        status: scheduleData.status
      };
      
      const { data, error } = await supabase
        .from('schedules')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating schedule:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: "Sucesso",
        description: "Escala atualizada com sucesso!",
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error('Error updating schedule:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar escala: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting schedule with id:', id);
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting schedule:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: "Sucesso",
        description: "Escala removida com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Erro",
        description: `Erro ao remover escala: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create assignment mutation with validation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      console.log('Creating assignment with data:', assignmentData);
      
      // Validar assessor antes de criar se há magistrado selecionado
      if (assignmentData.magistrate_id && assignmentData.magistrate_id !== "none") {
        const validation = await validateMagistrateAssistant(assignmentData.magistrate_id);
        
        if (!validation.isValid) {
          // Encontrar o magistrado para exibir o alerta no formulário
          const magistrate = magistrates.find(m => m.id === assignmentData.magistrate_id);
          if (magistrate) {
            setAssignmentMagistrateAlert({ show: true, magistrate });
          }
          throw new Error("Magistrado sem assessor vinculado");
        }
        
        // Preencher automaticamente o judicial_assistant_id
        assignmentData.judicial_assistant_id = validation.judicialAssistantId;
      }

      const cleanData = { 
        ...assignmentData, 
        schedule_id: selectedScheduleForAssignment?.id
      };
      
      if (cleanData.magistrate_id === "none") {
        delete cleanData.magistrate_id;
        delete cleanData.judicial_assistant_id;
      }
      if (cleanData.prosecutor_id === "none") delete cleanData.prosecutor_id;
      if (cleanData.defender_id === "none") delete cleanData.defender_id;

      const { data, error } = await supabase
        .from('schedule_assignments')
        .insert([cleanData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_assignments'] });
      queryClient.invalidateQueries({ queryKey: ['management_assignments'] });
      toast({
        title: "Sucesso",
        description: "Atribuição criada com sucesso!",
      });
      handleCloseAssignmentDialog();
    },
    onError: (error: any) => {
      if (error.message !== "Magistrado sem assessor vinculado") {
        toast({
          title: "Erro",
          description: `Erro ao criar atribuição: ${error.message}`,
          variant: "destructive",
        });
      }
    },
  });

  // Update assignment mutation with validation
  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, assignmentData }: { id: string; assignmentData: any }) => {
      console.log('Updating assignment with data:', assignmentData);
      
      // Validar assessor antes de atualizar se há magistrado selecionado
      if (assignmentData.magistrate_id && assignmentData.magistrate_id !== "none") {
        const validation = await validateMagistrateAssistant(assignmentData.magistrate_id);
        
        if (!validation.isValid) {
          throw new Error("Magistrado sem assessor vinculado");
        }
        
        // Preencher automaticamente o judicial_assistant_id
        assignmentData.judicial_assistant_id = validation.judicialAssistantId;
      }

      const cleanData = { ...assignmentData };
      
      if (cleanData.magistrate_id === "none") {
        cleanData.magistrate_id = null;
        cleanData.judicial_assistant_id = null;
      }
      if (cleanData.prosecutor_id === "none") cleanData.prosecutor_id = null;
      if (cleanData.defender_id === "none") cleanData.defender_id = null;

      const { data, error } = await supabase
        .from('schedule_assignments')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management_assignments', selectedScheduleForManagement?.id] });
      toast({
        title: "Sucesso",
        description: "Atribuição atualizada com sucesso!",
      });
      handleCloseAssignmentEditDialog();
    },
    onError: (error: any) => {
      if (error.message !== "Magistrado sem assessor vinculado") {
        toast({
          title: "Erro",
          description: `Erro ao atualizar atribuição: ${error.message}`,
          variant: "destructive",
        });
      }
    },
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schedule_assignments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management_assignments', selectedScheduleForManagement?.id] });
      toast({
        title: "Sucesso",
        description: "Atribuição removida com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao remover atribuição: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serventia_id || !formData.start_date || !formData.end_date) {
      toast({
        title: "Erro",
        description: "Serventia, data de início e fim são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast({
        title: "Erro",
        description: "A data de início deve ser anterior à data de fim",
        variant: "destructive",
      });
      return;
    }

    console.log("Schedule form submitted:", formData);
    
    if (editingSchedule) {
      updateMutation.mutate({ id: editingSchedule.id, scheduleData: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignmentFormData.serventia_id) {
      toast({
        title: "Erro",
        description: "Serventia é obrigatória",
        variant: "destructive",
      });
      return;
    }

    createAssignmentMutation.mutate(assignmentFormData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAssignmentInputChange = (field: string, value: string) => {
    setAssignmentFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    // Try to find the serventia that matches the title
    const matchedServentia = serventias.find(s => schedule.title.includes(s.name));
    setFormData({
      serventia_id: matchedServentia?.id || "",
      description: schedule.description || "",
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      status: schedule.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta escala?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSchedule(null);
    setFormData({
      serventia_id: "",
      description: "",
      start_date: "",
      end_date: "",
      status: "rascunho",
    });
  };

  const handleAddAssignment = (schedule: Schedule) => {
    setSelectedScheduleForAssignment(schedule);
    
    // Encontrar a serventia baseada no título da escala
    const matchedServentia = serventias.find(s => schedule.title.includes(s.name));
    
    setAssignmentFormData({
      serventia_id: matchedServentia?.id || "",
      magistrate_id: "none",
      prosecutor_id: "none",
      defender_id: "none",
      shift: "integral",
    });
    
    setIsAssignmentDialogOpen(true);
  };

  const handleCloseAssignmentDialog = () => {
    setIsAssignmentDialogOpen(false);
    setSelectedScheduleForAssignment(null);
    setAssignmentFormData({
      serventia_id: "",
      magistrate_id: "none",
      prosecutor_id: "none",
      defender_id: "none",
      shift: "integral",
    });
    // Limpar o alerta do formulário
    setAssignmentMagistrateAlert({ show: false, magistrate: null });
  };

  const handleManageAssignments = (schedule: Schedule) => {
    setSelectedScheduleForManagement(schedule);
    setIsManageAssignmentsDialogOpen(true);
  };

  const handleCloseManageAssignmentsDialog = () => {
    setIsManageAssignmentsDialogOpen(false);
    setSelectedScheduleForManagement(null);
    setEditingAssignment(null);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setAssignmentFormData({
      serventia_id: assignment.serventia_id,
      magistrate_id: assignment.magistrate_id || "none",
      prosecutor_id: assignment.prosecutor_id || "none",
      defender_id: assignment.defender_id || "none",
      shift: assignment.shift,
    });
  };

  const handleCloseAssignmentEditDialog = () => {
    setEditingAssignment(null);
    setAssignmentFormData({
      serventia_id: "",
      magistrate_id: "none",
      prosecutor_id: "none",
      defender_id: "none",
      shift: "integral",
    });
  };

  const handleSaveAssignmentEdit = () => {
    if (!editingAssignment) return;
    
    if (!assignmentFormData.serventia_id) {
      toast({
        title: "Erro",
        description: "Serventia é obrigatória",
        variant: "destructive",
      });
      return;
    }

    updateAssignmentMutation.mutate({ 
      id: editingAssignment.id, 
      assignmentData: assignmentFormData 
    });
  };

  const handleDeleteAssignment = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta atribuição?")) {
      deleteAssignmentMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'inativa':
        return <Badge className="bg-red-100 text-red-800">Inativa</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Rascunho</Badge>;
    }
  };

  const getShiftBadgeColor = (shift: string) => {
    switch (shift) {
      case "diurno":
        return "bg-yellow-100 text-yellow-800";
      case "noturno":
        return "bg-blue-100 text-blue-800";
      case "integral":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShiftLabel = (shift: string) => {
    switch (shift) {
      case "diurno":
        return "Diurno";
      case "noturno":
        return "Noturno";
      case "integral":
        return "Integral";
      default:
        return shift;
    }
  };

  const handleAssignmentMagistrateChange = (value: string) => {
    handleAssignmentInputChange("magistrate_id", value);
    // Limpar o alerta quando o magistrado for alterado
    setAssignmentMagistrateAlert({ show: false, magistrate: null });
  };

  const handleCloseAssignmentMagistrateAlert = () => {
    setAssignmentMagistrateAlert({ show: false, magistrate: null });
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
      {/* Alert para magistrado sem assessor - APENAS no topo da página para escalas gerais */}
      {showAlert && selectedMagistrate && (
        <MagistrateAssistantAlert
          magistrateName={selectedMagistrate.name}
          magistrateId={selectedMagistrate.id}
          onClose={closeAlert}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Escalas de Plantão</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2" onClick={() => setEditingSchedule(null)}>
              <Plus className="h-4 w-4" />
              <span>Nova Escala</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? "Editar Escala" : "Criar Nova Escala"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="serventia_id">Serventia *</Label>
                <Select value={formData.serventia_id} onValueChange={(value) => handleInputChange("serventia_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma serventia" />
                  </SelectTrigger>
                  <SelectContent>
                    {serventias.map((serventia) => (
                      <SelectItem key={serventia.id} value={serventia.id}>
                        {serventia.name} ({serventia.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Observações sobre a escala"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Data Início *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange("start_date", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Data Fim *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange("end_date", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="inativa">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : (editingSchedule ? "Atualizar Escala" : "Criar Escala")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Atribuição</DialogTitle>
            {selectedScheduleForAssignment && (
              <p className="text-sm text-gray-600">
                Escala: {selectedScheduleForAssignment.title}
              </p>
            )}
          </DialogHeader>
          <form onSubmit={handleAssignmentSubmit} className="space-y-4">
            <div>
              <Label htmlFor="serventia_id">Serventia *</Label>
              <Select value={assignmentFormData.serventia_id} onValueChange={(value) => handleAssignmentInputChange("serventia_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma serventia" />
                </SelectTrigger>
                <SelectContent>
                  {serventias.map((serventia) => (
                    <SelectItem key={serventia.id} value={serventia.id}>
                      {serventia.name} ({serventia.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="shift">Turno</Label>
              <Select value={assignmentFormData.shift} onValueChange={(value) => handleAssignmentInputChange("shift", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diurno">Diurno</SelectItem>
                  <SelectItem value="noturno">Noturno</SelectItem>
                  <SelectItem value="integral">Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="magistrate_id">Magistrado</Label>
              <Select value={assignmentFormData.magistrate_id} onValueChange={handleAssignmentMagistrateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um magistrado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {magistrates.map((magistrate) => (
                    <SelectItem key={magistrate.id} value={magistrate.id}>
                      {magistrate.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Alert para magistrado sem assessor - DIRETAMENTE no formulário */}
              {assignmentMagistrateAlert.show && assignmentMagistrateAlert.magistrate && (
                <div className="mt-2">
                  <MagistrateAssistantAlert
                    magistrateName={assignmentMagistrateAlert.magistrate.name}
                    magistrateId={assignmentMagistrateAlert.magistrate.id}
                    onClose={handleCloseAssignmentMagistrateAlert}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="prosecutor_id">Promotor</Label>
              <Select value={assignmentFormData.prosecutor_id} onValueChange={(value) => handleAssignmentInputChange("prosecutor_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um promotor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {prosecutors.map((prosecutor) => (
                    <SelectItem key={prosecutor.id} value={prosecutor.id}>
                      {prosecutor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="defender_id">Advogado</Label>
              <Select value={assignmentFormData.defender_id} onValueChange={(value) => handleAssignmentInputChange("defender_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um advogado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {defenders.map((defender) => (
                    <SelectItem key={defender.id} value={defender.id}>
                      {defender.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCloseAssignmentDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createAssignmentMutation.isPending}>
                {createAssignmentMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Assignments Dialog */}
      <Dialog open={isManageAssignmentsDialogOpen} onOpenChange={setIsManageAssignmentsDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Atribuições</DialogTitle>
            {selectedScheduleForManagement && (
              <p className="text-sm text-gray-600">
                Escala: {selectedScheduleForManagement.title}
              </p>
            )}
          </DialogHeader>
          
          <div className="space-y-4">
            {isLoadingManagementAssignments ? (
              <div className="text-center py-8">Carregando atribuições...</div>
            ) : (
              <div className="space-y-4">
                {managementAssignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma atribuição encontrada para esta escala
                  </div>
                ) : (
                  managementAssignments.map((assignment) => (
                    <Card key={assignment.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Serventia</Label>
                          {editingAssignment?.id === assignment.id ? (
                            <Select value={assignmentFormData.serventia_id} onValueChange={(value) => setAssignmentFormData(prev => ({ ...prev, serventia_id: value }))}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {serventias.map((serventia) => (
                                  <SelectItem key={serventia.id} value={serventia.id}>
                                    {serventia.name} ({serventia.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-sm text-gray-900 mt-1">
                              {assignment.serventia?.name} ({assignment.serventia?.code})
                            </p>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Turno</Label>
                          {editingAssignment?.id === assignment.id ? (
                            <Select value={assignmentFormData.shift} onValueChange={(value) => setAssignmentFormData(prev => ({ ...prev, shift: value }))}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="diurno">Diurno</SelectItem>
                                <SelectItem value="noturno">Noturno</SelectItem>
                                <SelectItem value="integral">Integral</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={`${getShiftBadgeColor(assignment.shift)} mt-1`}>
                              {getShiftLabel(assignment.shift)}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Magistrado</Label>
                          {editingAssignment?.id === assignment.id ? (
                            <Select value={assignmentFormData.magistrate_id} onValueChange={(value) => setAssignmentFormData(prev => ({ ...prev, magistrate_id: value }))}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhum</SelectItem>
                                {magistrates.map((magistrate) => (
                                  <SelectItem key={magistrate.id} value={magistrate.id}>
                                    {magistrate.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-sm text-gray-900 mt-1">
                              {assignment.magistrate?.name || "-"}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Assessor Judicial</Label>
                          <p className="text-sm text-gray-900 mt-1">
                            {assignment.judicial_assistant?.name || "-"}
                          </p>
                          {assignment.judicial_assistant?.phone && (
                            <p className="text-xs text-gray-500">
                              {assignment.judicial_assistant.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Promotor</Label>
                          {editingAssignment?.id === assignment.id ? (
                            <Select value={assignmentFormData.prosecutor_id} onValueChange={(value) => setAssignmentFormData(prev => ({ ...prev, prosecutor_id: value }))}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhum</SelectItem>
                                {prosecutors.map((prosecutor) => (
                                  <SelectItem key={prosecutor.id} value={prosecutor.id}>
                                    {prosecutor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-sm text-gray-900 mt-1">
                              {assignment.prosecutor?.name || "-"}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">Advogado</Label>
                          {editingAssignment?.id === assignment.id ? (
                            <Select value={assignmentFormData.defender_id} onValueChange={(value) => setAssignmentFormData(prev => ({ ...prev, defender_id: value }))}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhum</SelectItem>
                                {defenders.map((defender) => (
                                  <SelectItem key={defender.id} value={defender.id}>
                                    {defender.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-sm text-gray-900 mt-1">
                              {assignment.defender?.name || "-"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 mt-4">
                        {editingAssignment?.id === assignment.id ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleCloseAssignmentEditDialog}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={handleSaveAssignmentEdit}
                              disabled={updateAssignmentMutation.isPending}
                            >
                              {updateAssignmentMutation.isPending ? "Salvando..." : "Salvar"}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditAssignment(assignment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              disabled={deleteAssignmentMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleCloseManageAssignmentsDialog}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Escalas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serventia</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Nenhuma escala encontrada
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{schedule.title}</div>
                        {schedule.description && (
                          <div className="text-sm text-gray-500">{schedule.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatLocalDate(parseLocalDate(schedule.start_date))} - {formatLocalDate(parseLocalDate(schedule.end_date))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                    <TableCell>
                      {formatLocalDate(parseLocalDate(schedule.created_at.split('T')[0]))}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          title="Adicionar Atribuição"
                          onClick={() => handleAddAssignment(schedule)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          title="Gerenciar Atribuições"
                          onClick={() => handleManageAssignments(schedule)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(schedule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(schedule.id)}
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

export default ScheduleManagement;
