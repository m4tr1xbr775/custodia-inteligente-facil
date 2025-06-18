
import React, { useState } from "react";
import { Calendar, Clock, MapPin, User, FileText, Link } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TimeSlot {
  time: string;
  available: boolean;
  conflictingUnit?: string;
}

interface ScheduleFormData {
  region_id: string;
  prison_unit_id: string;
  scheduled_date: string;
  scheduled_time: string;
  defendant_name: string;
  defendant_document: string;
  process_number: string;
  virtual_room_url: string;
  observations: string;
}

const AgendamentoJuiz = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [formData, setFormData] = useState<ScheduleFormData>({
    region_id: "",
    prison_unit_id: "",
    scheduled_date: "",
    scheduled_time: "",
    defendant_name: "",
    defendant_document: "",
    process_number: "",
    virtual_room_url: "",
    observations: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch prison units for selected region
  const { data: prisonUnits = [] } = useQuery({
    queryKey: ['prison-units', selectedRegion],
    queryFn: async () => {
      if (!selectedRegion) return [];
      const { data, error } = await supabase
        .from('prison_units')
        .select('*')
        .eq('region_id', selectedRegion)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedRegion,
  });

  // Fetch schedule assignments for selected region and date
  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', selectedRegion, selectedDate],
    queryFn: async () => {
      if (!selectedRegion || !selectedDate) return [];
      
      // Get day of week (0=Sunday, 1=Monday, etc)
      const dayOfWeek = new Date(selectedDate).getDay();
      
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          *,
          magistrate:magistrates(name),
          prosecutor:prosecutors(name),
          defender:defenders(name)
        `)
        .eq('region_id', selectedRegion)
        .eq('date', selectedDate);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedRegion && !!selectedDate,
  });

  // Fetch existing audiences for the selected date and region
  const { data: existingAudiences = [] } = useQuery({
    queryKey: ['audiences', selectedRegion, selectedDate],
    queryFn: async () => {
      if (!selectedRegion || !selectedDate) return [];
      const { data, error } = await supabase
        .from('audiences')
        .select('*')
        .eq('region_id', selectedRegion)
        .eq('scheduled_date', selectedDate);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedRegion && !!selectedDate,
  });

  // Generate available time slots
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 18;
    const slotDuration = 60; // 1 hour

    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      
      // Check if this time slot conflicts with existing audiences for the selected prison unit
      const hasConflict = existingAudiences.some(audience => {
        const audienceTime = audience.scheduled_time.substring(0, 5);
        return audienceTime === time && audience.prison_unit_id === formData.prison_unit_id;
      });

      const conflictingAudience = existingAudiences.find(audience => {
        const audienceTime = audience.scheduled_time.substring(0, 5);
        return audienceTime === time && audience.prison_unit_id === formData.prison_unit_id;
      });

      slots.push({
        time,
        available: !hasConflict,
        conflictingUnit: conflictingAudience ? 'Horário ocupado' : undefined,
      });
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Create audience mutation
  const createAudienceMutation = useMutation({
    mutationFn: async (audienceData: any) => {
      const { data, error } = await supabase
        .from('audiences')
        .insert([audienceData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] });
      toast({
        title: "Sucesso",
        description: "Audiência agendada com sucesso!",
      });
      // Reset form
      setFormData({
        region_id: "",
        prison_unit_id: "",
        scheduled_date: "",
        scheduled_time: "",
        defendant_name: "",
        defendant_document: "",
        process_number: "",
        virtual_room_url: "",
        observations: "",
      });
      setSelectedRegion("");
      setSelectedDate("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao agendar audiência: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignments.length) {
      toast({
        title: "Erro",
        description: "Não há plantonistas definidos para esta região nesta data.",
        variant: "destructive",
      });
      return;
    }

    const assignment = assignments[0]; // Use first assignment for now
    
    const audienceData = {
      ...formData,
      region_id: selectedRegion,
      scheduled_date: selectedDate,
      magistrate_id: assignment.magistrate_id,
      prosecutor_id: assignment.prosecutor_id,
      defender_id: assignment.defender_id,
      status: 'agendada',
    };

    createAudienceMutation.mutate(audienceData);
  };

  const handleInputChange = (field: keyof ScheduleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agendamento de Audiências</h1>
        <p className="text-gray-600">Agende audiências de custódia por região e horários disponíveis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seleção de Região e Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>Seleção de Região e Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="region">Central/Região</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
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
              <Label htmlFor="date">Data da Audiência</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {assignments.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Plantonistas do Dia</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Magistrado:</span> {assignments[0]?.magistrate?.name || 'Não definido'}</p>
                  <p><span className="font-medium">Promotor:</span> {assignments[0]?.prosecutor?.name || 'Não definido'}</p>
                  <p><span className="font-medium">Defensor:</span> {assignments[0]?.defender?.name || 'Não definido'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Horários Disponíveis */}
        {selectedRegion && selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span>Horários Disponíveis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={formData.scheduled_time === slot.time ? "default" : "outline"}
                    disabled={!slot.available}
                    onClick={() => handleInputChange('scheduled_time', slot.time)}
                    className="justify-start"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {slot.time}
                    {!slot.available && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Ocupado
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Formulário de Agendamento */}
      {selectedRegion && selectedDate && formData.scheduled_time && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Dados da Audiência</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prison_unit">Unidade Prisional</Label>
                  <Select value={formData.prison_unit_id} onValueChange={(value) => handleInputChange('prison_unit_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {prisonUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="defendant_name">Nome do Réu</Label>
                  <Input
                    id="defendant_name"
                    value={formData.defendant_name}
                    onChange={(e) => handleInputChange('defendant_name', e.target.value)}
                    placeholder="Nome completo do réu"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="defendant_document">Documento do Réu</Label>
                  <Input
                    id="defendant_document"
                    value={formData.defendant_document}
                    onChange={(e) => handleInputChange('defendant_document', e.target.value)}
                    placeholder="CPF ou RG"
                  />
                </div>

                <div>
                  <Label htmlFor="process_number">Número do Processo</Label>
                  <Input
                    id="process_number"
                    value={formData.process_number}
                    onChange={(e) => handleInputChange('process_number', e.target.value)}
                    placeholder="0000000-00.0000.0.00.0000"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="virtual_room_url">Link da Sala Virtual</Label>
                  <Input
                    id="virtual_room_url"
                    type="url"
                    value={formData.virtual_room_url}
                    onChange={(e) => handleInputChange('virtual_room_url', e.target.value)}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => handleInputChange('observations', e.target.value)}
                    placeholder="Observações adicionais sobre a audiência"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setFormData({
                    region_id: "",
                    prison_unit_id: "",
                    scheduled_date: "",
                    scheduled_time: "",
                    defendant_name: "",
                    defendant_document: "",
                    process_number: "",
                    virtual_room_url: "",
                    observations: "",
                  });
                }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAudienceMutation.isPending}>
                  {createAudienceMutation.isPending ? "Agendando..." : "Agendar Audiência"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgendamentoJuiz;
