
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  defendant_name: z.string().min(1, "Nome do réu é obrigatório"),
  defendant_document: z.string().optional(),
  process_number: z.string().min(1, "Número do processo é obrigatório"),
  scheduled_date: z.date({
    required_error: "Data da audiência é obrigatória",
  }),
  scheduled_time: z.string().min(1, "Horário é obrigatório"),
  region_id: z.string().min(1, "Central de plantão é obrigatória"),
  prison_unit_id: z.string().min(1, "Unidade prisional é obrigatória"),
  magistrate_id: z.string().optional(),
  prosecutor_id: z.string().optional(),
  defender_id: z.string().optional(),
  police_officer_id: z.string().optional(),
  observations: z.string().optional(),
  virtual_room_url: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AudienciaFormProps {
  onSuccess?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const AudienciaForm = ({ onSuccess, initialData, isEditing = false }: AudienciaFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defendant_name: "",
      defendant_document: "",
      process_number: "",
      scheduled_date: undefined,
      scheduled_time: "",
      region_id: "",
      prison_unit_id: "",
      magistrate_id: "",
      prosecutor_id: "",
      defender_id: "",
      police_officer_id: "",
      observations: "",
      virtual_room_url: "",
      ...initialData,
    },
  });

  // Fetch regions
  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch prison units
  const { data: prisonUnits } = useQuery({
    queryKey: ["prisonUnits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prison_units_extended")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch available time slots based on selected date and unit
  const { data: availableSlots } = useQuery({
    queryKey: ["availableSlots", selectedDate, selectedUnit],
    queryFn: async () => {
      if (!selectedDate || !selectedUnit) return [];
      
      const { data, error } = await supabase
        .from("prison_unit_slots")
        .select("time")
        .eq("prison_unit_id", selectedUnit)
        .eq("date", format(selectedDate, "yyyy-MM-dd"))
        .eq("is_available", true)
        .order("time");
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDate && !!selectedUnit,
  });

  // Fetch magistrates, prosecutors, defenders
  const { data: magistrates } = useQuery({
    queryKey: ["magistrates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("magistrates")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: prosecutors } = useQuery({
    queryKey: ["prosecutors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prosecutors")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: defenders } = useQuery({
    queryKey: ["defenders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("defenders")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Watch for date and unit changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "scheduled_date") {
        setSelectedDate(value.scheduled_date);
        form.setValue("scheduled_time", ""); // Reset time when date changes
      }
      if (name === "prison_unit_id") {
        setSelectedUnit(value.prison_unit_id || "");
        form.setValue("scheduled_time", ""); // Reset time when unit changes
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Generate slots for future dates when a unit is selected
  const generateSlotsForUnit = async (unitId: string) => {
    try {
      await supabase.rpc("generate_daily_slots_for_unit", {
        unit_id: unitId,
        slot_date: format(new Date(), "yyyy-MM-dd"),
      });
      
      // Generate for next 30 days
      for (let i = 1; i <= 30; i++) {
        const futureDate = addDays(new Date(), i);
        await supabase.rpc("generate_daily_slots_for_unit", {
          unit_id: unitId,
          slot_date: format(futureDate, "yyyy-MM-dd"),
        });
      }
    } catch (error) {
      console.error("Erro ao gerar slots:", error);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const audienceData = {
        ...data,
        scheduled_date: format(data.scheduled_date, "yyyy-MM-dd"),
      };

      if (isEditing && initialData?.id) {
        const { error } = await supabase
          .from("audiences")
          .update(audienceData)
          .eq("id", initialData.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Audiência atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from("audiences")
          .insert([audienceData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Audiência agendada com sucesso!",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["audiences"] });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar audiência",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="defendant_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Réu</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do réu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="defendant_document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/RG</FormLabel>
                <FormControl>
                  <Input placeholder="Documento do réu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="process_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Processo</FormLabel>
                <FormControl>
                  <Input placeholder="0000000-00.0000.0.00.0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="region_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Central de Plantão</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a central" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {regions?.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prison_unit_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade Prisional</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    generateSlotsForUnit(value);
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {prisonUnits?.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Audiência</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: pt })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableSlots?.map((slot) => (
                      <SelectItem key={slot.time} value={slot.time}>
                        {slot.time.substring(0, 5)}
                      </SelectItem>
                    ))}
                    {(!availableSlots || availableSlots.length === 0) && selectedDate && selectedUnit && (
                      <SelectItem disabled value="">
                        Nenhum horário disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="magistrate_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Magistrado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o magistrado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {magistrates?.map((magistrate) => (
                      <SelectItem key={magistrate.id} value={magistrate.id}>
                        {magistrate.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prosecutor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promotor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o promotor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {prosecutors?.map((prosecutor) => (
                      <SelectItem key={prosecutor.id} value={prosecutor.id}>
                        {prosecutor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="defender_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Defensor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o defensor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {defenders?.map((defender) => (
                      <SelectItem key={defender.id} value={defender.id}>
                        {defender.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="virtual_room_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Sala Virtual</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações adicionais sobre a audiência..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            {isEditing ? "Atualizar Audiência" : "Agendar Audiência"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AudienciaForm;
