import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile: string;
  active: boolean;
  department?: string;
  phone?: string;
  mobile?: string;
  user_id: string;
  linked_magistrate_id?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasPermission: (resource: string, action?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  const hasPermission = (resource: string, action: string = 'read'): boolean => {
    if (!userProfile) return false;

    // Usuários não ativos só têm acesso a audiências em modo leitura
    if (!userProfile.active) {
      return resource === 'audiencias' && action === 'read';
    }

    // Administradores têm acesso total
    if (userProfile.profile === 'Administrador') {
      return true;
    }

    // Controle de acesso por perfil
    const profile = userProfile.profile;

    // Páginas exclusivas do administrador
    const adminOnlyResources = ['contatos', 'configuracoes', 'historico'];
    if (adminOnlyResources.includes(resource)) {
      return false;
    }

    // Policial Penal: Dashboard, Agenda de Contatos, Unidades Prisionais, UPR Audiências
    if (profile === 'Policial Penal') {
      return ['dashboard', 'plantoes', 'unidades', 'unidades-prisionais'].includes(resource);
    }

    // Perfis com acesso limitado (apenas dashboard e audiências)
    const limitedProfiles = ['Defensor Público', 'Promotor'];
    if (limitedProfiles.includes(profile)) {
      return ['dashboard', 'audiencias'].includes(resource);
    }

    // Assessor de Juiz: todas as abas exceto admin + aba exclusiva
    if (profile === 'Assessor de Juiz') {
      const allowedResources = ['dashboard', 'audiencias', 'plantoes', 'unidades', 'unidades-prisionais', 'assessor-dashboard'];
      return allowedResources.includes(resource);
    }

    // Demais perfis (Magistrado, Analista): todas as abas exceto admin
    const fullAccessProfiles = ['Magistrado', 'Analista'];
    if (fullAccessProfiles.includes(profile)) {
      return !adminOnlyResources.includes(resource);
    }

    return false;
  };

  useEffect(() => {
    // Configurar listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Buscar perfil do usuário com setTimeout para evitar problemas de sincronização
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
            setLoading(false);
          }, 0);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signOut,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
