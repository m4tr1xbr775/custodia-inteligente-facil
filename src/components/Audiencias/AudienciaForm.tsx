
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const audienciaSchema = z.object({
  defendant_name: z.string().min(1, "Nome do réu é obrigatório"),
  defendant_document: z.string().optional(),
  process_number: z.string().min(1, "Número do processo é obrigatório"),
  scheduled_date: z.date({
    required_error: "Data é obrigatória",
  }),
  scheduled_time: z.string().min(1, "Horário é obrigatório"),
  region_id: z.string().min(1, "Central/Região é obrigatória"),
  prison_unit_id: z.string().min(1, "Unidade prisional é obrigatória"),
  virtual_room_url: z.string().url().optional().or(z.literal("")),
  observations: z.string().optional(),
});

type AudienciaFormData = z.infer<typeof audienciaSchema>;

interface AudienciaFormProps {
  isOpen: boolean;
  onClose: () => void;
  audienciaId?: string;
}

const AudienciaForm = ({ isOpen, onClose, audienciaId }: AudienciaFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AudienciaFormData>({
    resolver: zodResolver(audienciaSchema),
  });

  const watchedRegionId = watch("region_id");
  const watchedPrisonUnitId = watch("prison_unit_id");

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

  // Fetch all prison units (not filtered by region since they serve the entire state)
  const { data: prisonUnits = [] } = useQuery({
    queryKey: ['prison_units_extended'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prison_units_extended')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch available slots for selected unit and date
  const { data: availableSlots = [] } = useQuery({
    queryKey: ['prison_unit_slots', selectedUnitId, selectedDate],
    queryFn: async () => {
      if (!selectedUnitId || !selectedDate) return [];
      
      const { data, error } = await supabase
        .from('prison_unit_slots')
        .select('*')
        .eq('prison_unit_id', selectedUnitId)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'))
        .eq('is_available', true)
        .order('time');
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedUnitId && !!selectedDate,
  });

  // Fetch existing audiencia data for editing
  const { data: audienciaData } = useQuery({
    queryKey: ['audiencia', audienciaId],
    queryFn: async () => {
      if (!audienciaId) return null;
      
      const { data, error } = await supabase
        .from('audiences')
        .select('*')
        .eq('id', audienciaId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!audienciaId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: AudienciaFormData) => {
      const { error } = await supabase
        .from('audiences')
        .insert([{
          defendant_name: data.defendant_name,
          defendant_document: data.defendant_document || null,
          process_number: data.process_number,
          scheduled_date: format(data.scheduled_date, 'yyyy-MM-dd'),
          scheduled_time: data.scheduled_time,
          region_id: data.region_id,
          prison_unit_id: data.prison_unit_id,
          virtual_room_url: data.virtual_room_url || null,
          observations: data.observations || null,
          status: 'agendada',
        }]);
      
      if (error) throw error;
      
      // Mark the slot as unavailable
      await supabase
        .from('prison_unit_slots')
        .update({ is_available: false })
        .eq('prison_unit_id', data.prison_unit_id)
        .eq('date', format(data.scheduled_date, 'yyyy-MM-dd'))
        .eq('time', data.scheduled_time);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] });
      queryClient.invalidateQueries({ queryKey: ['prison_unit_slots'] });
      toast({
        title: "Sucesso",
        description: "Audiência criada com sucesso!",
      });
      handleClose();
    },
    onError: (error) => {
      console.error('Error creating audiencia:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar audiência",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: AudienciaFormData) => {
      if (!audienciaId) throw new Error("ID da audiência não fornecido");
      
      const { error } = await supabase
        .from('audiences')
        .update({
          defendant_name: data.defendant_name,
          defendant_document: data.defendant_document || null,
          process_number: data.process_number,
          scheduled_date: format(data.scheduled_date, 'yyyy-MM-dd'),
          scheduled_time: data.scheduled_time,
          region_id: data.region_id,
          prison_unit_id: data.prison_unit_id,
          virtual_room_url: data.virtual_room_url || null,
          observations: data.observations || null,
        })
        .eq('id', audienciaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audiences'] });
      queryClient.invalidateQueries({ queryKey: ['prison_unit_slots'] });
      toast({
        title: "Sucesso",
        description: "Audiência atualizada com sucesso!",
      });
      handleClose();
    },
    onError: (error) => {
      console.error('Error updating audiencia:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar audiência",
        variant: "destructive",
      });
    },
  });

  // Load existing data when editing
  useEffect(() => {
    if (audienciaData) {
      setValue("defendant_name", audienciaData.defendant_name);
      setValue("defendant_document", audienciaData.defendant_document || "");
      setValue("process_number", audienciaData.process_number);
      setValue("region_id", audienciaData.region_id);
      setValue("prison_unit_id", audienciaData.prison_unit_id);
      setValue("virtual_room_url", audienciaData.virtual_room_url || "");
      setValue("observations", audienciaData.observations || "");
      setValue("scheduled_time", audienciaData.scheduled_time);
      
      const date = new Date(audienciaData.scheduled_date);
      setValue("scheduled_date", date);
      setSelectedDate(date);
      setSelectedUnitId(audienciaData.prison_unit_id);
    }
  }, [audienciaData, setValue]);

  // Update selected unit when form value changes
  useEffect(() => {
    if (watchedPrisonUnitId) {
      setSelectedUnitId(watchedPrisonUnitId);
    }
  }, [watchedPrisonUnitId]);

  const handleClose = () => {
    reset();
    setSelectedDate(undefined);
    setSelectedUnitId("");
    onClose();
  };

  const onSubmit = (data: AudienciaFormData) => {
    if (audienciaId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {audienciaId ? "Editar Audiência" : "Nova Audiência de Custódia"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defendant_name">Nome do Réu *</Label>
              <Input
                id="defendant_name"
                {...register("defendant_name")}
                placeholder="Digite o nome completo"
              />
              {errors.defendant_name && (
                <p className="text-sm text-red-500">{errors.defendant_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="defendant_document">CPF/RG</Label>
              <Input
                id="defendant_document"
                {...register("defendant_document")}
                placeholder="Digite o CPF ou RG"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="process_number">Número do Processo *</Label>
            <Input
              id="process_number"
              {...register("process_number")}
              placeholder="Ex: 1234567-89.2024.8.09.0137"
            />
            {errors.process_number && (
              <p className="text-sm text-red-500">{errors.process_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Central/Região *</Label>
            <Select
              value={watchedRegionId || ""}
              onValueChange={(value) => setValue("region_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a central ou região" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name} ({region.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.region_id && (
              <p className="text-sm text-red-500">{errors.region_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Unidade Prisional *</Label>
            <Select
              value={watchedPrisonUnitId || ""}
              onValueChange={(value) => setValue("prison_unit_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade prisional" />
              </SelectTrigger>
              <SelectContent>
                {prisonUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.short_name} - {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.prison_unit_id && (
              <p className="text-sm text-red-500">{errors.prison_unit_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data da Audiência *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        setValue("scheduled_date", date);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.scheduled_date && (
                <p className="text-sm text-red-500">{errors.scheduled_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Horário da Audiência *</Label>
              <Select
                value={watch("scheduled_time") || ""}
                onValueChange={(value) => setValue("scheduled_time", value)}
                disabled={!selectedUnitId || !selectedDate}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedUnitId || !selectedDate 
                      ? "Selecione unidade e data primeiro" 
                      : "Selecione o horário"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.length === 0 && selectedUnitId && selectedDate ? (
                    <SelectItem value="no-slots" disabled>
                      Nenhum horário disponível
                    </SelectItem>
                  ) : (
                    availableSlots.map((slot) => (
                      <SelectItem key={`${slot.date}-${slot.time}`} value={slot.time}>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {slot.time}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.scheduled_time && (
                <p className="text-sm text-red-500">{errors.scheduled_time.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="virtual_room_url">URL da Sala Virtual</Label>
            <Input
              id="virtual_room_url"
              {...register("virtual_room_url")}
              placeholder="https://meet.google.com/..."
              type="url"
            />
            {errors.virtual_room_url && (
              <p className="text-sm text-red-500">{errors.virtual_room_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              {...register("observations")}
              placeholder="Observações adicionais sobre a audiência"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending 
                ? "Salvando..." 
                : audienciaId 
                  ? "Atualizar" 
                  : "Criar Audiência"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AudienciaForm;
