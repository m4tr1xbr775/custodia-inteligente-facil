
-- Primeiro, vamos adicionar uma constraint única para user_id
ALTER TABLE public.contacts ADD CONSTRAINT contacts_user_id_unique UNIQUE (user_id);

-- Limpar todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own contact info" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.contacts;  
DROP POLICY IF EXISTS "Admins can update all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow user registration" ON public.contacts;

-- Criar políticas mais simples para diagnóstico
CREATE POLICY "Allow all authenticated users to read contacts"
  ON public.contacts 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Allow user registration"
  ON public.contacts 
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to update their own contact"
  ON public.contacts 
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid());

-- Garantir que o admin está corretamente vinculado
INSERT INTO public.contacts (
  user_id,
  name,
  email,
  phone,
  mobile,
  department,
  profile,
  active,
  created_at,
  updated_at
) 
SELECT 
  u.id,
  'Credson Batista',
  'm4tr1xbr@gmail.com',
  '62984452619',
  '62984452619',
  '3ª UJS - CRIMINAL',
  'Administrador',
  true,
  now(),
  now()
FROM auth.users u
WHERE u.email = 'm4tr1xbr@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET
  name = EXCLUDED.name,
  profile = EXCLUDED.profile,
  active = EXCLUDED.active,
  updated_at = now();
