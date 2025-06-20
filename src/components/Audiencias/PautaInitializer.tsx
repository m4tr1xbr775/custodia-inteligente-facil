
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

const PautaInitializer = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [interval, setInterval] = useState("15");
  const { toast } = useToast();

  const generatePautasMutation = useMutation({
    mutationFn: async ({ startDate, endDate, startTime, endTime, interval }: {
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      interval: string;
    }) => {
      console.log("Gerando pautas com parâmetros:", { startDate, endDate, startTime, endTime, interval });
      
      // Buscar todas as unidades prisionais
      const { data: units, error: unitsError } = await supabase
        .from('prison_units_extended')
        .select('id');
      
      if (unitsError) throw unitsError;
      
      // Calcular número de dias
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // Calcular quantas pautas por dia
      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
      const totalMinutes = endMinutes - startMinutes;
      const pautasPerDay = Math.floor(totalMinutes / parseInt(interval));
      
      // Gerar pautas para cada unidade e cada dia
      const pautasToInsert = [];
      
      for (let day = 0; day < diffDays; day++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + day);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        for (const unit of units) {
          for (let i = 0; i < pautasPerDay; i++) {
            const pautaMinutes = startMinutes + (i * parseInt(interval));
            const hours = Math.floor(pautaMinutes / 60);
            const minutes = pautaMinutes % 60;
            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
            
            pautasToInsert.push({
              prison_unit_id: unit.id,
              date: dateStr,
              time: timeStr,
              is_available: true
            });
          }
        }
      }
      
      console.log(`Inserindo ${pautasToInsert.length} pautas...`);
      
      // Inserir pautas em lotes
      const batchSize = 1000;
      for (let i = 0; i < pautasToInsert.length; i += batchSize) {
        const batch = pautasToInsert.slice(i, i + batchSize);
        const { error } = await supabase
          .from('prison_unit_slots')
          .upsert(batch, {
            onConflict: 'prison_unit_id,date,time',
            ignoreDuplicates: true
          });
        
        if (error) throw error;
      }
      
      return {
        totalPautas: pautasToInsert.length,
        unidades: units.length,
        dias: diffDays,
        pautasPorDia: pautasPerDay
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        description: `${data.totalPautas} pautas criadas para ${data.unidades} unidades durante ${data.dias} dias (${data.pautasPorDia} pautas por dia)`,
      });
    },
    onError: (error: any) => {
      console.error("Erro ao gerar pautas:", error);
      toast({
        title: "Erro",
        description: `Erro ao gerar pautas: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast({
        title: "Erro",
        description: "Por favor, preencha as datas de início e fim",
        variant: "destructive",
      });
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "Erro",
        description: "A data de início deve ser anterior à data de fim",
        variant: "destructive",
      });
      return;
    }
    
    if (startTime >= endTime) {
      toast({
        title: "Erro",
        description: "O horário de início deve ser anterior ao horário de fim",
        variant: "destructive",
      });
      return;
    }

    generatePautasMutation.mutate({ startDate, endDate, startTime, endTime, interval });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Gerar Pautas Automaticamente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Horário Início</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">Horário Fim</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="interval">Intervalo das Pautas</Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={generatePautasMutation.isPending}
          >
            {generatePautasMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Gerando Pautas...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Gerar Pautas
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PautaInitializer;
