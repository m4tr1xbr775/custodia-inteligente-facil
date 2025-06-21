
-- Corrigir as políticas RLS da tabela contacts para evitar recursão infinita
DROP POLICY IF EXISTS "Users can view own contact info" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can update all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow user registration" ON public.contacts;

-- Recriar políticas sem referência circular
CREATE POLICY "Users can view own contact info" 
  ON public.contacts 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all contacts" 
  ON public.contacts 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
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
    user_id = auth.uid() OR
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

-- Atualizar o registro do admin para vincular com o user_id correto
-- Primeiro, vamos verificar se existe um usuário com esse email no auth
-- Se existir, vamos atualizar o registro na tabela contacts
UPDATE public.contacts 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'm4tr1xbr@gmail.com' 
  LIMIT 1
)
WHERE email = 'm4tr1xbr@gmail.com' 
AND user_id IS NULL;
