
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UserForm from "./UserForm";

interface UserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: any;
  title: string;
  initialData: {
    name: string;
    email: string;
    phone: string;
    registration?: string; // Agora é opcional
    type: string;
    judicial_assistant_id: string;
    virtual_room_url: string;
  };
  type: "magistrates" | "prosecutors" | "defenders";
  isSubmitting: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onNewUser: () => void;
}

const UserDialog = ({
  isOpen,
  onOpenChange,
  editingUser,
  title,
  initialData,
  type,
  isSubmitting,
  onSubmit,
  onCancel,
  onNewUser,
}: UserDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2" onClick={onNewUser}>
          <Plus className="h-4 w-4" />
          <span>Adicionar {title.slice(0, -1)}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? `Editar ${title.slice(0, -1)}` : `Adicionar ${title.slice(0, -1)}`}
          </DialogTitle>
        </DialogHeader>
        <UserForm
          type={type}
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
