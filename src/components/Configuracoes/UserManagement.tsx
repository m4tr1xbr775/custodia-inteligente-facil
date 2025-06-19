
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useUserMutations } from "@/hooks/useUserMutations";
import UserDialog from "./UserDialog";
import UserTable from "./UserTable";

interface UserManagementProps {
  type: "magistrates" | "prosecutors" | "defenders";
  title: string;
}

interface BaseUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  registration?: string;
  active?: boolean;
  created_at: string;
  updated_at: string;
}

interface Magistrate extends BaseUser {
  judicial_assistant_id?: string;
  virtual_room_url?: string;
}

interface Defender extends BaseUser {
  type?: string;
}

type User = BaseUser | Magistrate | Defender;

const UserManagement = ({ type, title }: UserManagementProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    registration: "",
    type: "",
    judicial_assistant_id: "",
    virtual_room_url: "",
  });
  
  const { toast } = useToast();
  const { createMutation, updateMutation, deleteMutation } = useUserMutations(type, title);

  // Buscar assessores (contatos com perfil "Assessor de Juiz") para magistrados
  const { data: potentialAssessors = [] } = useQuery({
    queryKey: ['potential-assessors'],
    queryFn: async () => {
      if (type !== "magistrates") return [];
      
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name')
        .eq('active', true)
        .eq('profile', 'Assessor de Juiz')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: type === "magistrates",
  });

  // Fetch data from Supabase
  const { data: users = [], isLoading } = useQuery({
    queryKey: [type],
    queryFn: async () => {
      console.log(`Fetching data for ${type}`);
      const { data, error } = await supabase
        .from(type)
        .select('*')
        .order('name');
      
      if (error) {
        console.error(`Error fetching ${type}:`, error);
        throw error;
      }
      
      console.log(`Fetched ${type} data:`, data);
      return data as User[];
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    console.log("Form submitted:", formData);
    
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, userData: formData }, {
        onSuccess: handleCloseDialog,
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: handleCloseDialog,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const magistrate = user as Magistrate;
    setFormData({
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      registration: user.registration || "",
      type: (user as Defender).type || "",
      judicial_assistant_id: magistrate.judicial_assistant_id || "",
      virtual_room_url: magistrate.virtual_room_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      registration: "",
      type: "",
      judicial_assistant_id: "",
      virtual_room_url: "",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewUser = () => {
    setEditingUser(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <UserDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingUser={editingUser}
          title={title}
          initialData={formData}
          type={type}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={handleCloseDialog}
          onNewUser={handleNewUser}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            type={type}
            title={title}
            potentialAssessors={potentialAssessors}
            isDeleting={deleteMutation.isPending}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
