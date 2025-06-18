
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const unidadeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  region_id: z.string().min(1, "Região é obrigatória"),
  address: z.string().optional(),
  phone: z.string().optional(),
  capacity: z.number().min(1, "Capacidade deve ser maior que 0").optional(),
});

type UnidadeFormData = z.infer<typeof unidadeSchema>;

interface UnidadeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UnidadeFormData) => void;
  initialData?: any;
  mode: 'create' | 'edit';
}

const UnidadeForm = ({ isOpen, onClose, onSave, initialData, mode }: UnidadeFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch regions for the dropdown
  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      console.log('Fetching regions for UnidadeForm...');
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching regions:', error);
        throw error;
      }
      
      console.log('Regions fetched for UnidadeForm:', data);
      return data || [];
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UnidadeFormData>({
    resolver: zodResolver(unidadeSchema),
    defaultValues: {
      name: "",
      region_id: "",
      address: "",
      phone: "",
      capacity: undefined,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Setting initial data:', initialData);
      reset({
        name: initialData.name || "",
        region_id: initialData.region_id || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
        capacity: initialData.capacity || undefined,
      });
    } else {
      reset({
        name: "",
        region_id: "",
        address: "",
        phone: "",
        capacity: undefined,
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: UnidadeFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting form data:', data);
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro",
        description: `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} unidade`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Unidade Prisional' : 'Editar Unidade Prisional'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Unidade *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Centro de Detenção Provisória..."
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region_id">Região *</Label>
              <Select value={watch("region_id")} onValueChange={(value) => setValue("region_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a região" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region_id && (
                <p className="text-sm text-red-500">{errors.region_id.message}</p>
              )}
              {regions.length === 0 && (
                <p className="text-sm text-amber-600">
                  Nenhuma região encontrada. Cadastre regiões primeiro na página de Configurações.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="(62) 3201-4444"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade (vagas)</Label>
              <Input
                id="capacity"
                type="number"
                {...register("capacity", { valueAsNumber: true })}
                placeholder="850"
              />
              {errors.capacity && (
                <p className="text-sm text-red-500">{errors.capacity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="Av. Presidente Vargas, 1000 - Aparecida de Goiânia/GO"
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : mode === 'create' ? 'Criar Unidade' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UnidadeForm;
