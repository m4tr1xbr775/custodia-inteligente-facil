
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MagistrateSelector from '@/components/Contatos/MagistrateSelector';
import { UserCheck, Calendar, Users, RefreshCw } from 'lucide-react';
import { useAssistantLink } from '@/hooks/useAssistantLink';

interface LinkedMagistrate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  virtual_room_url?: string;
}

interface ScheduleAssignment {
  id: string;
  shift: string;
  serventia: {
    name: string;
    code: string;
  };
  schedule: {
    title: string;
    start_date: string;
    end_date: string;
    status: string;
  };
}

interface AssociatedAudience {
  id: string;
  process_number: string;
  defendant_name: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  serventia: {
    name: string;
  };
}

const AssessorDashboard = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { magistrates, loadingMagistrates } = useAssistantLink();
  
  const [linkedMagistrate, setLinkedMagistrate] = useState<LinkedMagistrate | null>(null);
  const [scheduleAssignments, setScheduleAssignments] = useState<ScheduleAssignment[]>([]);
  const [associatedAudiences, setAssociatedAudiences] = useState<AssociatedAudience[]>([]);
  const [showChangeLink, setShowChangeLink] = useState(false);
  const [newMagistrateId, setNewMagistrateId] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLinkedMagistrate = async () => {
    if (!userProfile?.linked_magistrate_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('magistrates')
        .select('*')
        .eq('id', userProfile.linked_magistrate_id)
        .single();

      if (error) throw error;
      setLinkedMagistrate(data);
    } catch (error) {
      console.error('Erro ao buscar magistrado vinculado:', error);
    }
  };

  const fetchScheduleAssignments = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          id,
          shift,
          serventia:serventias (name, code),
          schedule:schedules (title, start_date, end_date, status)
        `)
        .eq('judicial_assistant_id', userProfile.id);

      if (error) throw error;
      setScheduleAssignments(data || []);
    } catch (error) {
      console.error('Erro ao buscar atribuições de agenda:', error);
    }
  };

  const fetchAssociatedAudiences = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('audiences')
        .select(`
          id,
          process_number,
          defendant_name,
          scheduled_date,
          scheduled_time,
          status,
          serventia:serventias (name)
        `)
        .eq('judicial_assistant_id', userProfile.id)
        .order('scheduled_date', { ascending: true })
        .limit(10);

      if (error) throw error;
      setAssociatedAudiences(data || []);
    } catch (error) {
      console.error('Erro ao buscar audiências associadas:', error);
    }
  };

  const handleChangeMagistrateLink = async () => {
    if (!newMagistrateId || !userProfile?.id) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({ linked_magistrate_id: newMagistrateId })
        .eq('id', userProfile.id);

      if (error) throw error;

      // Atualizar o campo judicial_assistant_id na tabela magistrates
      const { error: updateError } = await supabase
        .from('magistrates')
        .update({ judicial_assistant_id: userProfile.id })
        .eq('id', newMagistrateId);

      if (updateError) throw updateError;

      toast({
        title: "Vinculação alterada",
        description: "Sua vinculação com o magistrado foi atualizada com sucesso.",
      });

      setShowChangeLink(false);
      setNewMagistrateId('');
      
      // Recarregar dados
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao alterar vinculação:', error);
      toast({
        title: "Erro ao alterar vinculação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLinkedMagistrate(),
        fetchScheduleAssignments(),
        fetchAssociatedAudiences()
      ]);
      setLoading(false);
    };

    if (userProfile) {
      loadData();
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard do Assessor</h1>
        <Badge variant="outline" className="text-sm">
          <UserCheck className="h-4 w-4 mr-1" />
          Assessor de Juiz
        </Badge>
      </div>

      {/* Informações do Juiz Vinculado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Magistrado Vinculado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {linkedMagistrate ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-semibold">{linkedMagistrate.name}</p>
                </div>
                {linkedMagistrate.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{linkedMagistrate.email}</p>
                  </div>
                )}
                {linkedMagistrate.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-semibold">{linkedMagistrate.phone}</p>
                  </div>
                )}
                {linkedMagistrate.virtual_room_url && (
                  <div>
                    <p className="text-sm text-gray-600">Sala Virtual</p>
                    <a 
                      href={linkedMagistrate.virtual_room_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Acessar Sala
                    </a>
                  </div>
                )}
              </div>
              
              {!showChangeLink ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowChangeLink(true)}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Alterar Vinculação
                </Button>
              ) : (
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Selecionar novo magistrado:</p>
                    <MagistrateSelector
                      magistrates={magistrates}
                      value={newMagistrateId}
                      onValueChange={setNewMagistrateId}
                      placeholder="Selecione um magistrado"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleChangeMagistrateLink}
                      disabled={!newMagistrateId || loadingMagistrates}
                    >
                      Confirmar Alteração
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowChangeLink(false);
                        setNewMagistrateId('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Você não está vinculado a nenhum magistrado.</p>
              <Button variant="outline">
                Solicitar Vinculação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Atribuições de Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Atribuições de Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduleAssignments.length > 0 ? (
            <div className="space-y-4">
              {scheduleAssignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{assignment.schedule.title}</h4>
                    <Badge variant={assignment.schedule.status === 'ativo' ? 'default' : 'secondary'}>
                      {assignment.schedule.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Serventia:</span> {assignment.serventia.name}
                    </div>
                    <div>
                      <span className="font-medium">Turno:</span> {assignment.shift}
                    </div>
                    <div>
                      <span className="font-medium">Período:</span> {new Date(assignment.schedule.start_date).toLocaleDateString()} - {new Date(assignment.schedule.end_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">Nenhuma atribuição de agendamento encontrada.</p>
          )}
        </CardContent>
      </Card>

      {/* Audiências Vinculadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Audiências Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {associatedAudiences.length > 0 ? (
            <div className="space-y-4">
              {associatedAudiences.map((audience) => (
                <div key={audience.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Processo: {audience.process_number}</h4>
                    <Badge variant={
                      audience.status === 'realizada' ? 'default' : 
                      audience.status === 'agendada' ? 'secondary' : 'destructive'
                    }>
                      {audience.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Réu:</span> {audience.defendant_name}
                    </div>
                    <div>
                      <span className="font-medium">Data:</span> {new Date(audience.scheduled_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Horário:</span> {audience.scheduled_time}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Serventia:</span> {audience.serventia.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">Nenhuma audiência vinculada encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessorDashboard;
