
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  department?: string;
  profile: string;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (userData: {
    email: string;
    password: string;
    name: string;
    department: string;
    phone?: string;
    mobile?: string;
    profile: string;
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
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
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Buscando perfil para userId:', userId);
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar perfil do usuário:', error);
        console.log('📊 Detalhes do erro:', {
          message: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details
        });
        
        // Tentar buscar todos os contatos para debug
        const { data: allContacts, error: allError } = await supabase
          .from('contacts')
          .select('*');
          
        if (allError) {
          console.error('❌ Erro ao buscar todos os contatos:', allError);
        } else {
          console.log('📋 Todos os contatos na tabela:', allContacts);
          console.log('🔎 Procurando por user_id:', userId);
          const matchingContact = allContacts?.find(c => c.user_id === userId);
          console.log('🎯 Contato correspondente encontrado:', matchingContact);
        }
        
        return null;
      }

      console.log('✅ Perfil encontrado:', data);
      return data;
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🚀 Inicializando AuthProvider');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, 'User email:', session?.user?.email, 'User ID:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Usuário autenticado, buscando perfil...');
          // Fetch user profile after auth state change
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            console.log('📄 Perfil obtido:', profile);
            setUserProfile(profile);
            setLoading(false);
          }, 0);
        } else {
          console.log('🚫 Nenhum usuário autenticado');
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔍 Verificando sessão existente:', session?.user?.email, 'User ID:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 Sessão existente encontrada, buscando perfil...');
        const profile = await fetchUserProfile(session.user.id);
        console.log('📄 Perfil da sessão existente:', profile);
        setUserProfile(profile);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (userData: {
    email: string;
    password: string;
    name: string;
    department: string;
    phone?: string;
    mobile?: string;
    profile: string;
  }) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (authError) {
        return { error: authError };
      }

      if (authData.user) {
        console.log('📝 Criando perfil para novo usuário:', authData.user.id);
        
        // Create user profile in contacts table
        const { error: profileError } = await supabase
          .from('contacts')
          .insert({
            user_id: authData.user.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            mobile: userData.mobile,
            department: userData.department,
            profile: userData.profile,
            active: false // Default to inactive until admin approval
          });

        if (profileError) {
          console.error('❌ Erro ao criar perfil do usuário:', profileError);
          return { error: profileError };
        }

        console.log('✅ Perfil criado com sucesso');
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Aguarde a aprovação do administrador para acessar o sistema.",
        });
      }

      return { error: null };
    } catch (error) {
      console.error('💥 Erro no signUp:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentando fazer login com:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        return { error };
      }

      console.log('✅ Login realizado com sucesso');
      return { error: null };
    } catch (error) {
      console.error('💥 Erro no signIn:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!userProfile) return false;
    
    // Usuários não ativados só podem visualizar audiências
    if (!userProfile.active) {
      return resource === 'audiencias' && action === 'read';
    }
    
    // Administradores têm acesso total
    if (userProfile.profile === 'Administrador') return true;
    
    // Definir permissões baseadas no perfil
    const profilePermissions = getProfilePermissions(userProfile.profile);
    
    // Verificar se o recurso está permitido para o perfil
    if (!profilePermissions.resources.includes(resource)) {
      return false;
    }
    
    // Por padrão, todos os perfis ativos têm permissão de leitura para recursos permitidos
    if (action === 'read') return true;
    
    // Para outras ações, verificar na tabela permissions (implementação futura via admin)
    // Por enquanto, apenas leitura é permitida para usuários não-admin
    return false;
  };

  const getProfilePermissions = (profile: string) => {
    const permissionsMap: Record<string, { resources: string[] }> = {
      'Advogado': {
        resources: ['dashboard', 'audiencias']
      },
      'Defensor Público': {
        resources: ['dashboard', 'audiencias']
      },
      'Promotor': {
        resources: ['dashboard', 'audiencias']
      },
      'Polícia Penal': {
        resources: ['dashboard', 'unidades', 'unidades-prisionais']
      },
      'Juiz': {
        resources: ['dashboard', 'audiencias', 'unidades', 'unidades-prisionais', 'plantoes']
      },
      'Assessor de Juiz': {
        resources: ['dashboard', 'audiencias', 'unidades', 'unidades-prisionais', 'plantoes']
      },
      'Analista': {
        resources: ['dashboard', 'audiencias', 'unidades', 'unidades-prisionais', 'plantoes']
      },
      'Gestor': {
        resources: ['dashboard', 'audiencias', 'unidades', 'unidades-prisionais', 'plantoes']
      }
    };

    return permissionsMap[profile] || { resources: ['dashboard'] };
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
