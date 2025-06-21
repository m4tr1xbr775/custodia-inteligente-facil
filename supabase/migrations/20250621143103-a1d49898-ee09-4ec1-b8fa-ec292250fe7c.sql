
-- Criar tabela de permissões para controle granular de acesso
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  resource text NOT NULL, -- 'audiencias', 'usuarios', 'pautas', 'configuracoes', etc.
  action text NOT NULL, -- 'create', 'read', 'update', 'delete'
  granted boolean NOT NULL DEFAULT false,
  granted_by uuid REFERENCES public.contacts(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource, action)
);

-- Criar tabela de notificações para alertar administradores
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'new_user_registration', 'user_activation_request', etc.
  title text NOT NULL,
  message text NOT NULL,
  user_id uuid REFERENCES public.contacts(id), -- usuário relacionado à notificação
  target_user_id uuid REFERENCES public.contacts(id), -- admin que deve receber a notificação
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb, -- dados extras como link para ação
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar trigger para atualizar updated_at nas novas tabelas
CREATE TRIGGER update_permissions_updated_at
  BEFORE UPDATE ON public.permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Modificar tabela contacts para ter o mesmo ID do auth.users
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para permissions - apenas admins podem gerenciar
CREATE POLICY "Admins can manage all permissions" 
  ON public.permissions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE id = auth.uid() 
      AND profile = 'Administrador' 
      AND active = true
    )
  );

-- Usuários podem ver suas próprias permissões
CREATE POLICY "Users can view own permissions" 
  ON public.permissions 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Políticas para notifications - apenas admins podem ver notificações direcionadas a eles
CREATE POLICY "Admins can view targeted notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (
    target_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE id = auth.uid() 
      AND profile = 'Administrador' 
      AND active = true
    )
  );

-- Admins podem atualizar notificações (marcar como lidas)
CREATE POLICY "Admins can update targeted notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (
    target_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE id = auth.uid() 
      AND profile = 'Administrador' 
      AND active = true
    )
  );

-- Função para criar notificação quando novo usuário se cadastra
CREATE OR REPLACE FUNCTION public.notify_admins_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir notificação para todos os administradores ativos
  INSERT INTO public.notifications (type, title, message, user_id, target_user_id, metadata)
  SELECT 
    'new_user_registration',
    'Novo usuário cadastrado',
    'O usuário ' || NEW.name || ' (' || NEW.email || ') se cadastrou e aguarda aprovação.',
    NEW.id,
    admin.id,
    jsonb_build_object(
      'user_name', NEW.name,
      'user_email', NEW.email,
      'user_profile', NEW.profile,
      'action_url', '/contatos?highlight=' || NEW.id
    )
  FROM public.contacts admin
  WHERE admin.profile = 'Administrador' 
  AND admin.active = true;
  
  RETURN NEW;
END;
$$;

-- Trigger para notificar admins quando novo usuário se cadastra
CREATE TRIGGER notify_new_user_registration
  AFTER INSERT ON public.contacts
  FOR EACH ROW
  WHEN (NEW.active = false)
  EXECUTE FUNCTION public.notify_admins_new_user();

-- Função para criar perfil quando usuário se cadastra via auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Não criar automaticamente o perfil aqui pois será criado no cadastro manual
  RETURN NEW;
END;
$$;

-- Função para verificar permissões do usuário
CREATE OR REPLACE FUNCTION public.user_has_permission(resource_name text, action_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se o usuário está ativo
  IF NOT EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE user_id = auth.uid() 
    AND active = true
  ) THEN
    RETURN false;
  END IF;
  
  -- Administradores têm acesso total
  IF EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE user_id = auth.uid() 
    AND profile = 'Administrador' 
    AND active = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar permissão específica
  RETURN EXISTS (
    SELECT 1 FROM public.permissions p
    JOIN public.contacts c ON c.id = p.user_id
    WHERE c.user_id = auth.uid()
    AND p.resource = resource_name
    AND p.action = action_name
    AND p.granted = true
  );
END;
$$;

-- Atualizar políticas RLS da tabela contacts para usar user_id
DROP POLICY IF EXISTS "Allow public access to contacts" ON public.contacts;

CREATE POLICY "Users can view own contact info" 
  ON public.contacts 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all contacts" 
  ON public.contacts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts admin
      WHERE admin.user_id = auth.uid() 
      AND admin.profile = 'Administrador' 
      AND admin.active = true
    )
  );

CREATE POLICY "Admins can update all contacts" 
  ON public.contacts 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts admin
      WHERE admin.user_id = auth.uid() 
      AND admin.profile = 'Administrador' 
      AND admin.active = true
    )
  );

CREATE POLICY "Allow user registration" 
  ON public.contacts 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());
