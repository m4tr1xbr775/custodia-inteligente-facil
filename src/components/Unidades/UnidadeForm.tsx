
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const unidadeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  short_name: z.string().min(1, 'Nome curto é obrigatório'),
  type: z.enum(['UPR', 'CPP', 'Presídio Estadual', 'Penitenciária Feminina'], {
    required_error: 'Tipo é obrigatório',
  }),
  comarca: z.string().min(1, 'Comarca é obrigatória'),
  director: z.string().min(1, 'Diretor é obrigatório'),
  responsible: z.string().min(1, 'Responsável é obrigatório'),
  landline: z.string().min(1, 'Telefone fixo é obrigatório'),
  functional: z.string().min(1, 'Telefone funcional é obrigatório'),
  whatsapp: z.string().min(1, 'WhatsApp é obrigatório'),
  email: z.string().email('E-mail inválido'),
  number_of_rooms: z.number().min(1, 'Número de salas deve ser maior que 0'),
  address: z.string().optional(),
  municipalities: z.string().optional(),
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
  const form = useForm<UnidadeFormData>({
    resolver: zodResolver(unidadeSchema),
    defaultValues: {
      name: '',
      short_name: '',
      type: undefined,
      comarca: '',
      director: '',
      responsible: '',
      landline: '',
      functional: '',
      whatsapp: '',
      email: '',
      number_of_rooms: 1,
      address: '',
      municipalities: '',
    },
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      console.log('Setting initial data:', initialData);
      form.reset({
        name: initialData.name || '',
        short_name: initialData.short_name || '',
        type: initialData.type || undefined,
        comarca: initialData.comarca || '',
        director: initialData.director || '',
        responsible: initialData.responsible || '',
        landline: initialData.landline || '',
        functional: initialData.functional || '',
        whatsapp: initialData.whatsapp || '',
        email: initialData.email || '',
        number_of_rooms: initialData.number_of_rooms || 1,
        address: initialData.address || '',
        municipalities: initialData.municipalities || '',
      });
    } else if (mode === 'create') {
      form.reset({
        name: '',
        short_name: '',
        type: undefined,
        comarca: '',
        director: '',
        responsible: '',
        landline: '',
        functional: '',
        whatsapp: '',
        email: '',
        number_of_rooms: 1,
        address: '',
        municipalities: '',
      });
    }
  }, [initialData, mode, form]);

  const handleSubmit = (data: UnidadeFormData) => {
    console.log('Form submission data:', data);
    onSave(data);
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Unidade Prisional' : 'Editar Unidade Prisional'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Centro de Detenção Provisória de São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="short_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Curto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: CDP São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UPR">UPR - Unidade Prisional Regional</SelectItem>
                        <SelectItem value="CPP">CPP - Casa de Prisão Provisória</SelectItem>
                        <SelectItem value="Presídio Estadual">Presídio Estadual</SelectItem>
                        <SelectItem value="Penitenciária Feminina">Penitenciária Feminina</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comarca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comarca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="director"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diretor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do diretor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="landline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone Fixo</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="functional"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone Funcional</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 9876-5432" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="unidade@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number_of_rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Salas para Audiências</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Endereço completo da unidade"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="municipalities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Municípios Atendidos (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Liste os municípios atendidos, separados por vírgula"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {mode === 'create' ? 'Criar Unidade' : 'Atualizar Unidade'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UnidadeForm;
