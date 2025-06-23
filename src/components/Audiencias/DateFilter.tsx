
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, CalendarDays } from "lucide-react";
import { formatLocalDate, parseLocalDate, getTodayLocalString } from "@/lib/dateUtils";

interface DateFilterProps {
  dateFilter: string;
  onDateFilterChange: (filter: string) => void;
  customStartDate?: Date;
  customEndDate?: Date;
  onCustomStartDateChange: (date: Date | undefined) => void;
  onCustomEndDateChange: (date: Date | undefined) => void;
}

const DateFilter = ({
  dateFilter,
  onDateFilterChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange,
}: DateFilterProps) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Data inicial selecionada:", value);
    
    if (value) {
      const date = parseLocalDate(value);
      console.log("Data inicial parseada:", date);
      onCustomStartDateChange(date);
    } else {
      onCustomStartDateChange(undefined);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Data final selecionada:", value);
    
    if (value) {
      const date = parseLocalDate(value);
      console.log("Data final parseada:", date);
      onCustomEndDateChange(date);
    } else {
      onCustomEndDateChange(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={dateFilter === "futuras" ? "default" : "outline"}
          onClick={() => onDateFilterChange("futuras")}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Futuras
        </Button>
        <Button
          size="sm"
          variant={dateFilter === "ultimos-7" ? "default" : "outline"}
          onClick={() => onDateFilterChange("ultimos-7")}
          className="flex items-center gap-2"
        >
          <CalendarDays className="h-4 w-4" />
          Últimos 7 dias
        </Button>
        <Button
          size="sm"
          variant={dateFilter === "ultimos-30" ? "default" : "outline"}
          onClick={() => onDateFilterChange("ultimos-30")}
          className="flex items-center gap-2"
        >
          <CalendarDays className="h-4 w-4" />
          Últimos 30 dias
        </Button>
        <Button
          size="sm"
          variant={dateFilter === "personalizado" ? "default" : "outline"}
          onClick={() => onDateFilterChange("personalizado")}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Período personalizado
        </Button>
      </div>

      {dateFilter === "personalizado" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50">
          <div>
            <Label htmlFor="customStartDate">Data Inicial</Label>
            <Input
              id="customStartDate"
              type="date"
              value={customStartDate ? formatLocalDate(customStartDate) : ""}
              onChange={handleStartDateChange}
              max={getTodayLocalString()}
            />
          </div>
          <div>
            <Label htmlFor="customEndDate">Data Final</Label>
            <Input
              id="customEndDate"
              type="date"
              value={customEndDate ? formatLocalDate(customEndDate) : ""}
              onChange={handleEndDateChange}
              min={customStartDate ? formatLocalDate(customStartDate) : undefined}
              max={getTodayLocalString()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
