
import React, { useState } from "react";
import { Calendar, Clock, MapPin, User, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const UnidadesPrisionais = () => {
  const [selectedUnit, setSelectedUnit] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch prison units
  const { data: prisonUnits = [] } = useQuery({
    queryKey: ['prison-units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prison_units')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch audiences for selected unit
  const { data: audiences = [], isLoading } = useQuery({
    queryKey: ['unit-audiences', selectedUnit, filterDate, filterStatus],
    queryFn: async () => {
      if (!selectedUnit) return [];
      
      let query = supabase
        .from('audiences')
        .select(`
          *,
          region:regions(name),
          magistrate:magistrates(name),
          prosecutor:prosecutors(name),
          defender:defenders(name),
          prison_unit:prison_units(name)
        `)
        .eq('prison_unit_id', selectedUnit)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (filterDate) {
        query = query.eq('scheduled_date', filterDate);
      }

      if (filterStatus !== 'all') {
        if (filterStatus === 'confirmed') {
          query = query.eq('unit_confirmed', true);
        } else if (filterStatus === 'pending') {
          query = query.eq('unit_confirmed', false);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedUnit,
  });

  // Confirm audience mutation
  const confirmAudienceMutation = useMutation({
    mutationFn: async ({ audienceId, confirmed }: { audienceId: string; confirmed: boolean }) => {
      const updateData = {
        unit_confirmed: confirmed,
        unit_confirmed_at: confirmed ? new Date().toISOString() : null,
        unit_confirmed_by: confirmed ? 'Sistema' : null, // Em produção, usar o usuário logado
      };

      const { data, error } = await supabase
        .from('audiences')
        .update(updateData)
        .eq('id', audienceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-audiences'] });
      toast({
        title: "Sucesso",
        description: "Status da audiência atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleConfirmation = (audienceId: string, confirmed: boolean) => {
    confirmAudienceMutation.mutate({ audienceId, confirmed });
  };

  const getStatusBadge = (audience: any) => {
    if (audience.unit_confirmed) {
      return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
  };

  const getAudienceStatusBadge = (status: string) => {
    switch (status) {
      case "agendada":
        return <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>;
      case "realizada":
        return <Badge className="bg-green-100 text-green-800">Realizada</Badge>;
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case "nao_compareceu":
        return <Badge className="bg-yellow-100 text-yellow-800">Não Compareceu</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Unidades Prisionais</h1>
        <p className="text-gray-600">
          Visualize e confirme as audiências agendadas para sua unidade prisional
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="unit">Unidade Prisional</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent>
                  {prisonUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">Status de Confirmação</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Audiências */}
      {selectedUnit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span>Audiências Agendadas</span>
              {audiences.length > 0 && (
                <Badge variant="outline" className="ml-auto">
                  {audiences.length} audiência{audiences.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : audiences.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma audiência encontrada
                </h3>
                <p className="text-gray-600">
                  Não há audiências agendadas para os filtros selecionados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Réu</TableHead>
                      <TableHead>Processo</TableHead>
                      <TableHead>Magistrado</TableHead>
                      <TableHead>Central</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Confirmação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audiences.map((audience) => (
                      <TableRow key={audience.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDate(audience.scheduled_date)}</span>
                            <span className="text-sm text-gray-600 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(audience.scheduled_time)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{audience.defendant_name}</span>
                            {audience.defendant_document && (
                              <span className="text-sm text-gray-600">{audience.defendant_document}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{audience.process_number}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span className="text-sm">{audience.magistrate?.name || 'Não definido'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{audience.region?.name}</span>
                        </TableCell>
                        <TableCell>{getAudienceStatusBadge(audience.status)}</TableCell>
                        <TableCell>{getStatusBadge(audience)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {audience.virtual_room_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(audience.virtual_room_url, '_blank')}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            {!audience.unit_confirmed ? (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmation(audience.id, true)}
                                disabled={confirmAudienceMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleConfirmation(audience.id, false)}
                                disabled={confirmAudienceMutation.isPending}
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnidadesPrisionais;
