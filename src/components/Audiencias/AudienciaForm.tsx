
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
    region_id: "",
    prison_unit_id: "",
    audience_slot_time: "",
    virtual_room_url: "",
    observations: "",
    status: "agendada" as AudienceStatus,
    unit_acknowledgment: "pendente",
  });

  // Fetch regions (centrais)
  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      console.log('Fetching regions...');
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');
      if (error) {
        console.error('Error fetching regions:', error);
        throw error;
      }
      console.log('Regions fetched:', data);
      return data;
    },
  });

  // Fetch prison units based on selected region - ATUALIZADO para usar prison_units_extended
  const { data: prisonUnits } = useQuery({
    queryKey: ['prison_units_extended', formData.region_id],
    queryFn: async () => {
      if (!formData.region_id) {
        console.log('No region selected, returning empty array');
        return [];
      }
      console.log('Fetching prison units for region:', formData.region_id);
      const { data, error } = await supabase
        .from('prison_units_extended')
        .select('*')
        .eq('region_id', formData.region_id)
        .order('name');
      if (error) {
        console.error('Error fetching prison units:', error);
        throw error;
      }
      console.log('Prison units fetched:', data);
      return data;
    },
    enabled: !!formData.region_id,
  });

  // Fetch available time slots for selected unit and date
  const { data: availableSlots } = useQuery({
    queryKey: ['available_slots', formData.prison_unit_id, formData.scheduled_date],
    queryFn: async () => {
      if (!formData.prison_unit_id || !formData.scheduled_date) return [];
      console.log('Fetching available slots for unit:', formData.prison_unit_id, 'date:', formData.scheduled_date);
      const { data, error } = await supabase
        .from('prison_unit_slots')
        .select('*')
        .eq('prison_unit_id', formData.prison_unit_id)
        .eq('date', formData.scheduled_date)
        .eq('is_available', true)
        .order('time');
      if (error) {
        console.error('Error fetching available slots:', error);
        throw error;
      }
      console.log('Available slots fetched:', data);
      return data;
    },
    enabled: !!(formData.prison_unit_id && formData.scheduled_date),
  });

  // Fetch plantonistas for the selected region and date
  const { data: scheduleAssignments } = useQuery({
    queryKey: ['schedule_assignments', formData.region_id, formData.scheduled_date],
    queryFn: async () => {
      if (!formData.region_id || !formData.scheduled_date) return [];
      console.log('Fetching schedule assignments for region:', formData.region_id, 'date:', formData.scheduled_date);
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
      if (error) {
        console.error('Error fetching schedule assignments:', error);
        throw error;
      }
      console.log('Schedule assignments fetched:', data);
      return data;
    },
    enabled: !!(formData.region_id && formData.scheduled_date),
  });

  // Reset dependent fields when selections change
  useEffect(() => {
    if (formData.region_id) {
      console.log('Region changed, resetting prison unit and slot time');
      setFormData(prev => ({
        ...prev,
        prison_unit_id: "",
        audience_slot_time: "",
      }));
    }
  }, [formData.region_id]);

  useEffect(() => {
    if (formData.prison_unit_id || formData.scheduled_date) {
      console.log('Prison unit or date changed, resetting slot time');
      setFormData(prev => ({
        ...prev,
        audience_slot_time: "",
      }));
    }
  }, [formData.prison_unit_id, formData.scheduled_date]);

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
            region_id: data.region_id || "",
            prison_unit_id: data.prison_unit_id || "",
            audience_slot_time: data.audience_slot_time || "",
            virtual_room_url: data.virtual_room_url || "",
            observations: data.observations || "",
            status: data.status || "agendada",
            unit_acknowledgment: data.unit_acknowledgment || "pendente",
          });
        }
      };

      fetchAudiencia();
    }
  }, [audienciaId, isEditing, toast]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        const { data: result, error } = await supabase
          .from('audiences')
          .update({
            defendant_name: data.defendant_name,
            process_number: data.process_number,
            scheduled_date: data.scheduled_date,
            scheduled_time: data.audience_slot_time,
            audience_slot_time: data.audience_slot_time,
            region_id: data.region_id,
            prison_unit_id: data.prison_unit_id,
            virtual_room_url: data.virtual_room_url,
            observations: data.observations,
            status: data.status,
            unit_acknowledgment: data.unit_acknowledgment,
          })
          .eq('id', audienciaId)
          .select()
          .single();
        if (error) throw error;
        return result;
      } else {
        // Reserve the time slot
        const { error: slotError } = await supabase
          .from('prison_unit_slots')
          .update({ is_available: false })
          .eq('prison_unit_id', data.prison_unit_id)
          .eq('date', data.scheduled_date)
          .eq('time', data.audience_slot_time);

        if (slotError) throw slotError;

        // Create the audience
        const { data: result, error } = await supabase
          .from('audiences')
          .insert([{
            defendant_name: data.defendant_name,
            process_number: data.process_number,
            scheduled_date: data.scheduled_date,
            scheduled_time: data.audience_slot_time,
            audience_slot_time: data.audience_slot_time,
            region_id: data.region_id,
            prison_unit_id: data.prison_unit_id,
            virtual_room_url: data.virtual_room_url,
            observations: data.observations,
            status: data.status,
            unit_acknowledgment: data.unit_acknowledgment,
          }])
          .select()
          .single();
        if (error) throw error;

        // Update the slot with the audience ID
        await supabase
          .from('prison_unit_slots')
          .update({ audience_id: result.id })
          .eq('prison_unit_id', data.prison_unit_id)
          .eq('date', data.scheduled_date)
          .eq('time', data.audience_slot_time);

        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] });
      queryClient.invalidateQueries({ queryKey: ['available_slots'] });
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
    
    console.log('Form data on submit:', formData);
    
    if (!formData.defendant_name || !formData.process_number || !formData.scheduled_date || 
        !formData.region_id || !formData.prison_unit_id || !formData.audience_slot_time) {
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
      region_id: "",
      prison_unit_id: "",
      audience_slot_time: "",
      virtual_room_url: "",
      observations: "",
      status: "agendada" as AudienceStatus,
      unit_acknowledgment: "pendente",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Changing ${field} to:`, value);
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
          {/* Seção 1: Central/Região */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Selecione a Central/Região</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="region_id">Central/Região *</Label>
                <Select value={formData.region_id} onValueChange={(value) => handleInputChange('region_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma central ou região" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions?.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {regions && regions.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    Nenhuma região encontrada. Cadastre regiões primeiro.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seção 2: Unidade Prisional */}
          {formData.region_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Unidade Prisional</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="prison_unit_id">Unidade Prisional *</Label>
                  <Select 
                    value={formData.prison_unit_id} 
                    onValueChange={(value) => handleInputChange('prison_unit_id', value)}
                  >
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
                  {prisonUnits && prisonUnits.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      Nenhuma unidade prisional encontrada para esta região. Cadastre unidades primeiro.
                    </p>
                  )}
                  {prisonUnits && prisonUnits.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {prisonUnits.length} unidade{prisonUnits.length !== 1 ? 's' : ''} encontrada{prisonUnits.length !== 1 ? 's' : ''} para esta região.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção 3: Data */}
          {formData.prison_unit_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. Data da Audiência</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Seção 4: Horário Disponível */}
          {formData.scheduled_date && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">4. Horário Disponível</CardTitle>
                <p className="text-sm text-gray-600">Apenas horários livres na unidade selecionada</p>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="audience_slot_time">Horário *</Label>
                  <Select 
                    value={formData.audience_slot_time} 
                    onValueChange={(value) => handleInputChange('audience_slot_time', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário disponível" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots?.map((slot) => (
                        <SelectItem key={`${slot.date}-${slot.time}`} value={slot.time}>
                          {slot.time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableSlots && availableSlots.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      Nenhum horário disponível para esta data nesta unidade.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção 5: Plantonistas */}
          {formData.audience_slot_time && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">5. Plantonistas do Período</CardTitle>
                <p className="text-sm text-gray-600">Preenchido automaticamente</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Magistrado Plantonista</Label>
                    <Input
                      value={scheduleAssignments?.[0]?.magistrates?.name || "Não definido"}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>Promotor Plantonista</Label>
                    <Input
                      value={scheduleAssignments?.[0]?.prosecutors?.name || "Não definido"}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>Defensor Plantonista</Label>
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

          {/* Seção 6: Dados do Processo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">6. Dados do Custodiado e Processo</CardTitle>
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

              <div className="mt-4 space-y-4">
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
              </div>
            </CardContent>
          </Card>

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
