
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminSetup = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  
  const [adminData, setAdminData] = useState({
    email: 'm4tr1xbr@gmail.com',
    password: 'Admin123!',
    confirmPassword: 'Admin123!'
  });

  const createAdminUser = async () => {
    setIsCreating(true);
    
    try {
      // Primeiro, tentar fazer login para ver se já existe
      const { error: loginError } = await signIn(adminData.email, adminData.password);
      
      if (!loginError) {
        toast({
          title: "Administrador já existe!",
          description: "Fazendo login automaticamente...",
        });
        navigate('/');
        return;
      }

      // Se não conseguiu fazer login, criar o usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Atualizar o registro na tabela contacts com o user_id
        const { error: updateError } = await supabase
          .from('contacts')
          .update({ user_id: authData.user.id })
          .eq('email', adminData.email);

        if (updateError) {
          console.error('Error updating admin profile:', updateError);
        }

        toast({
          title: "Administrador criado com sucesso!",
          description: "Fazendo login automaticamente...",
        });

        // Fazer login automaticamente
        setTimeout(async () => {
          await signIn(adminData.email, adminData.password);
          navigate('/');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Erro ao criar administrador",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Configuração Inicial</h2>
          <p className="mt-2 text-gray-600">Configure o administrador do sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Usuário Administrador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value="Credson Batista" disabled />
            </div>
            
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                value={adminData.email}
                onChange={(e) => setAdminData({...adminData, email: e.target.value})}
              />
            </div>
            
            <div>
              <Label>Senha</Label>
              <Input 
                type="password"
                value={adminData.password}
                onChange={(e) => setAdminData({...adminData, password: e.target.value})}
              />
            </div>
            
            <div>
              <Label>Confirmar Senha</Label>
              <Input 
                type="password"
                value={adminData.confirmPassword}
                onChange={(e) => setAdminData({...adminData, confirmPassword: e.target.value})}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Dados do Administrador:</h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li><strong>Nome:</strong> Credson Batista</li>
                <li><strong>Departamento:</strong> 3ª UJS - CRIMINAL</li>
                <li><strong>Telefone:</strong> 62984452619</li>
                <li><strong>Perfil:</strong> Administrador</li>
              </ul>
            </div>

            <Button 
              onClick={createAdminUser}
              className="w-full"
              disabled={isCreating || adminData.password !== adminData.confirmPassword}
            >
              {isCreating ? "Criando..." : "Criar Administrador e Fazer Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSetup;
