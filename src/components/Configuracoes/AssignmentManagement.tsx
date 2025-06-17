
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
import { Plus, Edit, Trash2, Calendar, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Assignment {
  id: string;
  schedule_id: string;
  region_id: string;
  magistrate_id?: string;
  prosecutor_id?: string;
  defender_id?: string;
  date: string;
  shift: string;
  created_at: string;
  updated_at: string;
  region?: {
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

const AssignmentManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [formData, setFormData] = useState({
    region_id: "",
    magistrate_id: "none",
    prosecutor_id: "none",
    defender_id: "none",
    date: "",
    shift: "diurno",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch schedules
  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('status', 'ativa')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch regions
  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
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

  // Fetch assignments for selected schedule
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['schedule_assignments', selectedScheduleId],
    queryFn: async () => {
      if (!selectedScheduleId) return [];
      
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          *,
          region:regions(name, code),
          magistrate:magistrates(name),
          prosecutor:prosecutors(name),
          defender:defenders(name)
        `)
        .eq('schedule_id', selectedScheduleId)
        .order('date');
      
      if (error) throw error;
      return data as Assignment[];
    },
    enabled: !!selectedScheduleId,
  });

  // Create assignment mutation
  const createMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      // Clean data - convert "none" values to null/undefined
      const cleanData = { ...assignmentData, schedule_id: selectedScheduleId };
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
      queryClient.invalidateQueries({ queryKey: ['schedule_assignments', selectedScheduleId] });
      toast({
        title: "Sucesso",
        description: "Atribuição criada com sucesso!",
      });
      setIsDialogOpen(false);
      setFormData({
        region_id: "",
        magistrate_id: "none",
        prosecutor_id: "none",
        defender_id: "none",
        date: "",
        shift: "diurno",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao criar atribuição: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schedule_assignments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_assignments', selectedScheduleId] });
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
    
    if (!formData.region_id || !formData.date) {
      toast({
        title: "Erro",
        description: "Região e data são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta atribuição?")) {
      deleteMutation.mutate(id);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Atribuições de Plantão</h2>
      </div>

      {/* Schedule Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Selecionar Escala</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label htmlFor="schedule">Escala Ativa</Label>
            <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma escala" />
              </SelectTrigger>
              <SelectContent>
                {schedules.map((schedule) => (
                  <SelectItem key={schedule.id} value={schedule.id}>
                    {schedule.title} ({new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedScheduleId && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Atribuições da Escala</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Atribuição</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Atribuição</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="region_id">Região *</Label>
                    <Select value={formData.region_id} onValueChange={(value) => handleInputChange("region_id", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma região" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name} ({region.code})
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
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="shift">Turno</Label>
                    <Select value={formData.shift} onValueChange={(value) => handleInputChange("shift", value)}>
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
                    <Select value={formData.magistrate_id} onValueChange={(value) => handleInputChange("magistrate_id", value)}>
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
                    <Select value={formData.prosecutor_id} onValueChange={(value) => handleInputChange("prosecutor_id", value)}>
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
                    <Select value={formData.defender_id} onValueChange={(value) => handleInputChange("defender_id", value)}>
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
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span>Atribuições Cadastradas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Região</TableHead>
                      <TableHead>Turno</TableHead>
                      <TableHead>Magistrado</TableHead>
                      <TableHead>Promotor</TableHead>
                      <TableHead>Advogado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500">
                          Nenhuma atribuição encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {new Date(assignment.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{assignment.region?.name} ({assignment.region?.code})</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getShiftBadgeColor(assignment.shift)}>
                              {getShiftLabel(assignment.shift)}
                            </Badge>
                          </TableCell>
                          <TableCell>{assignment.magistrate?.name || "-"}</TableCell>
                          <TableCell>{assignment.prosecutor?.name || "-"}</TableCell>
                          <TableCell>{assignment.defender?.name || "-"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDelete(assignment.id)}
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
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AssignmentManagement;
