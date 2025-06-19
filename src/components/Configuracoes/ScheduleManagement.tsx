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
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Edit, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  date: string;
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
}

const ScheduleManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedScheduleForAssignment, setSelectedScheduleForAssignment] = useState<Schedule | null>(null);
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
    date: "",
    shift: "diurno",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const cleanData = { ...assignmentData, schedule_id: selectedScheduleForAssignment?.id };
      if (cleanData.magistrate_id === "none") delete cleanData.magistrate_id;
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
      toast({
        title: "Sucesso",
        description: "Atribuição criada com sucesso!",
      });
      handleCloseAssignmentDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao criar atribuição: ${error.message}`,
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
    
    if (!assignmentFormData.serventia_id || !assignmentFormData.date) {
      toast({
        title: "Erro",
        description: "Serventia e data são obrigatórios",
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

  const handleManageAssignments = (schedule: Schedule) => {
    setSelectedScheduleForAssignment(schedule);
    // Find the serventia that matches the schedule title to pre-fill serventia
    const matchedServentia = serventias.find(s => schedule.title.includes(s.name));
    setAssignmentFormData({
      serventia_id: matchedServentia?.id || "",
      magistrate_id: "none",
      prosecutor_id: "none",
      defender_id: "none",
      date: schedule.start_date, // Use start_date from schedule
      shift: "diurno",
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
      date: "",
      shift: "diurno",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta escala?")) {
      deleteMutation.mutate(id);
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
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={assignmentFormData.date}
                onChange={(e) => handleAssignmentInputChange("date", e.target.value)}
                required
              />
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
              <Select value={assignmentFormData.magistrate_id} onValueChange={(value) => handleAssignmentInputChange("magistrate_id", value)}>
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
                          {new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                    <TableCell>
                      {new Date(schedule.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
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
