
import React from "react";
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

interface UserFormProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    registration: string;
    type: string;
    judicial_assistant_id: string;
    virtual_room_url: string;
  };
  editingUser: any;
  type: "magistrates" | "prosecutors" | "defenders";
  title: string;
  potentialAssessors: Array<{ id: string; name: string }>;
  isSubmitting: boolean;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const UserForm = ({
  formData,
  editingUser,
  type,
  title,
  potentialAssessors,
  isSubmitting,
  onInputChange,
  onSubmit,
  onCancel,
}: UserFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange("name", e.target.value)}
          placeholder="Digite o nome completo"
          required
        />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange("email", e.target.value)}
          placeholder="email@exemplo.com"
        />
      </div>
      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onInputChange("phone", e.target.value)}
          placeholder="(62) 99999-9999"
        />
      </div>

      {type === "magistrates" ? (
        <>
          <div>
            <Label htmlFor="judicial_assistant_id">Assessor de Juiz</Label>
            <Select value={formData.judicial_assistant_id} onValueChange={(value) => onInputChange("judicial_assistant_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um assessor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {potentialAssessors.map((assessor) => (
                  <SelectItem key={assessor.id} value={assessor.id}>
                    {assessor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="virtual_room_url">Link da Sala Virtual</Label>
            <Input
              id="virtual_room_url"
              value={formData.virtual_room_url}
              onChange={(e) => onInputChange("virtual_room_url", e.target.value)}
              placeholder="https://exemplo.com/sala-virtual"
            />
          </div>
        </>
      ) : (
        <div>
          <Label htmlFor="registration">
            {type === "defenders" ? "OAB" : "Registro/Matrícula"}
          </Label>
          <Input
            id="registration"
            value={formData.registration}
            onChange={(e) => onInputChange("registration", e.target.value)}
            placeholder={type === "defenders" ? "Número da OAB" : "Número do registro"}
          />
        </div>
      )}

      {type === "defenders" && (
        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select value={formData.type} onValueChange={(value) => onInputChange("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dativo">Advogado Dativo</SelectItem>
              <SelectItem value="defensoria_publica">Defensoria Pública</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
