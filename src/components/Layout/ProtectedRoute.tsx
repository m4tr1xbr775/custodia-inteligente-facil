
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  resource?: string;
  action?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  resource, 
  action = 'read' 
}) => {
  const { user, userProfile, loading, signOut, hasPermission } = useAuth();
  const location = useLocation();

  const handleBackToLogin = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfil não encontrado</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível encontrar seu perfil no sistema. 
            Entre em contato com o administrador ou tente fazer login novamente.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={handleBackToLogin}
              className="w-full"
              variant="default"
            >
              Voltar ao Login
            </Button>
            <p className="text-sm text-gray-500">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Usuários não ativados só podem acessar audiências (modo leitura)
  if (!userProfile.active) {
    const currentPath = location.pathname;
    
    // Se não estiver na rota de audiências, redirecionar
    if (currentPath !== '/audiencias') {
      return <Navigate to="/audiencias" replace />;
    }
    
    // Se estiver na rota de audiências mas for uma ação que não seja leitura
    if (resource && action !== 'read') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Limitado</h2>
            <p className="text-gray-600 mb-6">
              Sua conta está aguardando aprovação. Você tem acesso apenas à visualização de audiências.
            </p>
            <Button 
              onClick={() => window.location.href = '/audiencias'}
              className="w-full"
              variant="outline"
            >
              Voltar às Audiências
            </Button>
          </div>
        </div>
      );
    }
    
    return <>{children}</>;
  }

  // Verificar permissões para usuários ativos
  if (requireAdmin && userProfile.profile !== 'Administrador') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Você não tem permissão para acessar esta página.</p>
          <Button 
            onClick={handleBackToLogin}
            className="w-full"
            variant="outline"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Verificar permissões específicas de recurso/ação
  if (resource && !hasPermission(resource, action)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sem Permissão</h2>
          <p className="text-gray-600 mb-6">Você não tem permissão para realizar esta ação.</p>
          <Button 
            onClick={() => window.history.back()}
            className="w-full"
            variant="outline"
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
