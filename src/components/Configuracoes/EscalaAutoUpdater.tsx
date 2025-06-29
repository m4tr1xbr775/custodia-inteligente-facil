import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Calendar, Copy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatLocalDate, parseLocalDate, getTodayLocalString } from "@/lib/dateUtils";

const EscalaAutoUpdater = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [updateType, setUpdateType] = useState("todas");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateEscalasMutation = useMutation({
    mutationFn: async ({ startDate, endDate, updateType }: { startDate: string; endDate: string; updateType: string }) => {
      console.log("Atualizando escalas com novos períodos:", { startDate, endDate, updateType });
      
      // Validar e converter datas usando funções seguras
      const startDateFormatted = formatLocalDate(parseLocalDate(startDate));
      const endDateFormatted = formatLocalDate(parseLocalDate(endDate));
      
      console.log("Datas formatadas para update:", { startDateFormatted, endDateFormatted });
      
      // Construir query baseada no tipo de atualização
      let query = supabase
        .from('schedules')
        .select('*')
        .eq('status', 'ativa');
      
      // Filtrar por tipo se não for "todas" - usando 'title' ao invés de 'name'
      if (updateType === 'macrorregiao') {
        query = query.like('title', '%Macrorregião%');
      } else if (updateType === 'central') {
        query = query.like('title', '%Central%');
      }
      
      const { data: activeSchedules, error: schedulesError } = await query;
      
      if (schedulesError) throw schedulesError;
      
      if (!activeSchedules || activeSchedules.length === 0) {
        const typeLabel = updateType === 'macrorregiao' ? 'de Macrorregiões' : 
                         updateType === 'central' ? 'de Central de Custódia' : '';
        throw new Error(`Nenhuma escala ativa ${typeLabel} encontrada para atualizar`);
      }
      
      // Atualizar cada escala com as novas datas
      const updatePromises = activeSchedules.map(async (schedule) => {
        const { error } = await supabase
          .from('schedules')
          .update({
            start_date: startDateFormatted,
            end_date: endDateFormatted,
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.id);
        
        if (error) throw error;
        return schedule;
      });
      
      const updatedSchedules = await Promise.all(updatePromises);
      
      return {
        totalUpdated: updatedSchedules.length,
        schedules: updatedSchedules,
        updateType
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      const typeLabel = data.updateType === 'macrorregiao' ? ' de Macrorregiões' : 
                       data.updateType === 'central' ? ' de Central de Custódia' : '';
      toast({
        title: "Sucesso!",
        description: `${data.totalUpdated} escalas${typeLabel} foram atualizadas com os novos períodos`,
      });
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar escalas:", error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar escalas: ${error.message}`,
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
    
    // Validar datas usando parseLocalDate
    const startDateObj = parseLocalDate(startDate);
    const endDateObj = parseLocalDate(endDate);
    
    if (startDateObj > endDateObj) {
      toast({
        title: "Erro",
        description: "A data de início deve ser anterior à data de fim",
        variant: "destructive",
      });
      return;
    }

    updateEscalasMutation.mutate({ startDate, endDate, updateType });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Copy className="h-5 w-5" />
          Atualização Automática de Escalas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            <p>Esta função irá atualizar automaticamente as escalas ativas com os novos períodos definidos.</p>
          </div>
          
          <div>
            <Label htmlFor="updateType">Tipo de Escalas para Atualizar</Label>
            <Select value={updateType} onValueChange={setUpdateType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de escalas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Escalas</SelectItem>
                <SelectItem value="macrorregiao">Apenas Macrorregiões</SelectItem>
                <SelectItem value="central">Apenas Central de Custódia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="updateStartDate">Nova Data Início</Label>
              <Input
                id="updateStartDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  console.log("EscalaAutoUpdater - Data início selecionada:", e.target.value);
                  setStartDate(e.target.value);
                }}
                min={getTodayLocalString()}
                required
              />
            </div>
            <div>
              <Label htmlFor="updateEndDate">Nova Data Fim</Label>
              <Input
                id="updateEndDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  console.log("EscalaAutoUpdater - Data fim selecionada:", e.target.value);
                  setEndDate(e.target.value);
                }}
                min={startDate || getTodayLocalString()}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={updateEscalasMutation.isPending}
          >
            {updateEscalasMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Atualizando Escalas...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Atualizar Escalas Selecionadas
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EscalaAutoUpdater;
