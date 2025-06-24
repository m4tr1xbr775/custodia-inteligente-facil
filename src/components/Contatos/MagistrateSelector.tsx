
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface MagistrateSelectorProps {
  magistrates: Array<{ id: string; name: string }>;
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

const MagistrateSelector = ({ 
  magistrates, 
  value, 
  onValueChange, 
  required = false,
  placeholder = "Selecione um magistrado"
}: MagistrateSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMagistrates = magistrates.filter(magistrate =>
    magistrate.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="magistrate">
        Magistrado {required && "*"}
      </Label>
      
      <Select value={value} onValueChange={onValueChange} required={required}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Buscar magistrado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-full bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 border-0"
            />
          </div>
          {filteredMagistrates.map((magistrate) => (
            <SelectItem key={magistrate.id} value={magistrate.id}>
              {magistrate.name}
            </SelectItem>
          ))}
          {filteredMagistrates.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Nenhum magistrado encontrado
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MagistrateSelector;
