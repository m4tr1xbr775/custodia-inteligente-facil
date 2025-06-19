
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Edit, Trash2, Phone, Mail } from "lucide-react";

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

interface UserTableProps {
  users: User[];
  type: "magistrates" | "prosecutors" | "defenders";
  title: string;
  potentialAssessors: Array<{ id: string; name: string }>;
  isDeleting: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

const UserTable = ({
  users,
  type,
  title,
  potentialAssessors,
  isDeleting,
  onEdit,
  onDelete,
}: UserTableProps) => {
  const getAssessorName = (judicial_assistant_id: string) => {
    const assessor = potentialAssessors.find(a => a.id === judicial_assistant_id);
    return assessor ? assessor.name : "-";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Contato</TableHead>
          {type === "magistrates" ? (
            <TableHead>Assessor</TableHead>
          ) : (
            <TableHead>{type === "defenders" ? "OAB" : "Registro"}</TableHead>
          )}
          {type === "defenders" && <TableHead>Tipo</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={type === "defenders" ? 6 : 5} className="text-center text-gray-500">
              Nenhum registro encontrado
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => {
            const magistrate = user as Magistrate;
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {user.email && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                {type === "magistrates" ? (
                  <TableCell>{getAssessorName(magistrate.judicial_assistant_id || "")}</TableCell>
                ) : (
                  <TableCell>{user.registration || "-"}</TableCell>
                )}
                {type === "defenders" && (
                  <TableCell>
                    {(user as Defender).type === "defensoria_publica" ? "Defensoria Pública" : 
                     (user as Defender).type === "dativo" ? "Advogado Dativo" : "-"}
                  </TableCell>
                )}
                <TableCell>
                  <Badge className={user.active !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {user.active !== false ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onDelete(user.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;
