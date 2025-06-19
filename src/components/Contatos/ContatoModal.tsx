
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ContatoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingContactId?: string;
}

interface ContatoForm {
  name: string;
  position: string;
  department: string;
  phone: string;
  mobile: string;
  email: string;
}

const positions = [
  "Juiz",
  "Promotor", 
  "Defensor Público",
  "Assistente de Juiz",
  "Analista",
  "Gestor",
  "Administrador"
];

const ContatoModal = ({ isOpen, onClose, editingContactId }: ContatoModalProps) => {
  const [formData, setFormData] = useState<ContatoForm>({
    name: "",
    position: "",
    department: "",
    phone: "",
    mobile: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contact data when editing
  useEffect(() => {
    if (editingContactId) {
      const fetchContact = async () => {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', editingContactId)
          .single();

        if (error) {
          console.error('Erro ao buscar contato:', error);
          toast({
            title: "Erro ao carregar contato",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setFormData({
            name: data.name || "",
            position: data.position || "",
            department: data.department || "",
            phone: data.phone || "",
            mobile: data.mobile || "",
            email: data.email || "",
          });
        }
      };

      fetchContact();
    } else {
      // Reset form for new contact
      setFormData({
        name: "",
        position: "",
        department: "",
        phone: "",
        mobile: "",
        email: "",
      });
    }
  }, [editingContactId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingContactId) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update({
            name: formData.name,
            position: formData.position,
            department: formData.department,
            phone: formData.phone,
            mobile: formData.mobile,
            email: formData.email,
          })
          .eq('id', editingContactId);

        if (error) throw error;

        toast({
          title: "Contato atualizado",
          description: "As informações do contato foram atualizadas com sucesso.",
        });
      } else {
        // Create new contact
        const { error } = await supabase
          .from('contacts')
          .insert({
            name: formData.name,
            position: formData.position,
            department: formData.department,
            phone: formData.phone,
            mobile: formData.mobile,
            email: formData.email,
          });

        if (error) throw error;

        toast({
          title: "Contato criado",
          description: "O novo contato foi adicionado com sucesso.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar contato:', error);
      toast({
        title: "Erro ao salvar contato",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContatoForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingContactId ? "Editar Contato" : "Novo Contato"}
          </DialogTitle>
          <DialogDescription>
            {editingContactId 
              ? "Edite as informações do contato abaixo." 
              : "Preencha as informações do novo contato."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Select
              value={formData.position}
              onValueChange={(value) => handleInputChange('position', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Comarca de Origem</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Celular</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : (editingContactId ? "Atualizar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContatoModal;
