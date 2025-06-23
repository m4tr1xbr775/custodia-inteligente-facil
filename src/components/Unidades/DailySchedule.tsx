
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface DailyScheduleProps {
  unitId: string;
  unitName: string;
}

interface TimeSlot {
  time: string;
  audiences: any[];
  isAvailable: boolean;
  totalCapacity: number;
}

const DailySchedule = ({ unitId, unitName }: DailyScheduleProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Gerar horários potenciais (09:00 às 17:45, intervalos de 15 minutos)
  const generatePotentialTimes = () => {
    const times = [];
    const startHour = 9; // 09:00
    const endHour = 18; // 18:00 (mas vamos até 17:45)
    const intervalMinutes = 15;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        // Para a última hora (17h), só incluir até 17:45
        if (hour === 17 && minute > 45) break;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        times.push(timeString);
      }
    }
    return times;
  };

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ["unitSchedule", unitId, selectedDate],
    queryFn: async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      console.log("Buscando dados da pauta para:", { unitId, dateStr });

      // 1. Buscar número de salas da unidade
      const { data: unitData, error: unitError } = await supabase
        .from('prison_units_extended')
        .select('number_of_rooms')
        .eq('id', unitId)
        .single();

      if (unitError) {
        console.error("Erro ao buscar dados da unidade:", unitError);
        throw unitError;
      }

      const numberOfRooms = unitData?.number_of_rooms || 1;
      console.log("Número de salas da unidade:", numberOfRooms);

      // 2. Buscar audiências agendadas para a data e unidade com dados completos
      const { data: audiences, error: audiencesError } = await supabase
        .from("audiences")
        .select(`
          *,
          serventias:serventia_id (
            name,
            code
          ),
          magistrates:magistrate_id (
            name
          ),
          prosecutors:prosecutor_id (
            name
          ),
          defenders:defender_id (
            name,
            type
          )
        `)
        .eq("prison_unit_id", unitId)
        .eq("scheduled_date", dateStr)
        .order("scheduled_time");

      if (audiencesError) {
        console.error("Erro ao buscar audiências:", audiencesError);
        throw audiencesError;
      }

      console.log("Audiências encontradas:", audiences);

      // 3. Organizar audiências por horário
      const audiencesByTime: Record<string, any[]> = {};
      audiences?.forEach(audience => {
        const timeKey = audience.scheduled_time;
        if (!audiencesByTime[timeKey]) {
          audiencesByTime[timeKey] = [];
        }
        audiencesByTime[timeKey].push(audience);
      });

      // 4. Gerar estrutura de slots com base nos horários potenciais
      const potentialTimes = generatePotentialTimes();
      const slots: TimeSlot[] = potentialTimes.map(time => {
        const timeKey = time;
        const audiencesAtTime = audiencesByTime[timeKey] || [];
        
        return {
          time,
          audiences: audiencesAtTime,
          isAvailable: audiencesAtTime.length < numberOfRooms,
          totalCapacity: numberOfRooms,
        };
      });

      console.log("Slots gerados:", slots);
      return slots;
    },
  });

  const availableSlots = scheduleData?.filter(slot => slot.isAvailable).length || 0;
  const occupiedSlots = scheduleData?.filter(slot => !slot.isAvailable).length || 0;
  const totalSlots = scheduleData?.length || 0;
  const totalAudiences = scheduleData?.reduce((acc, slot) => acc + slot.audiences.length, 0) || 0;

  const getSlotStatusInfo = (slot: TimeSlot) => {
    if (slot.audiences.length === 0) {
      return {
        status: "disponivel",
        label: "Disponível",
        variant: "default" as const,
        bgClass: "border-green-200 bg-green-50"
      };
    } else if (slot.audiences.length < slot.totalCapacity) {
      return {
        status: "parcial",
        label: `${slot.audiences.length}/${slot.totalCapacity}`,
        variant: "secondary" as const,
        bgClass: "border-yellow-200 bg-yellow-50"
      };
    } else {
      return {
        status: "ocupado",
        label: "Lotado",
        variant: "destructive" as const,
        bgClass: "border-red-200 bg-red-50"
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{unitName}</h3>
          <p className="text-sm text-muted-foreground">
            Pauta para {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
          </p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="default">Disponível</Badge>
              <span className="font-semibold">{availableSlots}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Ocupado</Badge>
              <span className="font-semibold">{occupiedSlots}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Total Slots</Badge>
              <span className="font-semibold">{totalSlots}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Audiências</Badge>
              <span className="font-semibold">{totalAudiences}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : scheduleData && scheduleData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {scheduleData.map((slot) => {
                const slotInfo = getSlotStatusInfo(slot);
                return (
                  <div
                    key={slot.time}
                    className={cn(
                      "p-3 rounded-lg border text-center space-y-1",
                      slotInfo.bgClass
                    )}
                  >
                    <div className="font-medium text-sm">
                      {slot.time.substring(0, 5)}
                    </div>
                    <Badge variant={slotInfo.variant} className="text-xs">
                      {slotInfo.label}
                    </Badge>
                    {slot.audiences.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1 space-y-1">
                        {slot.audiences.map((audience, index) => (
                          <div key={audience.id || index} className="border-t pt-1 first:border-t-0 first:pt-0">
                            <div className="truncate font-medium" title={audience.defendant_name}>
                              {audience.defendant_name}
                            </div>
                            <div className="truncate text-xs opacity-75" title={audience.process_number}>
                              {audience.process_number}
                            </div>
                            {audience.serventias && (
                              <div className="truncate text-xs opacity-75" title={audience.serventias.name}>
                                {audience.serventias.name}
                              </div>
                            )}
                            {audience.magistrates && (
                              <div className="truncate text-xs opacity-75" title={`Magistrado: ${audience.magistrates.name}`}>
                                {audience.magistrates.name}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum horário encontrado para esta data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySchedule;
