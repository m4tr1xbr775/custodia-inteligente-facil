
import { useState } from "react";
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

const unidadeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  short_name: z.string().min(1, "Nome curto é obrigatório"),
  comarca: z.string().min(1, "Comarca é obrigatória"),
  director: z.string().min(1, "Diretor é obrigatório"),
  responsible: z.string().min(1, "Responsável é obrigatório"),
  landline: z.string().min(1, "Telefone é obrigatório"),
  functional: z.string().min(1, "Telefone funcional é obrigatório"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  email: z.string().email("Email inválido"),
  address: z.string().min(1, "Endereço é obrigatório"),
  capacity: z.number().min(1, "Capacidade deve ser maior que 0"),
  current_population: z.number().min(0, "População atual deve ser 0 ou maior"),
  municipalities: z.string().min(1, "Municípios são obrigatórios"),
  type: z.enum(["CDP", "Presídio", "CPP"]),
});

type UnidadeFormData = z.infer<typeof unidadeSchema>;

interface UnidadeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UnidadeFormData) => void;
  initialData?: Partial<UnidadeFormData>;
  mode: 'create' | 'edit';
}

const UnidadeForm = ({ isOpen, onClose, onSave, initialData, mode }: UnidadeFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      name: initialData?.name || "",
      short_name: initialData?.short_name || "",
      comarca: initialData?.comarca || "",
      director: initialData?.director || "",
      responsible: initialData?.responsible || "",
      landline: initialData?.landline || "",
      functional: initialData?.functional || "",
      whatsapp: initialData?.whatsapp || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      capacity: initialData?.capacity || 0,
      current_population: initialData?.current_population || 0,
      municipalities: initialData?.municipalities || "",
      type: initialData?.type || "CDP",
    },
  });

  const onSubmit = async (data: UnidadeFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      toast({
        title: "Sucesso",
        description: `Unidade ${mode === 'create' ? 'criada' : 'atualizada'} com sucesso!`,
      });
      reset();
      onClose();
    } catch (error) {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Unidade Prisional' : 'Editar Unidade Prisional'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
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
              <Label htmlFor="short_name">Nome Curto *</Label>
              <Input
                id="short_name"
                {...register("short_name")}
                placeholder="CDP Aparecida"
              />
              {errors.short_name && (
                <p className="text-sm text-red-500">{errors.short_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={watch("type")} onValueChange={(value) => setValue("type", value as "CDP" | "Presídio" | "CPP")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDP">CDP</SelectItem>
                  <SelectItem value="Presídio">Presídio</SelectItem>
                  <SelectItem value="CPP">CPP</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comarca">Comarca *</Label>
              <Input
                id="comarca"
                {...register("comarca")}
                placeholder="Goiânia"
              />
              {errors.comarca && (
                <p className="text-sm text-red-500">{errors.comarca.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="director">Diretor *</Label>
              <Input
                id="director"
                {...register("director")}
                placeholder="Dr. João Silva"
              />
              {errors.director && (
                <p className="text-sm text-red-500">{errors.director.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável *</Label>
              <Input
                id="responsible"
                {...register("responsible")}
                placeholder="Inspetor José Santos"
              />
              {errors.responsible && (
                <p className="text-sm text-red-500">{errors.responsible.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="landline">Telefone *</Label>
              <Input
                id="landline"
                {...register("landline")}
                placeholder="(62) 3201-4444"
              />
              {errors.landline && (
                <p className="text-sm text-red-500">{errors.landline.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="functional">Telefone Funcional *</Label>
              <Input
                id="functional"
                {...register("functional")}
                placeholder="(62) 3201-4445"
              />
              {errors.functional && (
                <p className="text-sm text-red-500">{errors.functional.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                {...register("whatsapp")}
                placeholder="(62) 99999-4444"
              />
              {errors.whatsapp && (
                <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="unidade@dgap.go.gov.br"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade *</Label>
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
              <Label htmlFor="current_population">População Atual *</Label>
              <Input
                id="current_population"
                type="number"
                {...register("current_population", { valueAsNumber: true })}
                placeholder="720"
              />
              {errors.current_population && (
                <p className="text-sm text-red-500">{errors.current_population.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Av. Presidente Vargas, 1000 - Aparecida de Goiânia/GO"
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipalities">Municípios Atendidos *</Label>
            <Textarea
              id="municipalities"
              {...register("municipalities")}
              placeholder="Aparecida de Goiânia, Senador Canedo, Bela Vista de Goiás"
              rows={3}
            />
            {errors.municipalities && (
              <p className="text-sm text-red-500">{errors.municipalities.message}</p>
            )}
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
