
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

const DailySchedule = ({ unitId, unitName }: DailyScheduleProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ["unitSchedule", unitId, selectedDate],
    queryFn: async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      // Buscar slots da unidade para a data selecionada com dados completos das audiências
      const { data: slots, error: slotsError } = await supabase
        .from("prison_unit_slots")
        .select(`
          *,
          audiences (
            id,
            defendant_name,
            process_number,
            status,
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
          )
        `)
        .eq("prison_unit_id", unitId)
        .eq("date", dateStr)
        .order("time");

      if (slotsError) throw slotsError;

      return slots || [];
    },
  });

  const getSlotStatus = (slot: any) => {
    if (slot.audience_id) {
      return {
        status: "ocupado",
        label: "Ocupado",
        variant: "destructive" as const,
        audience: slot.audiences,
      };
    }
    if (slot.is_available) {
      return {
        status: "disponivel",
        label: "Disponível",
        variant: "default" as const,
      };
    }
    return {
      status: "indisponivel",
      label: "Indisponível",
      variant: "secondary" as const,
    };
  };

  const availableSlots = scheduleData?.filter(slot => slot.is_available && !slot.audience_id).length || 0;
  const occupiedSlots = scheduleData?.filter(slot => slot.audience_id).length || 0;
  const totalSlots = scheduleData?.length || 0;

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <Badge variant="outline">Total</Badge>
              <span className="font-semibold">{totalSlots}</span>
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
                const slotInfo = getSlotStatus(slot);
                return (
                  <div
                    key={slot.id}
                    className={cn(
                      "p-3 rounded-lg border text-center space-y-1",
                      slotInfo.status === "ocupado" && "border-red-200 bg-red-50",
                      slotInfo.status === "disponivel" && "border-green-200 bg-green-50",
                      slotInfo.status === "indisponivel" && "border-gray-200 bg-gray-50"
                    )}
                  >
                    <div className="font-medium text-sm">
                      {slot.time.substring(0, 5)}
                    </div>
                    <Badge variant={slotInfo.variant} className="text-xs">
                      {slotInfo.label}
                    </Badge>
                    {slotInfo.audience && (
                      <div className="text-xs text-muted-foreground mt-1 space-y-1">
                        <div className="truncate font-medium" title={slotInfo.audience.defendant_name}>
                          {slotInfo.audience.defendant_name}
                        </div>
                        <div className="truncate text-xs opacity-75" title={slotInfo.audience.process_number}>
                          {slotInfo.audience.process_number}
                        </div>
                        {slotInfo.audience.serventias && (
                          <div className="truncate text-xs opacity-75" title={slotInfo.audience.serventias.name}>
                            {slotInfo.audience.serventias.name}
                          </div>
                        )}
                        {slotInfo.audience.magistrates && (
                          <div className="truncate text-xs opacity-75" title={`Magistrado: ${slotInfo.audience.magistrates.name}`}>
                            {slotInfo.audience.magistrates.name}
                          </div>
                        )}
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
