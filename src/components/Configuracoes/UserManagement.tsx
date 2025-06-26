
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

  const handleFormSubmit = (formData: any) => {
    console.log("Form data received:", formData);
    
    // Validate required fields
    if (!formData.name?.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (editingUser) {
      console.log("Updating user:", editingUser.id, formData);
      updateMutation.mutate({ id: editingUser.id, userData: formData }, {
        onSuccess: () => {
          console.log("Update successful");
          handleCloseDialog();
        },
        onError: (error) => {
          console.error("Update error:", error);
        }
      });
    } else {
      console.log("Creating new user:", formData);
      createMutation.mutate(formData, {
        onSuccess: () => {
          console.log("Create successful");
          handleCloseDialog();
        },
        onError: (error) => {
          console.error("Create error:", error);
        }
      });
    }
  };

  const handleEdit = (user: User) => {
    console.log("Editing user:", user);
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
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

  // Preparar dados iniciais baseados no usuário em edição
  const getInitialData = () => {
    if (!editingUser) {
      const baseData = {
        name: "",
        email: "",
        phone: "",
        type: "",
        judicial_assistant_id: "",
        virtual_room_url: "",
      };
      
      // Só incluir registration se for defensor
      if (type === "defenders") {
        return { ...baseData, registration: "" };
      }
      
      return baseData;
    }

    const magistrate = editingUser as Magistrate;
    const defender = editingUser as Defender;
    
    const baseData = {
      name: editingUser.name || "",
      email: editingUser.email || "",
      phone: editingUser.phone || "",
      type: defender.type || "",
      judicial_assistant_id: magistrate.judicial_assistant_id || "",
      virtual_room_url: magistrate.virtual_room_url || "",
    };
    
    // Só incluir registration se for defensor
    if (type === "defenders") {
      return { ...baseData, registration: editingUser.registration || "" };
    }
    
    return baseData;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <UserDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingUser={editingUser}
          title={title}
          initialData={getInitialData()}
          type={type}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleFormSubmit}
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
