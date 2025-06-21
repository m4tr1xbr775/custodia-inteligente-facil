
-- Inserir o usuário administrador diretamente na tabela contacts
-- O user_id será definido após o cadastro via auth
INSERT INTO public.contacts (
  name,
  email,
  phone,
  mobile,
  department,
  profile,
  active,
  created_at,
  updated_at
) VALUES (
  'Credson Batista',
  'm4tr1xbr@gmail.com',
  '62984452619',
  '62984452619',
  '3ª UJS - CRIMINAL',
  'Administrador',
  true,
  now(),
  now()
);

-- Corrigir a função de verificação de permissões para usar o user_id corretamente
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

-- Atualizar as políticas RLS para corrigir problemas de referência
DROP POLICY IF EXISTS "Admins can manage all permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can view targeted notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can update targeted notifications" ON public.notifications;

-- Recriar políticas com referências corretas
CREATE POLICY "Admins can manage all permissions" 
  ON public.permissions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE user_id = auth.uid() 
      AND profile = 'Administrador' 
      AND active = true
    )
  );

CREATE POLICY "Admins can view targeted notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE id = target_user_id 
      AND user_id = auth.uid()
      AND profile = 'Administrador' 
      AND active = true
    )
  );

CREATE POLICY "Admins can update targeted notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts 
      WHERE id = target_user_id 
      AND user_id = auth.uid()
      AND profile = 'Administrador' 
      AND active = true
    )
  );

-- Adicionar política para inserção de notificações (sistema interno)
CREATE POLICY "System can insert notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);
