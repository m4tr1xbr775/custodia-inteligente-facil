
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UnitSelectorProps {
  selectedUnit: string;
  onUnitChange: (unitId: string) => void;
}

const UnitSelector = ({ selectedUnit, onUnitChange }: UnitSelectorProps) => {
  // Fetch prison units from the new table
  const { data: prisonUnits } = useQuery({
    queryKey: ['prison_units_extended'],
    queryFn: async () => {
      console.log("Buscando unidades prisionais...");
      const { data, error } = await supabase
        .from('prison_units_extended')
        .select('*')
        .order('name');
      if (error) {
        console.error("Erro ao buscar unidades prisionais:", error);
        throw error;
      }
      console.log("Unidades prisionais encontradas:", data);
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione sua Unidade Prisional</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedUnit} onValueChange={onUnitChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma unidade prisional" />
          </SelectTrigger>
          <SelectContent>
            {prisonUnits?.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default UnitSelector;
