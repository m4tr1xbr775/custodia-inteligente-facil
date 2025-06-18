
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, CheckCircle } from "lucide-react";

const SlotInitializer = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSlotsForPeriod = async (days: number = 90) => {
    setIsGenerating(true);
    try {
      console.log(`Iniciando geração de slots para ${days} dias...`);
      
      // Chamar a função SQL que gera slots para múltiplos dias
      const { data, error } = await supabase.rpc('generate_future_slots', {
        days_ahead: days
      });

      if (error) {
        console.error('Erro ao gerar slots:', error);
        throw error;
      }

      console.log('Slots gerados com sucesso:', data);
      
      setLastGenerated(new Date().toISOString());
      toast({
        title: "Sucesso",
        description: `Slots gerados para os próximos ${days} dias!`,
      });
    } catch (error: any) {
      console.error('Erro na geração de slots:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar slots",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const checkExistingSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('prison_unit_slots')
        .select('date')
        .order('date', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setLastGenerated(data[0].date);
      }
    } catch (error) {
      console.error('Erro ao verificar slots existentes:', error);
    }
  };

  React.useEffect(() => {
    checkExistingSlots();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Inicialização de Slots
        </CardTitle>
        <CardDescription>
          Gere slots de horários em massa para facilitar o agendamento de audiências
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastGenerated && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Último slot gerado: {new Date(lastGenerated).toLocaleDateString('pt-BR')}
          </div>
        )}
        
        <div className="space-y-2">
          <Button
            onClick={() => generateSlotsForPeriod(30)}
            disabled={isGenerating}
            variant="outline"
            className="w-full"
          >
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...</>
            ) : (
              'Gerar para 30 dias'
            )}
          </Button>
          
          <Button
            onClick={() => generateSlotsForPeriod(90)}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...</>
            ) : (
              'Gerar para 90 dias'
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500">
          Esta operação criará slots de 09:00 às 18:00 (intervalos de 15min) para todas as unidades prisionais.
        </p>
      </CardContent>
    </Card>
  );
};

export default SlotInitializer;
