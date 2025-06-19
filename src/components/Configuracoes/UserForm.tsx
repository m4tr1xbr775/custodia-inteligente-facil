
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  registration: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  type: z.string().optional(),
  judicial_assistant_id: z.string().optional(),
  virtual_room_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  type: "magistrates" | "prosecutors" | "defenders";
  initialData?: any;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const UserForm = ({ type, initialData, onSubmit, onCancel, isLoading }: UserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData || {
      name: "",
      registration: "",
      email: "",
      phone: "",
      type: "",
      judicial_assistant_id: "",
      virtual_room_url: "",
    },
  });

  // Buscar assistentes judiciais para o select
  const { data: judicialAssistants } = useQuery({
    queryKey: ['judicial-assistants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('magistrates')
        .select('id, name')
        .not('judicial_assistant_id', 'is', null);
      
      if (error) {
        console.error("Erro ao buscar assistentes judiciais:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: type === 'magistrates'
  });

  const selectedJudicialAssistant = watch("judicial_assistant_id");

  const handleFormSubmit = (data: UserFormData) => {
    // Limpar campos vazios
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    onSubmit(cleanData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome *</Label>
        <Input 
          id="name"
          {...register("name")} 
          placeholder="Nome completo"
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="registration">Matrícula/Registro</Label>
        <Input 
          id="registration"
          {...register("registration")} 
          placeholder="Número de matrícula ou registro"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email"
          type="email"
          {...register("email")} 
          placeholder="email@exemplo.com"
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input 
          id="phone"
          {...register("phone")} 
          placeholder="(62) 99999-9999"
        />
      </div>

      {type === "defenders" && (
        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={watch("type") || ""}
            onValueChange={(value) => setValue("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Defensor Nomeado">Defensor Nomeado</SelectItem>
              <SelectItem value="Defensoria Pública">Defensoria Pública</SelectItem>
              <SelectItem value="Defensor Constituído">Defensor Constituído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {type === "magistrates" && (
        <>
          <div>
            <Label htmlFor="judicial_assistant_id">Assistente Judicial</Label>
            <Select
              value={selectedJudicialAssistant || ""}
              onValueChange={(value) => setValue("judicial_assistant_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um assistente judicial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {judicialAssistants?.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="virtual_room_url">URL da Sala Virtual</Label>
            <Input 
              id="virtual_room_url"
              {...register("virtual_room_url")} 
              placeholder="https://meet.google.com/xxx-xxx-xxx"
            />
            {errors.virtual_room_url && (
              <p className="text-sm text-red-600 mt-1">{errors.virtual_room_url.message}</p>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
