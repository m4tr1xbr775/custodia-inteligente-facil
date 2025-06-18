
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type AudienceStatus = Database["public"]["Enums"]["audience_status"];

interface AudienciaFormProps {
  isOpen: boolean;
  onClose: () => void;
  audienciaId?: string;
}

const AudienciaForm = ({ isOpen, onClose, audienciaId }: AudienciaFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!audienciaId;

  const [formData, setFormData] = useState({
    defendant_name: "",
    process_number: "",
    scheduled_date: "",
    scheduled_time: "",
    region_id: "",
    prison_unit_id: "",
    magistrate_id: "",
    prosecutor_id: "",
    defender_id: "",
    police_officer_id: "",
    virtual_room_url: "",
    observations: "",
    status: "agendada" as AudienceStatus,
    confirmed_by_unit: false,
  });

  // Fetch data for dropdowns
  const { data: regions } = useQuery({
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

  const { data: prisonUnits } = useQuery({
    queryKey: ['prison_units', formData.region_id],
    queryFn: async () => {
      if (!formData.region_id) return [];
      const { data, error } = await supabase
        .from('prison_units')
        .select('*')
        .eq('region_id', formData.region_id)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!formData.region_id,
  });

  const { data: policeOfficers } = useQuery({
    queryKey: ['police_officers', formData.prison_unit_id],
    queryFn: async () => {
      if (!formData.prison_unit_id) return [];
      const { data, error } = await supabase
        .from('police_officers')
        .select('*')
        .eq('unit_id', formData.prison_unit_id)
        .eq('active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!formData.prison_unit_id,
  });

  // Fetch plantonistas for the selected region and date
  const { data: scheduleAssignments } = useQuery({
    queryKey: ['schedule_assignments', formData.region_id, formData.scheduled_date],
    queryFn: async () => {
      if (!formData.region_id || !formData.scheduled_date) return [];
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          *,
          magistrates(id, name),
          prosecutors(id, name),
          defenders(id, name)
        `)
        .eq('region_id', formData.region_id)
        .eq('date', formData.scheduled_date);
      if (error) throw error;
      return data;
    },
    enabled: !!(formData.region_id && formData.scheduled_date),
  });

  // Auto-fill plantonistas when region and date are selected
  useEffect(() => {
    if (scheduleAssignments && scheduleAssignments.length > 0) {
      const assignment = scheduleAssignments[0]; // Take first assignment for the date
      setFormData(prev => ({
        ...prev,
        magistrate_id: assignment.magistrate_id || "",
        prosecutor_id: assignment.prosecutor_id || "",
        defender_id: assignment.defender_id || "",
      }));
    }
  }, [scheduleAssignments]);

  // Reset dependent fields when region changes
  useEffect(() => {
    if (formData.region_id) {
      setFormData(prev => ({
        ...prev,
        prison_unit_id: "",
        police_officer_id: "",
        magistrate_id: "",
        prosecutor_id: "",
        defender_id: "",
      }));
    }
  }, [formData.region_id]);

  // Reset police officer when prison unit changes
  useEffect(() => {
    if (formData.prison_unit_id) {
      setFormData(prev => ({
        ...prev,
        police_officer_id: "",
      }));
    }
  }, [formData.prison_unit_id]);

  // Fetch existing audiencia data if editing
  useEffect(() => {
    if (isEditing && audienciaId) {
      const fetchAudiencia = async () => {
        const { data, error } = await supabase
          .from('audiences')
          .select('*')
          .eq('id', audienciaId)
          .single();
        
        if (error) {
          console.error('Error fetching audiencia:', error);
          toast({
            title: "Erro",
            description: "Erro ao carregar dados da audiência",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setFormData({
            defendant_name: data.defendant_name || "",
            process_number: data.process_number || "",
            scheduled_date: data.scheduled_date || "",
            scheduled_time: data.scheduled_time || "",
            region_id: data.region_id || "",
            prison_unit_id: data.prison_unit_id || "",
            magistrate_id: data.magistrate_id || "",
            prosecutor_id: data.prosecutor_id || "",
            defender_id: data.defender_id || "",
            police_officer_id: data.police_officer_id || "",
            virtual_room_url: data.virtual_room_url || "",
            observations: data.observations || "",
            status: data.status || "agendada",
            confirmed_by_unit: data.confirmed_by_unit || false,
          });
        }
      };

      fetchAudiencia();
    }
  }, [audienciaId, isEditing, toast]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Clean data - convert empty strings to null for optional foreign keys
      const cleanData = { ...data };
      if (!cleanData.magistrate_id) cleanData.magistrate_id = null;
      if (!cleanData.prosecutor_id) cleanData.prosecutor_id = null;
      if (!cleanData.defender_id) cleanData.defender_id = null;
      if (!cleanData.police_officer_id) cleanData.police_officer_id = null;

      if (isEditing) {
        const { data: result, error } = await supabase
          .from('audiences')
          .update(cleanData)
          .eq('id', audienciaId)
          .select()
          .single();
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('audiences')
          .insert([cleanData])
          .select()
          .single();
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] });
      toast({
        title: "Sucesso",
        description: `Audiência ${isEditing ? 'atualizada' : 'criada'} com sucesso!`,
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Error saving audiencia:', error);
      toast({
        title: "Erro",
        description: `Erro ao ${isEditing ? 'atualizar' : 'criar'} audiência`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.defendant_name || !formData.process_number || !formData.scheduled_date || 
        !formData.scheduled_time || !formData.region_id || !formData.prison_unit_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      defendant_name: "",
      process_number: "",
      scheduled_date: "",
      scheduled_time: "",
      region_id: "",
      prison_unit_id: "",
      magistrate_id: "",
      prosecutor_id: "",
      defender_id: "",
      police_officer_id: "",
      virtual_room_url: "",
      observations: "",
      status: "agendada" as AudienceStatus,
      confirmed_by_unit: false,
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Audiência' : 'Nova Audiência'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção 1: Região/Central - Primeira seleção */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Selecione a Região ou Central</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="region_id">Região/Central *</Label>
                <Select value={formData.region_id} onValueChange={(value) => handleInputChange('region_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma região ou central" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions?.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Seção 2: Data e Hora */}
          {formData.region_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Data e Horário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduled_date">Data *</Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduled_time">Horário *</Label>
                    <Input
                      id="scheduled_time"
                      type="time"
                      value={formData.scheduled_time}
                      onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção 3: Plantonistas (preenchido automaticamente) */}
          {formData.scheduled_date && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. Plantonistas do Período</CardTitle>
                <p className="text-sm text-gray-600">Preenchido automaticamente com base na região e data selecionada</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="magistrate_id">Magistrado Plantonista</Label>
                    <Input
                      value={scheduleAssignments?.[0]?.magistrates?.name || "Não definido"}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prosecutor_id">Promotor Plantonista</Label>
                    <Input
                      value={scheduleAssignments?.[0]?.prosecutors?.name || "Não definido"}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="defender_id">Advogado Dativo Plantonista</Label>
                    <Input
                      value={scheduleAssignments?.[0]?.defenders?.name || "Não definido"}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção 4: Dados do Réu e Processo */}
          {formData.scheduled_date && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">4. Dados do Custodiado e Processo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defendant_name">Nome do Custodiado *</Label>
                    <Input
                      id="defendant_name"
                      value={formData.defendant_name}
                      onChange={(e) => handleInputChange('defendant_name', e.target.value)}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="process_number">Número do Processo *</Label>
                    <Input
                      id="process_number"
                      value={formData.process_number}
                      onChange={(e) => handleInputChange('process_number', e.target.value)}
                      placeholder="0000000-00.0000.0.00.0000"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção 5: Unidade Prisional e Polícia Penal */}
          {formData.defendant_name && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">5. Unidade Prisional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prison_unit_id">Unidade Prisional onde está preso *</Label>
                    <Select value={formData.prison_unit_id} onValueChange={(value) => handleInputChange('prison_unit_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a unidade prisional" />
                      </SelectTrigger>
                      <SelectContent>
                        {prisonUnits?.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="police_officer_id">Polícia Penal Responsável</Label>
                    <Select value={formData.police_officer_id} onValueChange={(value) => handleInputChange('police_officer_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um policial" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {policeOfficers?.map((officer) => (
                          <SelectItem key={officer.id} value={officer.id}>
                            {officer.name} - {officer.rank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção 6: Informações Adicionais */}
          {formData.prison_unit_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">6. Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="virtual_room_url">URL da Sala Virtual</Label>
                  <Input
                    id="virtual_room_url"
                    value={formData.virtual_room_url}
                    onChange={(e) => handleInputChange('virtual_room_url', e.target.value)}
                    placeholder="https://zoom.us/j/123456789"
                  />
                </div>

                <div>
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => handleInputChange('observations', e.target.value)}
                    placeholder="Observações adicionais..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendada">Agendada</SelectItem>
                      <SelectItem value="realizada">Realizada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                      <SelectItem value="nao_compareceu">Não Compareceu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="confirmed_by_unit"
                    checked={formData.confirmed_by_unit}
                    onChange={(e) => handleInputChange('confirmed_by_unit', e.target.checked)}
                  />
                  <Label htmlFor="confirmed_by_unit">Confirmado pela Unidade Prisional</Label>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AudienciaForm;
